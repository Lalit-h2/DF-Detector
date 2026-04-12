package utils

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

func ParseJson(jsonObj []byte, dest any) error {
	err := json.Unmarshal(jsonObj, dest)
	return err

}

func ParseJsonReq(r *http.Request, dest any) error {
	jsonObj, err := io.ReadAll(r.Body)
	if err != nil {
		log.Println(err)
		return err
	}
	err = ParseJson(jsonObj, dest)
	if err != nil {
		log.Println(err)
	}
	return err
}
