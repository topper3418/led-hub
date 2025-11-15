// main.go (or app.go)
package main

import (
	"github.com/gin-gonic/gin"
	"github.com/topper3418/led-hub/golang-server/api"
)

func main() {
	r := gin.Default()
	v1 := r.Group("/api/v1")
	db_path := "data/ledhub.db"
	api.RegisterRooms(v1, db_path)
	api.RegisterDevices(v1, db_path)
	api.RegisterLedStrips(v1, db_path)
	r.Run(":8080")
	// Serve React build
	r.Static("/web", "./web/build")  // ← put your React `build` folder here
	r.NoRoute(func(c *gin.Context) {
		c.File("./web/build/index.html")
	})
}
