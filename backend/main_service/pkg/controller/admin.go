package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/model"
)

type newModelDetails struct {
	ModelName    string `json:"model_name"`
	ModelVersion int    `json:"model_version"`
}

func AddNewModel(w http.ResponseWriter, r *http.Request) {
	newModel := model.DetectionModel{}
	model_info := &newModelDetails{}
	if body, err := io.ReadAll(r.Body); err == nil {
		json.Unmarshal([]byte(body), model_info)
	}
	newModel.ModelVersion = strings.Trim(fmt.Sprintf("%sv%d", model_info.ModelName, model_info.ModelVersion), " /\\")
	if _, err := newModel.Insert(); err != nil {
		http.Error(w, "DB Error", http.StatusInternalServerError)
		return
	}
	makeResponseJson(&w, map[string]any{
		"result": "success",
		"data":   newModel,
	})
}
