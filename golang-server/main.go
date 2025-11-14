// main.go (or app.go)
package main

import (
	"github.com/gin-gonic/gin"
	"github.com/topper3418/led-hub/golang-server/api"
)

func main() {
	r := gin.Default()
	v1 := r.Group("/api/v1")
	api.RegisterRooms(v1, "path/to/db.sqlite")
	api.RegisterDevices(v1, "path/to/db.sqlite")
	api.RegisterLedStrips(v1, "path/to/db.sqlite")
	r.Run(":8080")
}
