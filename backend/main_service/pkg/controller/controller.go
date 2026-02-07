package controller

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/utils"
	// "github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
)

func DetectDeepFake(w http.ResponseWriter, r *http.Request) {
	filepath, err := utils.CopyVideoFile(r)
	if err != nil {
		log.Println(err)
		return
	}
	defer func() {
		go func() {
			if err := os.Remove(filepath); err != nil {
				fmt.Println(err, ":\ncouldnt remove file")
			}
		}()
	}()
	isfake, confidence, err := grpc_service.DetectDeepFake(filepath)
	if err != nil || (isfake == false && confidence == 0) {
		log.Println(err)
		http.Error(w, "Couldnt Process the request", http.StatusBadRequest)
		return
	}
	fmt.Fprintf(w, "%v %v", isfake, confidence)
}
