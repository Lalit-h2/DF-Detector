package main

import (
	"fmt"
	"log"
	"net/http"

	model "github.com/Lalit-h2/DF-Detector/backend/main_service"
	_ "github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/dbconfig"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/routers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/lib/pq"
)

func main() {
	fmt.Println("Started")
	model.InitSchema()
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	routers.RegisterRoutes(r)
	defer grpc_service.CloseConnection()
	log.Fatal(http.ListenAndServe("localhost:8000", r))
}
