// api/middleware.go
package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/topper3418/led-hub/golang-server/db"
	"github.com/topper3418/led-hub/golang-server/models"
)

// DB middleware: open/close per request
func DBMiddleware(dbPath string) gin.HandlerFunc {
	return func(c *gin.Context) {
		database := db.NewDatabase(dbPath)
		if err := database.Open(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open db"})
			c.Abort()
			return
		}
		c.Set("db", database)
		defer func() {
			database.Close()
			if err := recover(); err != nil {
				// log panic
			}
		}()
		c.Next()
	}
}

// ensureNotNil: 404 if context key missing or nil
func EnsureNotNil(key string) gin.HandlerFunc {
	return func(c *gin.Context) {
		val, exists := c.Get(key)
		if !exists || val == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": key + " not found"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// dataHas: extract from JSON body.data, set to context
func DataHas(key string, optional bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Data map[string]interface{} `json:"data"`
		}
		if err := c.ShouldBindJSON(&input); err != nil && !optional {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			c.Abort()
			return
		}
		data := input.Data
		if data == nil {
			data = make(map[string]interface{})
		}
		val, exists := data[key]
		if !exists && !optional {
			c.JSON(http.StatusBadRequest, gin.H{"error": key + " is missing from data"})
			c.Abort()
			return
		}
		c.Set(key, val)
		c.Set("data", data)
		c.Next()
	}
}

// loadDevice: from URL param
func LoadDevice() gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("device_id")
		if idStr == "" {
			c.Next()
			return
		}
		id, _ := strconv.Atoi(idStr)
		database := c.MustGet("db").(*db.Database)
		device, err := database.Devices.FindByID(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
			c.Abort()
			return
		}
		c.Set("device", device)
		c.Next()
	}
}

// loadRoom: from URL param, special case room_id=0
func LoadRoom() gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("room_id")
		if idStr == "" {
			c.Next()
			return
		}
		id, _ := strconv.Atoi(idStr)
		if id == 0 {
			c.Set("room", &models.Room{Name: "Misc"})
			c.Next()
			return
		}
		database := c.MustGet("db").(*db.Database)
		room, err := database.Rooms.FindByID(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
			c.Abort()
			return
		}
		c.Set("room", room)
		c.Next()
	}
}

// loadLedStrip: from URL param
func LoadLedStrip() gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("led_strip_id")
		if idStr == "" {
			c.Next()
			return
		}
		id, _ := strconv.Atoi(idStr)
		database := c.MustGet("db").(*db.Database)
		ls, err := database.LedStrips.FindByID(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
			c.Abort()
			return
		}
		c.Set("led_strip", ls)
		c.Next()
	}
}
