package dbconfig

import (
	"fmt"
	"log"
	"os"

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
	fmt.Println("Connecting to db......")
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	database_name := os.Getenv("DB_NAME")
	var postgresConf = fmt.Sprintf("host=%s user=%s password=%s  dbname=%s sslmode=disable", host, user, password, database_name)
	fmt.Println("Conf:", postgresConf)
	db, err := sqlx.Connect("postgres", postgresConf)
	// "user=root password=sqlsys  dbname=someth sslmode=disable"
	if err != nil {
		fmt.Println("Err:", err)
		return nil, err
	}
	fmt.Println("Connected")
	return db, nil
}

func GetDb() *sqlx.DB {
	return db
}
