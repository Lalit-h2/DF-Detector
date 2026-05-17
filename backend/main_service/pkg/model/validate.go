package model

import (
	"log"
	"regexp"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/internal/validator"
)

func ValidateUserCreds(v *validator.Validator, usr User) {
	const emailPattern = `^[^\s@]+@[^\s@]+\.[^\s@]+$`
	var err error
	isEmailValid, err := regexp.MatchString(emailPattern, usr.Email)
	if err != nil {
		log.Println("Error while pattern matching")
		return
	}
	isPasswordValid, err := true, nil

	v.Check(isEmailValid, "email", "Inavlid Email format")
	v.Check(isPasswordValid, "email", "Inavlid Password format")
}
