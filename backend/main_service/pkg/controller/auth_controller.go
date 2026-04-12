package controller

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/model"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/utils"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lib/pq"
)

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var usr = &model.User{}
	err := utils.ParseJsonReq(r, usr)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid Req Format", http.StatusBadRequest)
		return
	}

	log.Println("User Info:", *usr)

	if err := usr.InsertRecord(); err != nil {
		fmt.Println(err)
		postgresError, ok := err.(*pq.Error)
		if !ok {
			http.Error(w, "Error while recording user data", http.StatusBadRequest)
			return
		}
		if postgresError.Code == "23505" {
			http.Error(w, "Username already exists", http.StatusBadRequest)
		}
		return
	}

	makeResponseJson(&w, map[string]any{"result": "success"})
}

func UserLogin(w http.ResponseWriter, r *http.Request) {
	var user model.User
	err := utils.ParseJsonReq(r, &user)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Invalid Req body", http.StatusBadRequest)
		return
	}

	match, err := user.CheckPassword()
	if !match {
		log.Println(err)
	}
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Incorrect Username or Password", http.StatusUnauthorized)
		return
	}
	log.Println(user)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"sub": user.ID, "exp": &jwt.NumericDate{Time: time.Now().Add(time.Hour * 2).UTC()}})
	fmt.Println(os.Getenv("JWT_SECRET"))
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error While Signing", http.StatusInternalServerError)

	}
	makeResponseJson(&w, map[string]any{"result": "success", "auth_token": tokenString})
}
