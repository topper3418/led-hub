// db/connection.go
package db

import (
	"database/sql"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// Assume DATABASE_PATH from config, like Python.
var DATABASE_PATH = "data/database.db"

func GetConnection(connectionPath string) (*sql.DB, error) {
	if connectionPath == "" {
		connectionPath = DATABASE_PATH
	}
	folder := filepath.Dir(connectionPath)
	if _, err := os.Stat(folder); os.IsNotExist(err) {
		return nil, err
	}
	return sql.Open("sqlite3", connectionPath)
}

// Logging: Use std log for now; replace with custom logger if needed.
