package controller

import (
	"context"
	"crypto/md5"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/model"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/utils"
	"github.com/go-chi/chi/v5"
	// "github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
)

type Result struct {
	isfake     bool
	confidence float32
}

func GetResult(w http.ResponseWriter, r *http.Request) {
	acitvityID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		log.Println("Invalid Id format:", err)
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	result, err := model.GetVideoResult(acitvityID)
	if err != nil {
		http.Error(w, "Error Occured While Fetching the result", http.StatusInternalServerError)
		return
	}
	makeResponseJson(&w, map[string]any{
		"acitvity_date": result.ActivityTimestamp,
		"video_name":    result.Name,
		"is_fake":       result.IsFake,
		"confidence":    result.Confidence,
		"id":            result.AID,
	})

}

func DetectDeepFake(w http.ResponseWriter, r *http.Request) {
	userid, ok := r.Context().Value("jwtSubUser").(int64)
	if !ok {
		http.Error(w, "User id error", http.StatusBadRequest)
		log.Println("Error while chekcing user id")
		return
	}
	fmt.Println("Id of user thats making the request is", userid)
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

	var record model.DetectionModelHistory
	record.ModelId = 1
	record.VideoHash = fmt.Sprintf("%x", vhash)
	fmt.Println(record.VideoHash)
	resultExists, err := record.CheckHash()
	if err != nil {
		log.Println(err)
	}
	if resultExists {
		rid := record.RecordId
		var usr_log = model.UserHistory{UserID: userid}
		usr_log.HashID = rid
		usr_log.VideoName = file_header.Filename
		usr_log.ActivityTimestamp = time.Now().UTC()
		_, err = usr_log.Register()
		if err != nil {
			log.Println("Err:", err)
			http.Error(w, "Trouble while recording result", http.StatusInternalServerError)
			return
		}
		makeResponseJson(&w, map[string]any{
			"id": usr_log.ActivityID,
		})
		return
	}
	f.Seek(0, io.SeekStart) //because file needs to be read again in CopyVideoFile function

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
	rid, err := record.Insert()
	if err != nil {
		log.Println("Err:", err)
		http.Error(w, "Trouble while recording result", http.StatusInternalServerError)
		return
	}

	var usr_log = model.UserHistory{UserID: userid}
	usr_log.HashID = rid
	usr_log.VideoName = file_header.Filename
	usr_log.ActivityTimestamp = time.Now().UTC()
	_, err = usr_log.Register()
	if err != nil {
		log.Println("Err:", err)
		http.Error(w, "Trouble while recording result", http.StatusInternalServerError)
		return
	}

	makeResponseJson(&w, map[string]any{
		"id": usr_log.ActivityID,
	})
}
