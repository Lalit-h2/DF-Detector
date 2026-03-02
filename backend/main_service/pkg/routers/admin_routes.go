package routers

import (
	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/controller"
	"github.com/go-chi/chi/v5"
)

func RegisterAdminRoutes(r chi.Router) {
	r.Route("/api/admin", func(r chi.Router) {
		r.Post("/newModel", controller.AddNewModel)
	})

}
