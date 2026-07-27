package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	client, err := initFirebaseAuth()
	if err != nil {
		log.Fatalf("failed to initialize Firebase auth: %v", err)
	}

	cloudConfig := loadCloudinaryConfig()

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	http.HandleFunc("/auth/verify", verifyTokenHandler(client))
	http.Handle("/profile", authMiddleware(client, http.HandlerFunc(authorizedProfileHandler)))
	http.HandleFunc("/cloudinary/config", cloudinaryConfigHandler(cloudConfig))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
