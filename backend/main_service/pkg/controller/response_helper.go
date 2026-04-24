package controller

import (
	"encoding/json"
	"log"
	"net/http"
)

func makeResponseJson(w *http.ResponseWriter, data any) {
	(*w).Header().Set("Content-Type", "application/json")
	jsonResponse, err := json.Marshal(data)
	parseError := "server error while responding"

	if err != nil {
		log.Println(err)
		http.Error((*w), parseError, http.StatusInternalServerError)
		return
	}

	_, err = (*w).Write(jsonResponse)
	if err != nil {
		log.Println(err)
		http.Error((*w), parseError, http.StatusInternalServerError)
		return
	}
}
