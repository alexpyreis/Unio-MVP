# Unio MVP

Plataforma de encontros para católicos no Brasil — inspirada no **Tinder** (UX de swipe e match) e no **CatholicMatch** (perfil de fé e moderação).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Auth | Firebase Authentication |
| Banco | Firestore |
| Fotos | Firebase Storage |
| Push | Firebase Cloud Messaging |
| API | Go + Gin (Cloud Run) |
| App | Next.js 14 + TypeScript + shadcn/ui (PWA mobile-first) |
| Admin | Next.js (moderação — fase 2) |

## Estrutura do monorepo

```
Unio-MVP/
├── backend/          # API Go
├── frontend-app/     # App principal (PWA)
├── frontend-admin/   # Painel de moderação
├── firebase/         # Rules e indexes
├── docs/             # Documentação e plano
└── prompts/          # Prompts de implementação faseada
```

## Documentação

- [Estrutura Front / Back / Database](docs/ESTRUTURA.md)
- [Plano MVP](docs/PLANO_MVP.md)

## Contribuição

- Mantenha os arquivos em UTF-8 e siga as regras do [.editorconfig](.editorconfig).
- Para alterações maiores, use branches e abra um Pull Request para a branch main.

## Execução local

### Backend

```bash
cd backend
go mod tidy
go run .
```

### Frontend

```bash
cd frontend-app
npm install
npm run dev
```

### Observações

- O backend usa Firebase Auth e Cloudinary scaffold.
- O frontend usa Firebase Web SDK e faz proxy para o backend via `/api/profile`.

## Status

O projeto agora está unificado em `main` com backend e frontend funcionais para autenticação.
