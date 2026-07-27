# frontend-app

App principal do Unio MVP.

## Como rodar

1. Instale dependências:

```bash
npm install
```

2. Rode em desenvolvimento:

```bash
npm run dev
```

3. Abra `http://localhost:3000`.

## Notas

- O app usa Firebase Auth para login.
- O endpoint `/api/profile` proxya o token para o backend local em `http://localhost:8080/profile`.
