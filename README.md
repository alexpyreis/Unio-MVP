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

## Status

Repositório inicial — próximo passo: configurar Firebase e scaffold das aplicações.
