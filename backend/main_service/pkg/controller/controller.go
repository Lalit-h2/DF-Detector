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
	"sync"
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

func UserAnalytics(w http.ResponseWriter, r *http.Request) {
	var err error
	userid, ok := r.Context().Value("jwtSubUser").(int64)
	if !ok {
		log.Println("Invalid Id format:", r.Context())
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	analyticalData, err := model.GetUserAnalytics(userid)
	if err != nil {
		log.Println(err)
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	makeResponseJson(&w, analyticalData)
}

func logUserActivity(userid int64, rid int32, filename string) (aid int64, err error) {
	var usr_log = model.UserHistory{UserID: userid}
	usr_log.HashID = rid
	usr_log.VideoName = filename
	usr_log.ActivityTimestamp = time.Now().UTC()
	_, err = usr_log.Register()
	if err != nil {
		log.Println("Err:", err)
	}
	aid = usr_log.ActivityID
	return
}

func GetUserHistory(w http.ResponseWriter, r *http.Request) {
	var err error
	userid, ok := r.Context().Value("jwtSubUser").(int64)
	if !ok {
		log.Println("Invalid Id format:", r.Context())
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	var usr = model.User{ID: userid}
	usrHistory, err := usr.GetHistory()
	if err != nil {
		log.Println(err)
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	makeResponseJson(&w, map[string]any{"data": usrHistory})
}

func DetectDeepFake(w http.ResponseWriter, r *http.Request) {
	userid, ok := r.Context().Value("jwtSubUser").(int64)
	if !ok {
		http.Error(w, "User id error", http.StatusBadRequest)
		log.Println("Error while chekcing user id")
		return
	}
	var wg = &sync.WaitGroup{}
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

	var vhash [16]byte
	wg.Go(func() {
		var vdata []byte
		vdata, err = io.ReadAll(f)
		if err != nil {
			return
		}

		vhash = md5.Sum(vdata)
	})
	var record model.DetectionModelHistory
	record.ModelId = 1
	wg.Wait()
	if err != nil {
		log.Println(err)
		http.Error(w, "Error while hashing file", http.StatusBadRequest)
		return
	}
	record.VideoHash = fmt.Sprintf("%x", vhash)

	fmt.Println(record.VideoHash)
	resultExists, err := record.CheckHash()
	if err != nil {
		log.Println(err)
		log.Println("Proceeding despite error")
	}
	if resultExists {
		activity_id, err := logUserActivity(userid, record.RecordId, file_header.Filename)
		if err != nil {
			http.Error(w, "Trouble while recording result", http.StatusInternalServerError)
			return
		}
		makeResponseJson(&w, map[string]any{
			"id": activity_id,
		})
		return
	}
	wg.Go(func() {
		f.Seek(0, io.SeekStart) //because file needs to be read again in CopyVideoFile function
	})

	r = r.WithContext(context.WithValue(r.Context(), "video_header", file_header))
	r = r.WithContext(context.WithValue(r.Context(), "video_file", &f))
	var filepath string

	wg.Wait()

	filepath, err = utils.CopyVideoFile(r)
	fmt.Println(filepath)

	if err != nil {
		log.Println(err)
		http.Error(w, "Error while copying video file to tmp", http.StatusInternalServerError)
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

	activity_id, err := logUserActivity(userid, rid, file_header.Filename)
	if err != nil {
		http.Error(w, "Trouble while recording result", http.StatusInternalServerError)
		return
	}

	makeResponseJson(&w, map[string]any{
		"id": activity_id,
	})
}
