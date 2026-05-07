package main

import (
	"fmt"
	"log"
	"net/http"

	_ "github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/dbconfig"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/grpc_service"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/model"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/routers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	_ "github.com/lib/pq"
)

func main() {
	fmt.Println("Started")
	
	model.InitSchema()
	model.InitUserSchema()
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(
		cors.Options{
			AllowedOrigins: []string{"*"},
			AllowedMethods: []string{"GET", "POST", "PUT"},
			// AllowedHeaders: []string{"Accept","Authorization","Content-Tpe"},
			AllowedHeaders: []string{"*"},
		},
	))
	routers.RegisterRoutes(r)
	routers.RegisterAdminRoutes(r)
	defer grpc_service.CloseConnection()

	log.Fatal(http.ListenAndServe(":8000", r))
}
