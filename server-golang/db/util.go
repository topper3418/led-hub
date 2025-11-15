// db/util.go
package db

import (
	"os"
	"path/filepath"
	"strings"
)

func ReadSQLInitFile(fileName string) (string, error) {
	if !strings.HasSuffix(fileName, ".sql") {
		fileName += ".sql"
	}
	path := filepath.Join("src", "db", "sql", "init", fileName)
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(data), nil
}
