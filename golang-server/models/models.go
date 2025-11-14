// models.go (at root, equivalent to Python models.py)
package models // or models, but for simplicity

import (
	"time"
)

type Room struct {
	ID       int       `json:"id,omitempty"`
	Name     string    `json:"name"`
	Devices  []*Device `json:"devices,omitempty"`
	LedStrips []*LedStrip `json:"led_strips,omitempty"`
}

type Device struct {
	ID       int        `json:"id,omitempty"`
	Mac      string     `json:"mac"`
	Name     *string    `json:"name,omitempty"`
	IP       string     `json:"ip"`
	LastPing *time.Time `json:"last_ping,omitempty"`
	RoomID   *int       `json:"room_id,omitempty"`
	Room     *Room      `json:"room,omitempty"`
	LedStrip *LedStrip  `json:"led_strip,omitempty"`
}

func (d *Device) Identifier() string {
	if d.Name != nil {
		return *d.Name
	}
	return d.Mac
}

func (d *Device) CreateLedStripState() *LedStrip {
	return &LedStrip{DeviceID: d.ID}
}

type Color struct {
	R int `json:"r"`
	G int `json:"g"`
	B int `json:"b"`
}

type LedStrip struct {
	ID         int    `json:"id,omitempty"`
	DeviceID   int    `json:"device_id"`
	On         bool   `json:"on"`
	Brightness int    `json:"brightness"`
	Red        int    `json:"red"`
	Green      int    `json:"green"`
	Blue       int    `json:"blue"`
	NumLeds    int    `json:"num_leds"`
	LedPin     int    `json:"led_pin"`
	Device     *Device `json:"device,omitempty"`
	Room       *Room   `json:"room,omitempty"`
}

func (ls *LedStrip) Color() Color {
	return Color{R: ls.Red, G: ls.Green, B: ls.Blue}
}

func (ls *LedStrip) SetColor(c Color) {
	ls.Red = c.R
	ls.Green = c.G
	ls.Blue = c.B
}

// Note: No BaseModelWithDateTime equivalent yet; handle ISO formatting in API layer if needed.
// No pydantic validation; use manual checks or external lib if required later.
