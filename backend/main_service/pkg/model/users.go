package model

import "time"

type User struct {
	ID          int64
	Name        string
	Email       string
	AccessLevel int16 `db:"access_level"`
}

type UserHistory struct {
	UserID            int64     `db:"user_id"`
	ActivityTimestamp time.Time `db:"activity_timestamp"`
	VideoName         string    `db:"video_name"`
	HashID            int       `db:"hash_id"`
}

const userSchema string = `

	CREATE TABLE IF NOT EXISTS users (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	name TEXT,
	email TEXT,
	access_level smallint
	);

	CREATE TABLE IF NOT EXISTS user_history (
		user_id BIGINT,
		activity_timestamp TIMESTAMPTZ,
		video_name TEXT,
		hash_id BIGINT,
		FOREIGN KEY(user_id) REFERENCES users(id) on DELETE SET NULL,
		FOREIGN KEY(hash_id) REFERENCES "DetectionModelHistory"(record_id) on DELETE SET NULL

	);


`

type UserHistoryHolder struct {
	Name              string    `db:"name"`
	VideoHash         string    `db:"video_hash"`
	ActivityTimestamp time.Time `db:"upload_date"`
	ModelVersion      string    `db:"model_version"`
	IsFake            bool      `db:"is_fake"`
	Confidence        int       `db:"confidence"`
}

const userHistoryQuery = `
	SELECT
	    users.name              AS name,
	    user_history.video_hash    AS video_hash,
	    user_history.activity_timestamp AS upload_date,
	    "DetectionModel".model_version AS model_version,
	    "DetectionModelHistory".is_fake AS is_fake
	    "DetectionModelHistory".confidence AS confidence
	FROM
	    user_history
	JOIN
	    users ON user_history.user_id = users.id
	JOIN
	    "DetectionModelHistory" ON user_history.hash_id = "DetectionModelHistory".record_id
	JOIN
	    "DetectionModel" ON "DetectionModelHistory".model_id = "DetectionModel".id
	WHERE
		users.id = ?
`

func prepareStatements() {

}

func InitUserSchema() {
	db.MustExec(userSchema)
}
