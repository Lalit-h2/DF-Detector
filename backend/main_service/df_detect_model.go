package model

import (
	"time"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/dbconfig"
)

type Result struct {
	IsFake     bool
	Confidence float32
}

type DetectionModel struct {
	ModelVersion string
	ModelId      int32
}

type DetectionModelHistory struct {
	ModelId    int32 //foreign key
	UploadDate time.Time
	VideoHash  string
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
	db := dbconfig.GetDb()
	db.MustExec(schema)
}
