# Unio — Estrutura Front / Back / Database

> Documento de referência arquitetural. Inspirado no Tinder (UX de dating) e no CatholicMatch (perfil de fé, moderação, intenção matrimonial).
> Alinhado às decisões: Brasil primeiro, mobile/web (PWA), Firebase, monetização depois do MVP.

---

## 1. Referências e o que cada uma traz

| Referência | O que copiamos | O que adaptamos para o Unio |
|------------|----------------|-------------------------------------|
| **Tinder** | Swipe (like/pass), deck de cards, match mútuo, chat pós-match, filtros de idade/distância, bottom tabs (Discover / Matches / Chat / Profile) | Sem foco em hookup; perfil de fé visível no card; aprovação manual antes de entrar no app |
| **CatholicMatch** | Campos católicos (missa, sacramentos, paróquia, espiritualidade), intenção de casamento sacramental, moderação/admin, certificado de batismo (opcional) | UX mais moderna e mobile-first; fluxo Tinder em vez de browse/listagem; contexto brasileiro (PT-BR, dioceses BR) |

---

## 2. Visão geral da arquitetura

```text
Unio-MVP/
├── backend/                    # API Go + Gin (regras de negócio no servidor)
│   ├── cmd/api/                # Entry point
│   └── internal/
│       ├── config/
│       ├── models/             # Entidades de domínio
│       ├── repositories/       # Firestore + Storage
│       ├── services/           # Matching, swipe, chat, moderação
│       ├── handlers/           # HTTP REST
│       └── middleware/         # Auth Firebase JWT, admin, rate limit
│
├── frontend-app/               # Next.js 14 — PWA mobile-first (app principal)
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── routes/
│
├── frontend-admin/             # Next.js — moderação (fase 2)
│   └── app/
│
├── firebase/                   # Config infra Firebase
│   ├── firestore.rules
│   ├── storage.rules
│   └── indexes.json
│
├── docs/
│   ├── AI_DEV_DIRECTIVE.md
│   ├── PLANO_MVP.md
│   └── ARQUITETURA_FIRESTORE.md
│
└── prompts/                    # Implementação faseada (estilo imobiliária)
    ├── 01_foundation_auth_profile.txt
    ├── 02_discovery_swipe_match.txt
    ├── 03_chat_realtime.txt
    └── 04_moderation_admin.txt
```

### Stack

| Camada | Tecnologia | Motivo |
|--------|------------|--------|
| Auth | Firebase Authentication | Email/senha + Google (Apple depois) |
| Banco | Firestore | Realtime nativo, escala, já familiar do imobiliária |
| Fotos / docs | Firebase Storage | Fotos de perfil + certificado de batismo |
| Push | Firebase Cloud Messaging (FCM) | Match novo, mensagem nova |
| API | Go + Gin → Cloud Run | Regras anti-fraude, matching, moderação |
| App | Next.js 14 + TypeScript + shadcn/ui + Tailwind | PWA instalável no celular |
| Estado | TanStack Query + Zustand | Cache de API + estado local de UI |
| Deploy | Vercel (front) + Cloud Run (back) | Mesmo padrão do imobiliária |

---

## 3. Frontend — estrutura e telas

### 3.1 Organização de pastas (frontend-app)

```text
frontend-app/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   └── (onboarding)/
│       ├── signup-submitted/
│       ├── account-under-review/
│       ├── welcome/
│       └── complete-profile/
│
├── features/
│   ├── auth/
│   ├── profile/
│   ├── discover/
│   ├── matches/
│   ├── chat/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── BottomTabs.tsx
│   ├── ProfileCard.tsx
│   └── SwipeDeck.tsx
│
└── lib/
    ├── firebase.ts
    └── api-client.ts
```

### 3.2 Mapa de rotas (já existente no projeto atual → alvo)

| Rota atual (Vite) | Rota alvo (Next.js) | Referência | Descrição |
|-------------------|---------------------|------------|-----------|
| `/` | `/` | CatholicMatch | Landing pública |
| `/login` | `/login` | — | Login |
| `/signup` | `/signup` | CatholicMatch | Cadastro + upload certificado batismo |
| `/signup-submitted` | `/signup-submitted` | CatholicMatch | Confirmação pós-cadastro |
| `/account-under-review` | `/account-under-review` | CatholicMatch | Aguardando aprovação admin |
| `/welcome` | `/welcome` | — | Boas-vindas pós-aprovação |
| `/complete-profile` | `/complete-profile` | CatholicMatch | Onboarding fé + fotos + preferências |
| `/home` | `/home` | **Tinder** | Discover — swipe like/pass |
| `/matches` | `/matches` | **Tinder** | Lista de matches |
| `/chat` | `/chat`, `/chat/[matchId]` | **Tinder** | Conversas |
| `/profile` | `/profile` | Ambos | Ver próprio perfil |
| `/profile/editprofile` | `/profile/edit` | CatholicMatch | Editar perfil + fé |
| `/settings/*` | `/settings/*` | Ambos | Configurações |
| `/admin` | `frontend-admin` | CatholicMatch | Painel moderação (separado) |

### 3.3 Fluxo de navegação (estilo Tinder)

```mermaid
flowchart TD
    A[Landing] --> B[Signup / Login]
    B --> C[Signup Submitted]
    C --> D{Admin aprovou?}
    D -->|Não| E[Account Under Review]
    D -->|Sim| F[Welcome]
    F --> G[Complete Profile]
    G --> H[Home - Discover]
    H --> I{Swipe}
    I -->|Like mútuo| J[Match Modal]
    J --> K[Chat]
    I -->|Pass| H
    H --> L[Matches Tab]
    L --> K
```

### 3.4 Componentes-chave por feature

**Discover (Tinder)**
- Deck de cards com foto, nome, idade, distância, badges de fé
- Gestos: swipe direita (like), esquerda (pass), botões fallback
- Filtros: idade min/max, distância km, gênero de interesse
- Infinite scroll / paginação de candidatos

**Perfil (CatholicMatch)**
- Dados pessoais: nome, nascimento, gênero, bio, cidade/estado
- Dados de fé: paróquia, tipo de igreja, espiritualidade, frequência missa/confissão/leitura bíblia, santo de devoção
- Fotos: 1 principal + até 3 na galeria
- Preferências: idade, distância, casamento sacramental, filhos

**Chat (Tinder)**
- Lista de conversas ordenada por última mensagem
- Thread realtime (Firestore listener ou polling via API)
- Indicador de lido/não lido
- Block/report inline

---

## 4. Backend — estrutura e responsabilidades

### 4.1 Organização (backend/internal)

```text
backend/internal/
├── config/
│   └── config.go               # Env: Firebase, port, CORS
├── models/
│   ├── user.go
│   ├── profile.go
│   ├── faith_profile.go
│   ├── swipe.go                # Swipe, Match, Conversation, Message
│   ├── block.go
│   ├── report.go
│   └── enums.go
├── repositories/
│   ├── user_repo.go
│   ├── profile_repo.go
│   ├── faith_profile_repo.go
│   ├── swipe_repo.go
│   ├── match_repo.go
│   ├── message_repo.go
│   └── geo_repo.go             # Queries por geohash
├── services/
│   ├── auth_service.go         # Valida Firebase token
│   ├── profile_service.go
│   ├── discovery_service.go    # Quem aparece no deck
│   ├── swipe_service.go        # Like/pass + detecta match mútuo
│   ├── match_service.go
│   ├── chat_service.go
│   ├── moderation_service.go   # Aprovar/rejeitar/suspender
│   └── notification_service.go # FCM
├── handlers/
│   ├── auth_handler.go
│   ├── profile_handler.go
│   ├── discover_handler.go
│   ├── swipe_handler.go
│   ├── match_handler.go
│   ├── message_handler.go
│   ├── block_handler.go
│   ├── report_handler.go
│   └── admin_handler.go
└── middleware/
    ├── auth.go                 # Bearer Firebase JWT
    ├── require_approved.go
    ├── require_admin.go
    └── rate_limit.go
```

### 4.2 Por que API Go além do Firebase direto?

| Operação | Client direto | Via API Go |
|----------|---------------|------------|
| Ler próprio perfil | OK | OK |
| Swipe like/pass | Ruim | Valida duplicata, block, status |
| Criar match | Ruim | Transação atômica |
| Discovery deck | Ruim | Filtra blocks, já vistos, geo |
| Aprovar usuário | Inseguro | Só admin |
| Denúncia | Parcial | Workflow completo |

### 4.3 Endpoints REST (MVP)

```text
Auth / Users
  POST   /api/v1/users/bootstrap          # Cria user doc após signup Firebase
  GET    /api/v1/users/me
  PATCH  /api/v1/users/me/status          # admin only

Profile
  GET    /api/v1/profiles/me
  PUT    /api/v1/profiles/me
  POST   /api/v1/profiles/me/photos       # Upload URL assinada Storage
  DELETE /api/v1/profiles/me/photos/:id

Faith Profile
  GET    /api/v1/faith-profiles/me
  PUT    /api/v1/faith-profiles/me

Discovery (Tinder)
  GET    /api/v1/discover                   # Deck paginado
  GET    /api/v1/discover/filters           # Preferências ativas

Swipes
  POST   /api/v1/swipes                     # { to_user_id, action: like|pass|super_like }
  GET    /api/v1/swipes/sent                # Histórico (debug/admin)

Matches
  GET    /api/v1/matches
  GET    /api/v1/matches/:id
  DELETE /api/v1/matches/:id                # Unmatch

Chat
  GET    /api/v1/matches/:id/messages
  POST   /api/v1/matches/:id/messages
  PATCH  /api/v1/matches/:id/messages/:msgId/read

Safety
  POST   /api/v1/blocks
  DELETE /api/v1/blocks/:userId
  POST   /api/v1/reports

Admin (CatholicMatch)
  GET    /api/v1/admin/users/pending
  POST   /api/v1/admin/users/:id/approve
  POST   /api/v1/admin/users/:id/reject
  GET    /api/v1/admin/reports
  PATCH  /api/v1/admin/reports/:id
```

---

## 5. Database — Firestore (schema alvo)

> Migração conceitual do schema Supabase atual (profiles, likes, matches, messages, blocks, reports) para Firestore, mantendo os campos já usados no app.

### 5.1 Coleções principais

```text
/users/{userId}
/profiles/{userId}                    # doc id = userId (1:1)
/faith_profiles/{userId}              # doc id = userId (1:1)
/swipes/{swipeId}
/matches/{matchId}
/messages/{messageId}
/blocks/{blockId}
/reports/{reportId}
```
