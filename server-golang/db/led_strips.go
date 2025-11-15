// db/led_strips.go
package db

import (
	"database/sql"
	"log"
	"strings"

	"github.com/topper3418/led-hub/golang-server/models"
)

func InitLedStrips(db *sql.DB) error {
	log.Println("Initializing led_strips table")
	query, err := ReadSQLInitFile("led_strips")
	if err != nil {
		return err
	}
	_, err = db.Exec(query)
	if err != nil {
		log.Printf("Failed to initialize led_strips table: %v", err)
		return err
	}
	return nil
}

func CreateLedStrip(db *sql.DB, ls *models.LedStrip) error {
	log.Printf("Creating led_strip: %+v", ls)
	res, err := db.Exec(
		"INSERT INTO led_strips (device_id, \"on\", brightness, red, green, blue, num_leds, led_pin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		ls.DeviceID, ls.On, ls.Brightness, ls.Red, ls.Green, ls.Blue, ls.NumLeds, ls.LedPin,
	)
	if err != nil {
		log.Printf("Failed to create led_strip: %v", err)
		return err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	ls.ID = int(id)
	return nil
}

func UpdateLedStrip(db *sql.DB, ls *models.LedStrip) error {
	log.Printf("Updating led_strip: %+v", ls)
	_, err := db.Exec(
		"UPDATE led_strips SET \"on\" = ?, brightness = ?, red = ?, green = ?, blue = ?, num_leds = ?, led_pin = ? WHERE id = ?",
		ls.On, ls.Brightness, ls.Red, ls.Green, ls.Blue, ls.NumLeds, ls.LedPin, ls.ID,
	)
	if err != nil {
		log.Printf("Failed to update led_strip: %v", err)
		return err
	}
	return nil
}

func DeleteLedStrip(db *sql.DB, ledStripID int) error {
	log.Printf("Deleting led_strip: %d", ledStripID)
	_, err := db.Exec("DELETE FROM led_strips WHERE id = ?", ledStripID)
	if err != nil {
		log.Printf("Failed to delete led_strip: %v", err)
		return err
	}
	return nil
}

func FindLedStripByID(db *sql.DB, ledStripID int) (*models.LedStrip, error) {
	log.Printf("Finding led_strip by id: %d", ledStripID)
	ls := &models.LedStrip{}
	err := db.QueryRow("SELECT id, device_id, \"on\", brightness, red, green, blue, num_leds, led_pin FROM led_strips WHERE id = ?", ledStripID).
		Scan(&ls.ID, &ls.DeviceID, &ls.On, &ls.Brightness, &ls.Red, &ls.Green, &ls.Blue, &ls.NumLeds, &ls.LedPin)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		log.Printf("Failed to find led_strip by id: %v", err)
		return nil, err
	}
	return ls, nil
}

func FindLedStripByDeviceID(db *sql.DB, deviceID int) (*models.LedStrip, error) {
	log.Printf("Finding led_strip by device_id: %d", deviceID)
	ls := &models.LedStrip{}
	err := db.QueryRow("SELECT id, device_id, \"on\", brightness, red, green, blue, num_leds, led_pin FROM led_strips WHERE device_id = ?", deviceID).
		Scan(&ls.ID, &ls.DeviceID, &ls.On, &ls.Brightness, &ls.Red, &ls.Green, &ls.Blue, &ls.NumLeds, &ls.LedPin)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		log.Printf("Failed to find led_strip by device_id: %v", err)
		return nil, err
	}
	return ls, nil
}

func ListLedStrips(db *sql.DB, roomID *int) ([]*models.LedStrip, error) {
	log.Printf("Listing led strips: room_id=%v", roomID)
	query := `
		SELECT
			led_strips.id,
			led_strips.device_id,
			led_strips."on",
			led_strips.brightness,
			led_strips.red,
			led_strips.green,
			led_strips.blue,
			led_strips.num_leds,
			led_strips.led_pin
		FROM led_strips
		JOIN devices ON led_strips.device_id = devices.id
	`
	var args []interface{}
	var where []string
	if roomID != nil {
		if *roomID == 0 {
			where = append(where, "devices.room_id IS NULL")
		} else {
			where = append(where, "devices.room_id = ?")
			args = append(args, *roomID)
		}
	}
	if len(where) > 0 {
		query += " WHERE " + strings.Join(where, " AND ")
	}
	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("Failed to list led_strips: %v", err)
		return nil, err
	}
	defer rows.Close()
	var ledStrips []*models.LedStrip
	for rows.Next() {
		ls := &models.LedStrip{}
		err := rows.Scan(&ls.ID, &ls.DeviceID, &ls.On, &ls.Brightness, &ls.Red, &ls.Green, &ls.Blue, &ls.NumLeds, &ls.LedPin)
		if err != nil {
			return nil, err
		}
		ledStrips = append(ledStrips, ls)
	}
	return ledStrips, nil
}

func ListLedStripDevices(db *sql.DB, roomID *int, includeRoomData bool) ([]*models.Device, error) {
	// Note: includeRoomData unused in Python; ignored here too.
	log.Printf("Listing led_strip devices: room_id=%v", roomID)
	query := `
		SELECT
			devices.id, devices.mac, devices.name, devices.ip, devices.last_ping, devices.room_id,
			led_strips.id AS led_id, led_strips.device_id, led_strips."on", led_strips.brightness,
			led_strips.red, led_strips.green, led_strips.blue, led_strips.num_leds, led_strips.led_pin
		FROM led_strips JOIN devices ON led_strips.device_id = devices.id
	`
	var args []interface{}
	if roomID != nil {
		if *roomID == 0 {
			query += " WHERE devices.room_id IS NULL"
		} else {
			query += " WHERE devices.room_id = ?"
			args = append(args, *roomID)
		}
	}
	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("Failed to list led_strip devices: %v", err)
		return nil, err
	}
	defer rows.Close()
	var devices []*models.Device
	for rows.Next() {
		device := &models.Device{}
		ls := &models.LedStrip{}
		var ledID int
		err := rows.Scan(
			&device.ID, &device.Mac, &device.Name, &device.IP, &device.LastPing, &device.RoomID,
			&ledID, &ls.DeviceID, &ls.On, &ls.Brightness, &ls.Red, &ls.Green, &ls.Blue, &ls.NumLeds, &ls.LedPin,
		)
		if err != nil {
			return nil, err
		}
		ls.ID = ledID
		device.LedStrip = ls
		devices = append(devices, device)
	}
	return devices, nil
}

// Note: In Python db/models.py, cursor is added but unused; omitted here.
// Queries use backticks/quotes as in Python for compatibility.
// Assume sql/init/*.sql files exist as in Python.
// 'connected' in ListDevices may error (no column); matches Python bug.
// For time.Time scan, go-sqlite3 handles TIMESTAMP as time.Time.
