package utils

import (
	"encoding/base64"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func Hash(txt string) (string, error) {
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(txt), bcrypt.DefaultCost)
	if err != nil {
		log.Println(err)
		return "", err
	}
	hashB64 := base64.RawStdEncoding.EncodeToString(hashedPass)

	return hashB64, nil
}

func CompareHash(hashedPass, password string) (bool, error) {
	binaryHash, err := base64.RawStdEncoding.Strict().DecodeString(hashedPass)
	if err != nil {
		log.Println("Error Decode:", err)
		return false, err
	}
	err = bcrypt.CompareHashAndPassword(binaryHash, []byte(password))

	return err == nil, err
}
