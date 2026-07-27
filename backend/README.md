# Backend Go do Unio

## Execução local

1. Instale as dependências:

```bash
go mod tidy
```

2. Defina as variáveis de ambiente:

```bash
export PORT=8080
export CLOUDINARY_CLOUD_NAME=seu-cloud-name
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

- Se preferir usar um arquivo local, defina `GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/serviceAccountKey.json` em vez de `FIREBASE_SERVICE_ACCOUNT_JSON`.

3. Rode o servidor:

```bash
go run .
```

## Endpoints úteis

- `GET /health` — verificação de saúde
- `GET /auth/verify` — validação de token Firebase Bearer
- `GET /profile` — acesso protegido com token Firebase
- `GET /cloudinary/config` — retorna upload URL e cloud name configurados

## Segurança

- Nunca commitar `serviceAccountKey.json` ou `FIREBASE_SERVICE_ACCOUNT_JSON` com credenciais reais.
- Para CI/CD, use GitHub Secrets ou variáveis de ambiente do ambiente de execução.
