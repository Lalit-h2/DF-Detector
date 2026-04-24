package middlewares

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(

		func(w http.ResponseWriter, r *http.Request) {

			authHeader := r.Header.Get("Authorization")
			jwtToken := strings.Replace(authHeader, "Bearer ", "", 1)
			token, err := jwt.Parse(jwtToken, func(token *jwt.Token) (any, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("Invalid Signing Method %v", token.Header["alg"])
				}
				return []byte(os.Getenv("JWT_SECRET")), nil
			})
			if err != nil {
				log.Println(err)
				http.Error(w, "Couldn't Verify User", http.StatusBadRequest)
				return
			}
			user_details, ok := token.Claims.(jwt.MapClaims)
			if !ok || !token.Valid {
				log.Println(token)
				http.Error(w, "Invalid AuthDetails", http.StatusBadRequest)
				return
			}
			ctx := r.Context()
			user_id := int64(user_details["sub"].(float64))
			ctx = context.WithValue(ctx, "jwtSubUser", user_id)

			// ctx = context.WithValue(ctx, "jwtUserRole", user_details["role"]) might add later

			r = r.WithContext(ctx)
			fmt.Println(r.Context().Value("jwtSubUser"))
			next.ServeHTTP(w, r)

		})
}
