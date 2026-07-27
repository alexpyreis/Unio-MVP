package main

import (
	"encoding/json"
	"net/http"
	"os"
)

type CloudinaryConfig struct {
	CloudName string `json:"cloud_name"`
}

func loadCloudinaryConfig() *CloudinaryConfig {
	return &CloudinaryConfig{
		CloudName: os.Getenv("CLOUDINARY_CLOUD_NAME"),
	}
}

func cloudinaryConfigHandler(cfg *CloudinaryConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if cfg.CloudName == "" {
			http.Error(w, "Cloudinary configuration not found", http.StatusServiceUnavailable)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"cloud_name": cfg.CloudName,
			"upload_url": "https://api.cloudinary.com/v1_1/" + cfg.CloudName + "/upload",
		})
	}
}
