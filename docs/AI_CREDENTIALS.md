# Acesso seguro de IAs ao projeto

## O que pode ficar no repositório

Os arquivos abaixo podem ser versionados porque contêm apenas configurações públicas do Firebase Web SDK:

- firebase/client.config.json
- .env.example

## O que nunca deve ir para o GitHub

- serviceAccountKey.json
- qualquer chave privada do Firebase
- segredos do Cloudinary
- tokens de API

## Como outras IAs podem acessar

1. Use o repositório GitHub como fonte de contexto
2. Leia o arquivo firebase/client.config.json para o Firebase Web
3. Use GitHub Secrets para variáveis privadas em CI/CD
4. Para o backend Go, use o secret `FIREBASE_SERVICE_ACCOUNT_JSON` com o conteúdo completo do JSON da service account
5. O backend agora aceita esse valor diretamente via variável de ambiente, sem depender de um arquivo local

## Exemplo seguro de inicialização no Go

```go
package main

import (
  "context"
  "fmt"
  "os"

  firebase "firebase.google.com/go"
  "firebase.google.com/go/auth"
  "google.golang.org/api/option"
)

func initFirebaseApp() (*firebase.App, error) {
  var opts []option.ClientOption

  if path := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); path != "" {
    opts = append(opts, option.WithCredentialsFile(path))
  }

  app, err := firebase.NewApp(context.Background(), nil, opts...)
  if err != nil {
    return nil, fmt.Errorf("error initializing app: %v", err)
  }

  _, err = app.Auth(context.Background())
  if err != nil {
    return nil, fmt.Errorf("error initializing auth client: %v", err)
  }

  return app, nil
}
```
