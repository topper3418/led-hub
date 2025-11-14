package api

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/topper3418/led-hub/golang-server/db"
	"github.com/topper3418/led-hub/golang-server/models"
)

func RegisterRooms(r *gin.RouterGroup, dbPath string) {
	rooms := r.Group("/rooms")
	rooms.Use(DBMiddleware(dbPath), LoadRoom())

	rooms.GET("/", listRooms)
	rooms.POST("/", DataHas("name", true), createRoom)
	rooms.GET("/:room_id", EnsureNotNil("room"), getRoom)
	rooms.PUT("/:room_id", EnsureNotNil("room"), DataHas("name", false), updateRoom)
	rooms.DELETE("/:room_id", EnsureNotNil("room"), deleteRoom)
	rooms.PUT("/:room_id/led_strips",
		DataHas("red", true), DataHas("green", true), DataHas("blue", true),
		DataHas("brightness", true), DataHas("on", true), EnsureNotNil("room"),
		updateLedStripsInRoom,
	)
}

func listRooms(c *gin.Context) {
	database := c.MustGet("db").(*db.Database)
	rooms, _ := database.Rooms.FindMany()
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"rooms": toSliceMap(rooms)}})
}

func createRoom(c *gin.Context) {
	database := c.MustGet("db").(*db.Database)
	nameVal, _ := c.Get("name")
	name := ""
	if n, ok := nameVal.(string); ok && n != "" {
		name = n
	} else {
		rooms, _ := database.Rooms.FindMany()
		maxID := 0
		for _, r := range rooms {
			if r.ID > maxID {
				maxID = r.ID
			}
		}
		name = "Room " + strconv.Itoa(maxID+1)
	}
	room := &models.Room{Name: name}
	if err := database.Rooms.Create(room); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "Room created",
		"data":    structToMap(room),
	})
}

func getRoom(c *gin.Context) {
	room := c.MustGet("room").(*models.Room)
	include := strings.Split(c.Query("include"), ",")
	for i := range include {
		include[i] = strings.TrimSpace(include[i])
	}
	database := c.MustGet("db").(*db.Database)
	response := structToMap(room)
	if contains(include, "led_strip_devices") {
		devs, _ := database.LedStrips.FindManyDevices(&room.ID, false)
		response["devices"] = toSliceMap(devs)
	} else if contains(include, "led_strips") {
		strips, _ := database.LedStrips.FindMany(&room.ID)
		response["led_strips"] = toSliceMap(strips)
	}
	if contains(include, "devices") {
		devs, _ := database.Devices.FindMany(&room.ID, nil)
		response["devices"] = toSliceMap(devs)
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"room": response}})
}

func updateRoom(c *gin.Context) {
	room := c.MustGet("room").(*models.Room)
	nameVal, _ := c.Get("name")
	if name, ok := nameVal.(string); ok {
		room.Name = name
	}
	database := c.MustGet("db").(*db.Database)
	database.Rooms.Update(room)
	c.JSON(http.StatusOK, gin.H{
		"message": "Room updated",
		"data":    structToMap(room),
	})
}

func deleteRoom(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("room_id"))
	database := c.MustGet("db").(*db.Database)
	database.Rooms.Delete(id)
	c.JSON(http.StatusOK, gin.H{"message": "Room deleted"})
}

func updateLedStripsInRoom(c *gin.Context) {
	room := c.MustGet("room").(*models.Room)
	database := c.MustGet("db").(*db.Database)
	devices, _ := database.LedStrips.FindManyDevices(&room.ID, false)
	for _, dev := range devices {
		ls := dev.LedStrip
		if ls == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "device has no led strip"})
			return
		}
		if vVal, ok := c.Get("red"); ok {
			if v, ok := vVal.(float64); ok {
				ls.Red = int(v)
			}
		}
		if vVal, ok := c.Get("green"); ok {
			if v, ok := vVal.(float64); ok {
				ls.Green = int(v)
			}
		}
		if vVal, ok := c.Get("blue"); ok {
			if v, ok := vVal.(float64); ok {
				ls.Blue = int(v)
			}
		}
		if vVal, ok := c.Get("brightness"); ok {
			if v, ok := vVal.(float64); ok {
				ls.Brightness = int(v)
			}
		}
		if vVal, ok := c.Get("on"); ok {
			if v, ok := vVal.(bool); ok {
				ls.On = v
			}
		}
		database.LedStrips.Update(ls)
	}
	c.JSON(http.StatusOK, gin.H{"data": c.MustGet("data")})
}

func contains(arr []string, s string) bool {
	for _, v := range arr {
		if v == s {
			return true
		}
	}
	return false
}
