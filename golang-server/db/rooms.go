// db/rooms.go
package db

import (
	"database/sql"
	"log"

	"github.com/topper3418/led-hub/golang-server/models" // Assume models import path.
)

func InitRooms(db *sql.DB) error {
	log.Println("Initializing rooms table")
	query, err := ReadSQLInitFile("rooms")
	if err != nil {
		return err
	}
	_, err = db.Exec(query)
	if err != nil {
		log.Printf("Failed to initialize rooms table: %v", err)
		return err
	}
	return nil
}

func CreateRoom(db *sql.DB, room *models.Room) error {
	log.Printf("Creating room: %+v", room)
	res, err := db.Exec("INSERT INTO rooms (name) VALUES (?)", room.Name)
	if err != nil {
		log.Printf("Failed to create room: %v", err)
		return err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	room.ID = int(id)
	return nil
}

func UpdateRoom(db *sql.DB, room *models.Room) error {
	log.Printf("Updating room: %+v", room)
	_, err := db.Exec("UPDATE rooms SET name = ? WHERE id = ?", room.Name, room.ID)
	if err != nil {
		log.Printf("Failed to update room: %v", err)
		return err
	}
	return nil
}

func DeleteRoom(db *sql.DB, roomID int) error {
	log.Printf("Deleting room: %d", roomID)
	_, err := db.Exec("DELETE FROM rooms WHERE id = ?", roomID)
	if err != nil {
		log.Printf("Failed to delete room: %v", err)
		return err
	}
	return nil
}

func FindRoomByID(db *sql.DB, roomID int) (*models.Room, error) {
	log.Printf("Finding room by id: %d", roomID)
	room := &models.Room{}
	err := db.QueryRow("SELECT id, name FROM rooms WHERE id = ?", roomID).Scan(&room.ID, &room.Name)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		log.Printf("Failed to find room by id: %v", err)
		return nil, err
	}
	return room, nil
}

func ListRooms(db *sql.DB) ([]*models.Room, error) {
	log.Println("Listing rooms")
	rows, err := db.Query("SELECT id, name FROM rooms")
	if err != nil {
		log.Printf("Failed to list rooms: %v", err)
		return nil, err
	}
	defer rows.Close()
	var rooms []*models.Room
	for rows.Next() {
		room := &models.Room{}
		if err := rows.Scan(&room.ID, &room.Name); err != nil {
			return nil, err
		}
		rooms = append(rooms, room)
	}
	return rooms, nil
}
