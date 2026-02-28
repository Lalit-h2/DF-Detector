package dbconfig

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var db *sqlx.DB

func init() {
	var err error
	db, err = Connect()
	if err != nil {
		log.Fatal(err)
	}

}
func Connect() (*sqlx.DB, error) {
	fmt.Println("here")
	db, err := sqlx.Connect("postgres", "user=root password=sqlsys  dbname=someth sslmode=disable")
	if err != nil {
		fmt.Println("Err:", err)
		return nil, err
	}
	return db, nil
}

func GetDb() *sqlx.DB {
	return db
}
