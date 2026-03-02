package model

type User struct {
	ID          int64
	Name        string
	Email       string
	AccessLevel int16 `db:"access_level"`
}

const userSchema string = `
	CREATE TABLE IF NOT EXISTS users (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	name TEXT,
	email TEXT,
	access_level smallint
	);

`

func InitUserSchema() {
	db.MustExec(userSchema)
}
