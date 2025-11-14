package api

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/topper3418/led-hub/golang-server/models"
	"github.com/topper3418/led-hub/golang-server/db"
)

// structToMap converts any struct to map[string]interface{}
func structToMap(v interface{}) map[string]interface{} {
	b, _ := json.Marshal(v)
	var m map[string]interface{}
	json.Unmarshal(b, &m)
	return m
}

// toSliceMap converts []T → []map[string]interface{}
func toSliceMap[T any](items []T) []map[string]interface{} {
	var out []map[string]interface{}
	for _, item := range items {
		out = append(out, structToMap(item))
	}
	return out
}

func UpdateLedStrip(c *gin.Context) {
	lsInterface, _ := c.Get("led_strip")
	ls := lsInterface.(*models.LedStrip)
	fallback := func(key string) int {
		if val, ok := c.Get(key); ok {
			if v, ok := val.(float64); ok && v >= 0 {
				return int(v)
			}
		}
		switch key {
		case "red":
			return ls.Red
		case "green":
			return ls.Green
		case "blue":
			return ls.Blue
		case "brightness":
			return ls.Brightness
		}
		return 0
	}
	onVal, _ := c.Get("on")
	on := ls.On
	if v, ok := onVal.(bool); ok {
		on = v
	}
	updated := &models.LedStrip{
		ID:         ls.ID,
		DeviceID:   ls.DeviceID,
		NumLeds:    ls.NumLeds,
		LedPin:     ls.LedPin,
		Red:        fallback("red"),
		Green:      fallback("green"),
		Blue:       fallback("blue"),
		Brightness: fallback("brightness"),
		On:         on,
	}
	database := c.MustGet("db").(*db.Database)
	database.LedStrips.Update(updated)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"led_strip": structToMap(updated)}})
}

