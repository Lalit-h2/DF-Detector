package controller

import (
	"context"
	"crypto/md5"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/model"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/utils"
	// "github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
)

type Result struct {
	isfake     bool
	confidence float32
}

func DetectDeepFake(w http.ResponseWriter, r *http.Request) {
	result := new(Result)
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		log.Println(err)
	}
	if r.MultipartForm != nil {
		defer r.MultipartForm.RemoveAll()
	}

	f, file_header, err := r.FormFile("video")
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Video File Not Found", http.StatusBadRequest)
		return
	}
	fmt.Println(file_header.Filename)
	defer f.Close()

	var vdata []byte

	if vdata, err = io.ReadAll(f); err != nil {
		log.Println(err)
	}

	vhash := md5.Sum(vdata)

	/*
		go func(){

		err=db.InsertHash(vhash)
		if err!=nil{
		result =db.FetchResult(vhash)
		}

		}
	*/
	var record model.DetectionModelHistory
	record.ModelId = 1
	record.VideoHash = fmt.Sprintf("%x", vhash)
	fmt.Println(record.VideoHash)
	resultExists, err := record.CheckHash()
	if err != nil {
		log.Println(err)
	}
	if resultExists {
		fmt.Fprintf(w, "%v %v", record.IsFake, record.Confidence)
		return
	}

	f.Seek(0, io.SeekStart)
	r = r.WithContext(context.WithValue(r.Context(), "video_file", &f))
	r = r.WithContext(context.WithValue(r.Context(), "video_header", file_header))
	var filepath string

	filepath, err = utils.CopyVideoFile(r)
	fmt.Println(filepath)

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

	result.isfake, result.confidence, err = grpc_service.DetectDeepFake(filepath)
	if err != nil || (result.isfake == false && result.confidence == 0) {
		log.Println(err)
		http.Error(w, "Couldn't Process the request", http.StatusInternalServerError)
		return
	}
	record.IsFake, record.Confidence = result.isfake, result.confidence
	record.UploadDate = time.Now().Local()
	fmt.Println(record)
	_, err = record.Insert()
	if err != nil {
		log.Println("Err:", err)
		http.Error(w, "Trouble while recording result", http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "%v %v", result.isfake, result.confidence)
}
