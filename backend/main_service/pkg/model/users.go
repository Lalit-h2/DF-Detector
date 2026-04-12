package model

import (
	"fmt"
	"log"
	"time"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/roles"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/utils"
	"github.com/jmoiron/sqlx"
)

type User struct {
	ID          int64  `json:"id"`
	Name        string `json:"username"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	AccessLevel int16  `db:"access_level" json:"access_level"`
}

type UserHistory struct {
	ActivityID        int64     `db:"activity_id"`
	UserID            int64     `db:"user_id"`
	ActivityTimestamp time.Time `db:"activity_timestamp"`
	VideoName         string    `db:"video_name"`
	HashID            int32     `db:"hash_id"`
}

const userSchema string = `

	CREATE TABLE IF NOT EXISTS users (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	name TEXT,
	email TEXT UNIQUE,
	password TEXT,
	access_level smallint
	);

`

const userHistorySchema = `
	CREATE TABLE IF NOT EXISTS user_history (
		activity_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
		user_id BIGINT,
		activity_timestamp TIMESTAMPTZ DEFAULT NOW(),
		video_name TEXT,
		hash_id BIGINT,
		FOREIGN KEY(user_id) REFERENCES users(id) on DELETE SET NULL,
		FOREIGN KEY(hash_id) REFERENCES "DetectionModelHistory"(record_id) on DELETE SET NULL
	);


`

var userStatements = struct {
	insert,
	getPassword,
	registerLog,
	history *sqlx.NamedStmt
	getVidResult,
	other *sqlx.Stmt
}{}

func init() {
	InitSchema()
	InitUserSchema()
	prepareStatements()
}

func prepareStatements() {
	var err error
	userStatements.insert, err = db.PrepareNamed("Insert into users(name,email,password,access_level) VALUES(:name,:email,:password,:access_level)")
	if err != nil {
		log.Fatal(err)
	}
	userStatements.getPassword, err = db.PrepareNamed("SELECT id,password FROM users WHERE email=:email")
	if err != nil {
		log.Fatal(err)
	}
	userStatements.registerLog, err = db.PrepareNamed("INSERT into  user_history(user_id,activity_timestamp,video_name,hash_id) VALUES(:user_id,:activity_timestamp,:video_name,:hash_id) RETURNING activity_id")
	if err != nil {
		log.Fatal(err)
	}
	userStatements.getVidResult, err = db.Preparex(`SELECT uh.activity_id AS activity_id,
															uh.video_name AS video_name,
														    uh.activity_timestamp AS activity_timestamp,
														    dmh.is_fake AS is_fake,
														    dmh.confidence AS confidence
															FROM user_history uh
															JOIN "DetectionModelHistory" dmh
															ON uh.hash_id = dmh.record_id
															WHERE uh.activity_id = $1`)

	if err != nil {
		log.Fatal(err)
	}
	userStatements.history, err = db.PrepareNamed(userHistoryQuery)
	if err != nil {
		log.Fatal(err)
	}
}

func (usr *User) InsertRecord() error {
	usr.AccessLevel = roles.GENERAL_USER
	var err error
	usr.Password, err = utils.Hash(usr.Password)
	if err != nil {
		log.Println("Hash Error")
		return fmt.Errorf("Error While Hashing Password")
	}
	_, err = userStatements.insert.Exec(*usr)
	if err != nil {
		log.Println("Insert Error")
		return err
	}
	return nil
}

func (usr *User) CheckPassword() (match bool, err error) {
	var textPass string
	textPass = usr.Password
	err = userStatements.getPassword.Get(usr, *usr)
	if err != nil {
		log.Println(err)
		return
	}
	match, err = utils.CompareHash(usr.Password, textPass)
	if !match {
		log.Println("Comapring hash:", err)
	}
	return
}

type VideoResultHolder struct {
	AID               int64     `db:"activity_id"`
	Name              string    `db:"video_name"`
	VideoHash         string    `db:"video_hash"`
	ActivityTimestamp time.Time `db:"activity_timestamp"`
	ModelVersion      string    `db:"model_version"`
	IsFake            bool      `db:"is_fake"`
	Confidence        float64   `db:"confidence"`
}

type UserHistoryHolder struct {
	Name              string    `db:"name"`
	VideoHash         string    `db:"video_hash"`
	ActivityTimestamp time.Time `db:"upload_date"`
	ModelVersion      string    `db:"model_version"`
	IsFake            bool      `db:"is_fake"`
	Confidence        float64   `db:"confidence"`
}

func (usr *User) GetHistory() ([]UserHistoryHolder, error) {
	var userhistory []UserHistoryHolder
	rows, err := userStatements.history.Query(*usr)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var record UserHistoryHolder
		if err = rows.Scan(&record); err != nil {
			log.Println("error while scanning rows")
			return nil, err
		}
		userhistory = append(userhistory, record)
	}
	return userhistory, nil
}

func (usr *UserHistory) Register() (any, error) {
	err := userStatements.registerLog.QueryRow(usr).Scan(&usr.ActivityID)
	if err != nil {
		log.Print(err)
		return nil, err
	}
	return usr.ActivityID, nil
}

func GetVideoResult(id int64) (VideoResultHolder, error) {
	var vid_result = VideoResultHolder{}
	err := userStatements.getVidResult.Get(&vid_result, id)
	if err != nil {
		log.Println(err)
		return VideoResultHolder{}, err
	}
	return vid_result, nil
}

// type userStatements struct{
// 	insert,getPassword,someother *sqlx.NamedStmt
// }

const userHistoryQuery = `
	SELECT
	    users.name              AS name,
	    "DetectionModelHistory".video_hash    AS video_hash,
	    user_history.activity_timestamp AS upload_date,
	    "DetectionModel".model_version AS model_version,
	    "DetectionModelHistory".is_fake AS is_fake,
	    "DetectionModelHistory".confidence AS confidence
	FROM
	    user_history
	JOIN
	    users ON user_history.user_id = users.id
	JOIN
	    "DetectionModelHistory" ON user_history.hash_id = "DetectionModelHistory".record_id
	JOIN
	    "DetectionModel" ON "DetectionModelHistory".model_id = "DetectionModel".model_id
	WHERE
		users.id = :id
`

func InitUserSchema() {
	db.MustExec(userSchema)
	db.MustExec(userHistorySchema)
}
