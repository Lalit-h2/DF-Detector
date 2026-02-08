package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/routers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	fmt.Println("Started")
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	routers.RegisterRoutes(r)
	defer grpc_service.CloseConnection()
	log.Fatal(http.ListenAndServe("localhost:8000", r))
}
