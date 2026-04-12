package routers

import (
	"net/http"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/controller"
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/middlewares"
	"github.com/go-chi/chi/v5"
)

func RegisterRoutes(r chi.Router) {
	r.Get("/test", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("working"))
	})
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", controller.RegisterUser)
		r.Post("/login", controller.UserLogin)
	})
	r.Route("/api", func(r chi.Router) {
		r.Use(middlewares.Authenticate)
		r.Post("/videos", controller.DetectDeepFake)
		r.Get("/videos/{id}", controller.GetResult)
	})
}
