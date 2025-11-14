// db/devices.go
package db

import (
	"database/sql"
	"log"
	"strings"

	"github.com/topper3418/led-hub/golang-server/models"
)

func InitDevices(db *sql.DB) error {
	log.Println("Initializing devices table")
	query, err := ReadSQLInitFile("devices")
	if err != nil {
		return err
	}
	_, err = db.Exec(query)
	if err != nil {
		log.Printf("Failed to initialize devices table: %v", err)
		return err
	}
	return nil
}

func CreateDevice(db *sql.DB, device *models.Device) error {
	log.Printf("Creating device: %+v", device)
	res, err := db.Exec("INSERT INTO devices (mac, ip, name) VALUES (?, ?, ?)", device.Mac, device.IP, device.Name)
	if err != nil {
		log.Printf("Failed to create device: %v", err)
		return err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	device.ID = int(id)
	return nil
}

func UpdateDevice(db *sql.DB, device *models.Device) error {
	log.Printf("Updating device: %+v", device)
	_, err := db.Exec("UPDATE devices SET mac = ?, ip = ?, name = ?, room_id = ? WHERE id = ?", device.Mac, device.IP, device.Name, device.RoomID, device.ID)
	if err != nil {
		log.Printf("Failed to update device: %v", err)
		return err
	}
	return nil
}

func RecordPing(db *sql.DB, deviceID int) error {
	log.Printf("Recording ping for device: %d", deviceID)
	_, err := db.Exec("UPDATE devices SET last_ping = CURRENT_TIMESTAMP WHERE id = ?", deviceID)
	if err != nil {
		log.Printf("Failed to record ping: %v", err)
		return err
	}
	return nil
}

func DeleteDevice(db *sql.DB, deviceID int) error {
	log.Printf("Deleting device: %d", deviceID)
	_, err := db.Exec("DELETE FROM devices WHERE id = ?", deviceID)
	if err != nil {
		log.Printf("Failed to delete device: %v", err)
		return err
	}
	return nil
}

func FindDeviceByID(db *sql.DB, deviceID int) (*models.Device, error) {
	log.Printf("Finding device by id: %d", deviceID)
	device := &models.Device{}
	err := db.QueryRow("SELECT id, mac, name, ip, last_ping, room_id FROM devices WHERE id = ?", deviceID).
		Scan(&device.ID, &device.Mac, &device.Name, &device.IP, &device.LastPing, &device.RoomID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		log.Printf("Failed to find device by id: %v", err)
		return nil, err
	}
	return device, nil
}

func FindByMac(db *sql.DB, mac string) (*models.Device, error) {
	log.Printf("Finding device by mac: %s", mac)
	device := &models.Device{}
	err := db.QueryRow("SELECT id, mac, name, ip, last_ping, room_id FROM devices WHERE mac = ?", mac).
		Scan(&device.ID, &device.Mac, &device.Name, &device.IP, &device.LastPing, &device.RoomID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		log.Printf("Failed to find device by mac: %v", err)
		return nil, err
	}
	return device, nil
}

func FindByName(db *sql.DB, name string) (*models.Device, error) {
	log.Printf("Finding device by name: %s", name)
	device := &models.Device{}
	err := db.QueryRow("SELECT id, mac, name, ip, last_ping, room_id FROM devices WHERE name = ?", name).
		Scan(&device.ID, &device.Mac, &device.Name, &device.IP, &device.LastPing, &device.RoomID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		log.Printf("Failed to find device by name: %v", err)
		return nil, err
	}
	return device, nil
}

func ListDevices(db *sql.DB, room *int, connected *bool) ([]*models.Device, error) {
	log.Printf("Listing devices: room=%v, connected=%v", room, connected)
	query := "SELECT id, mac, name, ip, last_ping, room_id FROM devices"
	var args []interface{}
	var where []string
	if room != nil {
		if *room == 0 {
			where = append(where, "room_id IS NULL")
		} else {
			where = append(where, "room_id = ?")
			args = append(args, *room)
		}
	}
	if connected != nil {
		where = append(where, "connected = ?") // Note: Schema lacks 'connected'; this may error like Python. Derive from last_ping if needed later.
		args = append(args, *connected)
	}
	if len(where) > 0 {
		query += " WHERE " + strings.Join(where, " AND ")
	}
	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("Failed to list devices: %v", err)
		return nil, err
	}
	defer rows.Close()
	var devices []*models.Device
	for rows.Next() {
		device := &models.Device{}
		err := rows.Scan(&device.ID, &device.Mac, &device.Name, &device.IP, &device.LastPing, &device.RoomID)
		if err != nil {
			return nil, err
		}
		devices = append(devices, device)
	}
	return devices, nil
}
