package routers

import (
	"net/http"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/controller"
	"github.com/go-chi/chi/v5"
)

func RegisterRoutes(r chi.Router) {
	r.Get("/test", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("working"))
	})
	r.Post("/check_video", controller.DetectDeepFake)
}
