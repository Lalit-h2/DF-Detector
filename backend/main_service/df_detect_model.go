package model

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/dbconfig"
	"github.com/jmoiron/sqlx"
)

var db *sqlx.DB

type Result struct {
	IsFake     bool    `db:"is_fake"`
	Confidence float32 `db:"confidence"`
}

type DetectionModel struct {
	ModelVersion string `db:"model_version"`
	ModelId      int32  `db:"model_id"`
}

type DetectionModelHistory struct {
	ModelId    int32     `db:"model_id"` //foreign key
	UploadDate time.Time `db:"upload_date"`
	VideoHash  string    `db:"video_hash"`
	Result
}

const schema string = `
	CREATE TABLE IF NOT EXISTS "DetectionModel" (
	model_id integer PRIMARY KEY,
	model_version VARCHAR(255)
	);

	CREATE TABLE IF NOT EXISTS "DetectionModelHistory" (model_id integer NOT NULL,
	upload_date TIMESTAMPTZ,
	video_hash VARCHAR(255) UNIQUE ,
	is_fake BOOLEAN NOT NULL DEFAULT TRUE,
	confidence float8,
	Foreign Key(model_id) REFERENCES "DetectionModel"(model_id) ON DELETE SET NULL
	);
	`

func InitSchema() {
	db = dbconfig.GetDb()
	db.MustExec(schema)
}

func (dmh *DetectionModelHistory) Insert() (int, error) {
	qry, err := db.PrepareNamed(`INSERT INTO "DetectionModelHistory"(model_id,upload_date,video_hash,is_fake,confidence) VALUES(:model_id,:upload_date,:video_hash,:is_fake,:confidence)`)
	if err != nil {
		fmt.Println(err)
		return 0, err
	}

	_, err = qry.Exec(dmh)

	if err != nil {
		fmt.Println(err)
		return 0, err
	}
	return 1, nil
}

func (dmh *DetectionModelHistory) CheckHash() (bool, error) {
	qry, err := db.PrepareNamed(`Select model_id,upload_date,is_fake,confidence  from "DetectionModelHistory" WHERE video_hash=:video_hash`)
	if err != nil {
		fmt.Println(err)
		return false, err
	}
	err = qry.Get(dmh, dmh)
	if err == sql.ErrNoRows {
		fmt.Println("ErrNoRows", err)
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}
