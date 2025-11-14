// db/db.go (equivalent to db/__init__.py)
package db

import (
	"database/sql"
	"fmt"

	"github.com/topper3418/led-hub/golang-server/models"
)

// Interfaces mirror Python's Database*Interface
type DevicesInterface struct {
	db *sql.DB
}

func (di *DevicesInterface) Create(device *models.Device) error {
	return CreateDevice(di.db, device)
}

func (di *DevicesInterface) Update(device *models.Device) error {
	return UpdateDevice(di.db, device)
}

func (di *DevicesInterface) Ping(deviceID int) error {
	return RecordPing(di.db, deviceID)
}

func (di *DevicesInterface) Delete(deviceID int) error {
	return DeleteDevice(di.db, deviceID)
}

func (di *DevicesInterface) FindByID(deviceID int) (*models.Device, error) {
	return FindDeviceByID(di.db, deviceID)
}

func (di *DevicesInterface) FindByMac(mac string) (*models.Device, error) {
	return FindByMac(di.db, mac)
}

func (di *DevicesInterface) FindByName(name string) (*models.Device, error) {
	return FindByName(di.db, name)
}

func (di *DevicesInterface) FindMany(room *int, connected *bool) ([]*models.Device, error) {
	return ListDevices(di.db, room, connected)
}

type RoomsInterface struct {
	db *sql.DB
}

func (ri *RoomsInterface) Create(room *models.Room) error {
	return CreateRoom(ri.db, room)
}

func (ri *RoomsInterface) Update(room *models.Room) error {
	return UpdateRoom(ri.db, room)
}

func (ri *RoomsInterface) Delete(roomID int) error {
	return DeleteRoom(ri.db, roomID)
}

func (ri *RoomsInterface) FindByID(roomID int) (*models.Room, error) {
	room, err := FindRoomByID(ri.db, roomID)
	if err != nil || room == nil {
		return room, err
	}
	// Load led_strips for this room (like Python)
	ledStrips, err := ListLedStrips(ri.db, &roomID)
	if err != nil {
		return nil, err
	}
	room.LedStrips = ledStrips
	return room, nil
}

func (ri *RoomsInterface) FindMany() ([]*models.Room, error) {
	return ListRooms(ri.db)
}

type LedStripsInterface struct {
	db *sql.DB
}

func (lsi *LedStripsInterface) Create(ls *models.LedStrip) error {
	return CreateLedStrip(lsi.db, ls)
}

func (lsi *LedStripsInterface) Update(ls *models.LedStrip) error {
	return UpdateLedStrip(lsi.db, ls)
}

func (lsi *LedStripsInterface) Delete(ledStripID int) error {
	return DeleteLedStrip(lsi.db, ledStripID)
}

func (lsi *LedStripsInterface) FindByID(ledStripID int) (*models.LedStrip, error) {
	return FindLedStripByID(lsi.db, ledStripID)
}

func (lsi *LedStripsInterface) FindByDeviceID(deviceID int) (*models.LedStrip, error) {
	return FindLedStripByDeviceID(lsi.db, deviceID)
}

func (lsi *LedStripsInterface) FindMany(roomID *int) ([]*models.LedStrip, error) {
	return ListLedStrips(lsi.db, roomID)
}

func (lsi *LedStripsInterface) FindManyDevices(roomID *int, includeRoomData bool) ([]*models.Device, error) {
	return ListLedStripDevices(lsi.db, roomID, includeRoomData)
}

// Database - main context manager
type Database struct {
	connPath string
	db       *sql.DB
	Devices  *DevicesInterface
	Rooms    *RoomsInterface
	LedStrips *LedStripsInterface
}

func NewDatabase(connPath string) *Database {
	return &Database{
		connPath: connPath,
	}
}

func (d *Database) InitDB() error {
	if d.db == nil {
		return fmt.Errorf("must have valid connection to init db")
	}
	if err := InitRooms(d.db); err != nil {
		return err
	}
	if err := InitDevices(d.db); err != nil {
		return err
	}
	return InitLedStrips(d.db)
}

// Open - like __enter__ / open_connection
func (d *Database) Open() error {
	if d.db != nil {
		return fmt.Errorf("connection is already open")
	}
	conn, err := GetConnection(d.connPath)
	if err != nil {
		return err
	}
	d.db = conn
	d.Devices = &DevicesInterface{db: d.db}
	d.Rooms = &RoomsInterface{db: d.db}
	d.LedStrips = &LedStripsInterface{db: d.db}
	return nil
}

// Close - like __exit__ / close_connection
func (d *Database) Close() error {
	if d.db == nil {
		return fmt.Errorf("connection is not open")
	}
	d.Commit()
	d.db.Close()
	d.db = nil
	d.Devices = nil
	d.Rooms = nil
	d.LedStrips = nil
	return nil
}

func (d *Database) Commit() error {
	if d.db == nil {
		return fmt.Errorf("connection is not open")
	}
	// sqlite3 in Go doesn't require explicit commit unless in transaction
	// But to match Python behavior, assume auto-commit unless tx used.
	return nil
}

// Usage example (context manager pattern):
/*
db := db.NewDatabase(config.DATABASE_PATH)
if err := db.Open(); err != nil { ... }
defer db.Close()

// Or manual:
db.Open()
defer db.Close()
*/
