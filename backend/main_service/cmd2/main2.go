package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	model "github.com/Lalit-h2/DF-Detector/backend/main_service"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/dbconfig"
	_ "github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/dbconfig"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/routers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/lib/pq"
)

func main() {
	fmt.Println("Started")
	tsignal := make(chan os.Signal, 1)
	signal.Notify(tsignal, os.Interrupt, syscall.SIGTERM)
	model.CreateSchema()
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	routers.RegisterRoutes(r)
	go func() {
		<-tsignal
		fmt.Print("Cleaning....")
		dbconfig.GetDb().Close()
		grpc_service.CloseConnection()
		fmt.Println("Cleaning done")
		os.Exit(1)
	}()
	log.Fatal(http.ListenAndServe("localhost:8000", r))
}

