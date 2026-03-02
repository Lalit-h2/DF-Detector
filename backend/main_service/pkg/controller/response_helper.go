package controller

import (
	"encoding/json"
	"net/http"
)

func makeResponseJson(w *http.ResponseWriter, data map[string]interface{}) {
	(*w).Header().Set("Content-Type", "application/json")
	jsonResponse, err := json.Marshal(data)
	parseError := "server error while responding"

	if err != nil {
		http.Error((*w), parseError, http.StatusInternalServerError)
		return
	}

	_, err = (*w).Write(jsonResponse)
	if err != nil {
		http.Error((*w), parseError, http.StatusInternalServerError)
		return
	}
}
