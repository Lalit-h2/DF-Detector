package utils

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

func CopyVideoFile(r *http.Request) (string, error) {
	// if !r.Form.Has("video") {
	// 	fmt.Println("not found")
	// 	return errors.New("video not found")
	// }
	f, file_header, err := r.FormFile("video")
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	defer f.Close()
	tempFile, err := os.CreateTemp("", "*"+file_header.Filename)
	if err != nil {
		log.Println(err)
		return "", err
	}
	defer tempFile.Close()
	_, err = io.Copy(tempFile, f)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Print(tempFile.Name(), "\n")
	// removeAfterUse:=func(){
	// 	os.Remove(file.Name())
	// }
	return tempFile.Name(), nil
}
