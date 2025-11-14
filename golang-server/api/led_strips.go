package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/topper3418/led-hub/golang-server/db"
	"github.com/topper3418/led-hub/golang-server/models"
)

func RegisterLedStrips(r *gin.RouterGroup, dbPath string) {
	ls := r.Group("/led_strips")
	ls.Use(DBMiddleware(dbPath), LoadLedStrip())

	ls.GET("/", getLedStrips)
	ls.PUT("/", updateManyLedStrips)
	ls.GET("/:led_strip_id", readLedStripState)
	ls.PUT("/:led_strip_id",
		DataHas("color", true), DataHas("brightness", true), DataHas("on", true),
		updateLedStripState,
	)
}

func getLedStrips(c *gin.Context) {
	roomIDStr := c.Query("room_id")
	var roomID *int
	if roomIDStr != "" {
		id, _ := strconv.Atoi(roomIDStr)
		roomID = &id
	}
	database := c.MustGet("db").(*db.Database)
	devs, _ := database.LedStrips.FindManyDevices(roomID, false)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"devices": toSliceMap(devs)}})
}

func updateManyLedStrips(c *gin.Context) {
	var input struct {
		Data []map[string]interface{} `json:"data"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	database := c.MustGet("db").(*db.Database)
	for _, item := range input.Data {
		idFloat, ok := item["id"].(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no id provided"})
			return
		}
		ls := &models.LedStrip{ID: int(idFloat)}
		if v, ok := item["on"].(bool); ok {
			ls.On = v
		}
		if v, ok := item["brightness"].(float64); ok {
			ls.Brightness = int(v)
		}
		if v, ok := item["red"].(float64); ok {
			ls.Red = int(v)
		}
		if v, ok := item["green"].(float64); ok {
			ls.Green = int(v)
		}
		if v, ok := item["blue"].(float64); ok {
			ls.Blue = int(v)
		}
		database.LedStrips.Update(ls)
	}
	c.JSON(http.StatusCreated, gin.H{"data": input.Data})
}

func readLedStripState(c *gin.Context) {
	ls := c.MustGet("led_strip").(*models.LedStrip)
	c.JSON(http.StatusOK, gin.H{"data": structToMap(ls)})
}

