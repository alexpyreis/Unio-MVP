# Backend Go do Unio

## Execução local

1. Instale as dependências:

```bash
go mod tidy
```

2. Defina as variáveis de ambiente:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/serviceAccountKey.json
export PORT=8080
```

3. Rode o servidor:

```bash
go run .
```

## Segurança

- Nunca commitar `serviceAccountKey.json`
- Para CI/CD, use GitHub Secrets ou variáveis de ambiente do ambiente de execução
