package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/topper3418/led-hub/golang-server/db"
	"github.com/topper3418/led-hub/golang-server/models"
)

func RegisterDevices(r *gin.RouterGroup, dbPath string) {
	devs := r.Group("/devices")
	devs.Use(DBMiddleware(dbPath), LoadDevice())

	devs.GET("/", getDevices)
	devs.POST("/", DataHas("mac", false), DataHas("ip", false), handshake)
	devs.GET("/:device_id", EnsureNotNil("device"), readDevice)
	devs.PUT("/:device_id", EnsureNotNil("device"),
		DataHas("room_id", true), DataHas("name", true),
		DataHas("num_leds", true), DataHas("led_pin", true),
		updateDevice,
	)
	devs.DELETE("/:device_id", EnsureNotNil("device"), deleteDevice)
	devs.PUT("/:device_id/led_strip",
		DataHas("red", true), DataHas("green", true), DataHas("blue", true),
		DataHas("brightness", true), DataHas("on", true), EnsureNotNil("device"),
		updateLedStripState,
	)
	devs.GET("/:device_id/led_strip", EnsureNotNil("device"), ledStripPing)
}

func getDevices(c *gin.Context) {
	roomIDStr := c.Query("room_id")
	var roomID *int
	if roomIDStr != "" {
		id, _ := strconv.Atoi(roomIDStr)
		roomID = &id
	}
	database := c.MustGet("db").(*db.Database)
	devices, _ := database.Devices.FindMany(roomID, nil)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"devices": toSliceMap(devices)}})
}

func handshake(c *gin.Context) {
	macVal, _ := c.Get("mac")
	ipVal, _ := c.Get("ip")
	mac, _ := macVal.(string)
	ip, _ := ipVal.(string)

	device := &models.Device{Mac: mac, IP: ip}
	database := c.MustGet("db").(*db.Database)

	existing, _ := database.Devices.FindByMac(mac)
	if existing != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Device already exists",
			"data":    structToMap(existing),
		})
		return
	}

	database.Devices.Create(device)
	ls := device.CreateLedStripState()
	database.LedStrips.Create(ls)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Device created",
		"data":    structToMap(device),
	})
}

func updateDevice(c *gin.Context) {
	device := c.MustGet("device").(*models.Device)
	database := c.MustGet("db").(*db.Database)

	if nameVal, ok := c.Get("name"); ok {
		if name, ok := nameVal.(string); ok {
			device.Name = &name
		}
	}
	if roomIDVal, ok := c.Get("room_id"); ok {
		if roomIDFloat, ok := roomIDVal.(float64); ok {
			roomID := int(roomIDFloat)
			if _, err := database.Rooms.FindByID(roomID); err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
				return
			}
			device.RoomID = &roomID
		}
	}

	database.Devices.Update(device)

	// LED strip config
	if numLedsVal, ok := c.Get("num_leds"); ok {
		if numLeds, ok := numLedsVal.(float64); ok {
			ls, _ := database.LedStrips.FindByDeviceID(device.ID)
			if ls == nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "no led strip"})
				return
			}
			ls.NumLeds = int(numLeds)
			if ledPinVal, ok := c.Get("led_pin"); ok {
				if ledPin, ok := ledPinVal.(float64); ok {
					ls.LedPin = int(ledPin)
				}
			}
			database.LedStrips.Update(ls)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"device":  structToMap(device),
			"message": "successfully updated device",
		},
	})
}

func readDevice(c *gin.Context) {
	device := c.MustGet("device").(*models.Device)
	database := c.MustGet("db").(*db.Database)
	ls, _ := database.LedStrips.FindByDeviceID(device.ID)
	device.LedStrip = ls
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"device": structToMap(device)}})
}

func deleteDevice(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("device_id"))
	database := c.MustGet("db").(*db.Database)
	database.Devices.Delete(id)
	c.JSON(http.StatusOK, gin.H{"message": "successfully deleted device with id " + c.Param("device_id")})
}

func updateLedStripState(c *gin.Context) {
	device := c.MustGet("device").(*models.Device)
	database := c.MustGet("db").(*db.Database)
	ls, _ := database.LedStrips.FindByDeviceID(device.ID)
	if ls == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no led strip"})
		return
	}
	c.Set("led_strip", ls)
	UpdateLedStrip(c)
}

func ledStripPing(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("device_id"))
	database := c.MustGet("db").(*db.Database)
	ls, _ := database.LedStrips.FindByDeviceID(id)
	if ls == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "no led strip"})
		return
	}
	database.Devices.Ping(id)
	c.JSON(http.StatusOK, gin.H{"data": structToMap(ls)})
}
