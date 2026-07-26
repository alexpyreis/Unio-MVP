# Unio â€” Estrutura Front / Back / Database

> Documento de referÃªncia arquitetural. Inspirado no **Tinder** (UX de dating) e no **CatholicMatch** (perfil de fÃ©, moderaÃ§Ã£o, intenÃ§Ã£o matrimonial).  
> Alinhado Ã s decisÃµes: **Brasil primeiro**, **mobile/web (PWA)**, **Firebase**, **monetizaÃ§Ã£o depois do MVP**.

---

## 1. ReferÃªncias e o que cada uma traz

| ReferÃªncia | O que copiamos | O que adaptamos para o Unio |
|------------|----------------|-------------------------------------|
| **Tinder** | Swipe (like/pass), deck de cards, match mÃºtuo, chat pÃ³s-match, filtros de idade/distÃ¢ncia, bottom tabs (Discover / Matches / Chat / Profile) | Sem foco em hookup; perfil de fÃ© visÃ­vel no card; aprovaÃ§Ã£o manual antes de entrar no app |
| **CatholicMatch** | Campos catÃ³licos (missa, sacramentos, parÃ³quia, espiritualidade), intenÃ§Ã£o de casamento sacramental, moderaÃ§Ã£o/admin, certificado de batismo (opcional) | UX mais moderna e mobile-first; fluxo Tinder em vez de browse/listagem; contexto brasileiro (PT-BR, dioceses BR) |

---

## 2. VisÃ£o geral da arquitetura

```
Unio-MVP/
â”œâ”€â”€ backend/                    # API Go + Gin (regras de negÃ³cio no servidor)
â”‚   â”œâ”€â”€ cmd/api/                # Entry point
â”‚   â””â”€â”€ internal/
â”‚       â”œâ”€â”€ config/
â”‚       â”œâ”€â”€ models/             # Entidades de domÃ­nio
â”‚       â”œâ”€â”€ repositories/       # Firestore + Storage
â”‚       â”œâ”€â”€ services/           # Matching, swipe, chat, moderaÃ§Ã£o
â”‚       â”œâ”€â”€ handlers/           # HTTP REST
â”‚       â””â”€â”€ middleware/         # Auth Firebase JWT, admin, rate limit
â”‚
â”œâ”€â”€ frontend-app/               # Next.js 14 â€” PWA mobile-first (app principal)
â”‚   â”œâ”€â”€ app/                    # App Router
â”‚   â”œâ”€â”€ components/             # UI compartilhada (shadcn/ui)
â”‚   â”œâ”€â”€ features/               # MÃ³dulos por domÃ­nio
â”‚   â”œâ”€â”€ lib/                    # Firebase client, API client
â”‚   â””â”€â”€ public/                 # manifest PWA, Ã­cones
â”‚
â”œâ”€â”€ frontend-admin/             # Next.js â€” moderaÃ§Ã£o (fase 2)
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ users/              # Aprovar/rejeitar perfis
â”‚       â”œâ”€â”€ reports/            # DenÃºncias
â”‚       â””â”€â”€ analytics/          # MÃ©tricas bÃ¡sicas
â”‚
â”œâ”€â”€ firebase/                   # Config infra Firebase
â”‚   â”œâ”€â”€ firestore.rules
â”‚   â”œâ”€â”€ storage.rules
â”‚   â””â”€â”€ indexes.json
â”‚
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ AI_DEV_DIRECTIVE.md
â”‚   â”œâ”€â”€ PLANO_MVP.md
â”‚   â””â”€â”€ ARQUITETURA_FIRESTORE.md
â”‚
â””â”€â”€ prompts/                    # ImplementaÃ§Ã£o faseada (estilo ImobiliÃ¡ria)
    â”œâ”€â”€ 01_foundation_auth_profile.txt
    â”œâ”€â”€ 02_discovery_swipe_match.txt
    â”œâ”€â”€ 03_chat_realtime.txt
    â””â”€â”€ 04_moderation_admin.txt
```

### Stack

| Camada | Tecnologia | Motivo |
|--------|------------|--------|
| Auth | Firebase Authentication | Email/senha + Google (Apple depois) |
| Banco | Firestore | Realtime nativo, escala, jÃ¡ familiar do ImobiliÃ¡ria |
| Fotos / docs | Firebase Storage | Fotos de perfil + certificado de batismo |
| Push | Firebase Cloud Messaging (FCM) | Match novo, mensagem nova |
| API | Go + Gin â†’ Cloud Run | Regras anti-fraude, matching, moderaÃ§Ã£o |
| App | Next.js 14 + TypeScript + shadcn/ui + Tailwind | PWA instalÃ¡vel no celular |
| Estado | TanStack Query + Zustand | Cache de API + estado local de UI |
| Deploy | Vercel (front) + Cloud Run (back) | Mesmo padrÃ£o do ImobiliÃ¡ria |

---

## 3. Frontend â€” estrutura e telas

### 3.1 OrganizaÃ§Ã£o de pastas (`frontend-app`)

```
frontend-app/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ (public)/               # Sem auth
â”‚   â”‚   â”œâ”€â”€ page.tsx            # Landing
â”‚   â”‚   â”œâ”€â”€ login/
â”‚   â”‚   â”œâ”€â”€ signup/
â”‚   â”‚   â””â”€â”€ reset-password/
â”‚   â”‚
â”‚   â”œâ”€â”€ (onboarding)/           # Auth, perfil incompleto
â”‚   â”‚   â”œâ”€â”€ signup-submitted/
â”‚   â”‚   â”œâ”€â”€ account-under-review/
â”‚   â”‚   â”œâ”€â”€ welcome/
â”‚   â”‚   â””â”€â”€ complete-profile/
â”‚   â”‚
â”‚   â””â”€â”€ (app)/                  # UsuÃ¡rio aprovado â€” shell com bottom tabs
â”‚       â”œâ”€â”€ home/               # Discover (swipe) â€” equivalente Tinder
â”‚       â”œâ”€â”€ matches/
â”‚       â”œâ”€â”€ chat/
â”‚       â”‚   â””â”€â”€ [matchId]/
â”‚       â”œâ”€â”€ profile/
â”‚       â”‚   â””â”€â”€ edit/
â”‚       â”œâ”€â”€ settings/
â”‚       â”‚   â”œâ”€â”€ personal-info/
â”‚       â”‚   â”œâ”€â”€ privacy-security/
â”‚       â”‚   â””â”€â”€ change-password/
â”‚       â””â”€â”€ support/
â”‚
â”œâ”€â”€ features/
â”‚   â”œâ”€â”€ auth/                   # AuthProvider, hooks, guards
â”‚   â”œâ”€â”€ profile/                # CRUD perfil + fÃ© + fotos
â”‚   â”œâ”€â”€ discover/               # Deck de cards, swipe gestures
â”‚   â”œâ”€â”€ matches/                # Lista de matches
â”‚   â”œâ”€â”€ chat/                   # Mensagens realtime
â”‚   â”œâ”€â”€ settings/               # PreferÃªncias, block
â”‚   â””â”€â”€ location/               # GeolocalizaÃ§Ã£o + sync
â”‚
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ ui/                     # shadcn
â”‚   â”œâ”€â”€ BottomTabs.tsx          # Home | Matches | Chat | Profile
â”‚   â”œâ”€â”€ ProfileCard.tsx         # Card estilo Tinder
â”‚   â”œâ”€â”€ SwipeDeck.tsx
â”‚   â””â”€â”€ MatchModal.tsx          # "It's a Match!"
â”‚
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ firebase.ts
â”‚   â”œâ”€â”€ api-client.ts           # Chamadas ao backend Go
â”‚   â””â”€â”€ geo.ts
â”‚
â””â”€â”€ routes/
    â””â”€â”€ RouteGuards.tsx         # PublicOnly, RequireAuth, RequireApproved
```

### 3.2 Mapa de rotas (jÃ¡ existente no projeto atual â†’ alvo)

| Rota atual (Vite) | Rota alvo (Next.js) | ReferÃªncia | DescriÃ§Ã£o |
|-------------------|---------------------|------------|-----------|
| `/` | `/` | CatholicMatch | Landing pÃºblica |
| `/login` | `/login` | â€” | Login |
| `/signup` | `/signup` | CatholicMatch | Cadastro + upload certificado batismo |
| `/signup-submitted` | `/signup-submitted` | CatholicMatch | ConfirmaÃ§Ã£o pÃ³s-cadastro |
| `/account-under-review` | `/account-under-review` | CatholicMatch | Aguardando aprovaÃ§Ã£o admin |
| `/welcome` | `/welcome` | â€” | Boas-vindas pÃ³s-aprovaÃ§Ã£o |
| `/complete-profile` | `/complete-profile` | CatholicMatch | Onboarding fÃ© + fotos + preferÃªncias |
| `/home` | `/home` | **Tinder** | Discover â€” swipe like/pass |
| `/matches` | `/matches` | **Tinder** | Lista de matches |
| `/chat` | `/chat`, `/chat/[matchId]` | **Tinder** | Conversas |
| `/profile` | `/profile` | Ambos | Ver prÃ³prio perfil |
| `/profile/editprofile` | `/profile/edit` | CatholicMatch | Editar perfil + fÃ© |
| `/settings/*` | `/settings/*` | Ambos | ConfiguraÃ§Ãµes |
| `/admin` | `frontend-admin` | CatholicMatch | Painel moderaÃ§Ã£o (separado) |

### 3.3 Fluxo de navegaÃ§Ã£o (estilo Tinder)

```mermaid
flowchart TD
    A[Landing] --> B[Signup / Login]
    B --> C[Signup Submitted]
    C --> D{Admin aprovou?}
    D -->|NÃ£o| E[Account Under Review]
    D -->|Sim| F[Welcome]
    F --> G[Complete Profile]
    G --> H[Home - Discover]
    H --> I{Swipe}
    I -->|Like mÃºtuo| J[Match Modal]
    J --> K[Chat]
    I -->|Pass| H
    H --> L[Matches Tab]
    L --> K
```

### 3.4 Componentes-chave por feature

**Discover (Tinder)**
- Deck de cards com foto, nome, idade, distÃ¢ncia, badges de fÃ©
- Gestos: swipe direita (like), esquerda (pass), botÃµes fallback
- Filtros: idade min/max, distÃ¢ncia km, gÃªnero de interesse
- Infinite scroll / paginaÃ§Ã£o de candidatos

**Perfil (CatholicMatch)**
- Dados pessoais: nome, nascimento, gÃªnero, bio, cidade/estado
- Dados de fÃ©: parÃ³quia, tipo de igreja, espiritualidade, frequÃªncia missa/confissÃ£o/leitura bÃ­blia, santo de devoÃ§Ã£o
- Fotos: 1 principal + atÃ© 3 na galeria
- PreferÃªncias: idade, distÃ¢ncia, casamento sacramental, filhos

**Chat (Tinder)**
- Lista de conversas ordenada por Ãºltima mensagem
- Thread realtime (Firestore listener ou polling via API)
- Indicador de lido/nÃ£o lido
- Block/report inline

---

## 4. Backend â€” estrutura e responsabilidades

### 4.1 OrganizaÃ§Ã£o (`backend/internal`)

```
backend/internal/
â”œâ”€â”€ config/
â”‚   â””â”€â”€ config.go               # Env: Firebase, port, CORS
â”‚
â”œâ”€â”€ models/
â”‚   â”œâ”€â”€ user.go
â”‚   â”œâ”€â”€ profile.go
â”‚   â”œâ”€â”€ faith_profile.go
â”‚   â”œâ”€â”€ swipe.go                # Swipe, Match, Conversation, Message
â”‚   â”œâ”€â”€ block.go
â”‚   â”œâ”€â”€ report.go
â”‚   â””â”€â”€ enums.go
â”‚
â”œâ”€â”€ repositories/
â”‚   â”œâ”€â”€ user_repo.go
â”‚   â”œâ”€â”€ profile_repo.go
â”‚   â”œâ”€â”€ faith_profile_repo.go
â”‚   â”œâ”€â”€ swipe_repo.go
â”‚   â”œâ”€â”€ match_repo.go
â”‚   â”œâ”€â”€ message_repo.go
â”‚   â””â”€â”€ geo_repo.go             # Queries por geohash
â”‚
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ auth_service.go         # Valida Firebase token
â”‚   â”œâ”€â”€ profile_service.go
â”‚   â”œâ”€â”€ discovery_service.go    # Quem aparece no deck
â”‚   â”œâ”€â”€ swipe_service.go        # Like/pass + detecta match mÃºtuo
â”‚   â”œâ”€â”€ match_service.go
â”‚   â”œâ”€â”€ chat_service.go
â”‚   â”œâ”€â”€ moderation_service.go   # Aprovar/rejeitar/suspender
â”‚   â””â”€â”€ notification_service.go # FCM
â”‚
â”œâ”€â”€ handlers/
â”‚   â”œâ”€â”€ auth_handler.go
â”‚   â”œâ”€â”€ profile_handler.go
â”‚   â”œâ”€â”€ discover_handler.go
â”‚   â”œâ”€â”€ swipe_handler.go
â”‚   â”œâ”€â”€ match_handler.go
â”‚   â”œâ”€â”€ message_handler.go
â”‚   â”œâ”€â”€ block_handler.go
â”‚   â”œâ”€â”€ report_handler.go
â”‚   â””â”€â”€ admin_handler.go
â”‚
â””â”€â”€ middleware/
    â”œâ”€â”€ auth.go                 # Bearer Firebase JWT
    â”œâ”€â”€ require_approved.go
    â”œâ”€â”€ require_admin.go
    â””â”€â”€ rate_limit.go
```

### 4.2 Por que API Go alÃ©m do Firebase direto?

| OperaÃ§Ã£o | Client direto | Via API Go |
|----------|---------------|------------|
| Ler prÃ³prio perfil | OK | OK |
| Swipe like/pass | âŒ FrÃ¡gil | âœ… Valida duplicata, block, status |
| Criar match | âŒ Race condition | âœ… TransaÃ§Ã£o atÃ´mica |
| Discovery deck | âŒ ExpÃµe lÃ³gica | âœ… Filtra blocks, jÃ¡ vistos, geo |
| Aprovar usuÃ¡rio | âŒ Inseguro | âœ… SÃ³ admin |
| DenÃºncia | Parcial | âœ… Workflow completo |

### 4.3 Endpoints REST (MVP)

```
Auth / Users
  POST   /api/v1/users/bootstrap          # Cria user doc apÃ³s signup Firebase
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
  GET    /api/v1/discover/filters           # PreferÃªncias ativas

Swipes
  POST   /api/v1/swipes                     # { to_user_id, action: like|pass|super_like }
  GET    /api/v1/swipes/sent                # HistÃ³rico (debug/admin)

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

## 5. Database â€” Firestore (schema alvo)

> MigraÃ§Ã£o conceitual do schema Supabase atual (`profiles`, `likes`, `matches`, `messages`, `blocks`, `reports`) para Firestore, mantendo os campos jÃ¡ usados no app.

### 5.1 ColeÃ§Ãµes principais

```
/users/{userId}
/profiles/{userId}                    # doc id = userId (1:1)
/faith_profiles/{userId}              # doc id = userId (1:1)
/swipes/{swipeId}
/matches/{matchId}
/conversations/{conversationId}
/conversations/{conversationId}/messages/{messageId}
/blocks/{blockId}
/reports/{reportId}
/user_roles/{userId}                  # admin | user
/discovery_index/{geohash}/users/{userId}   # Ã­ndice geo (opcional, fase 2)
```

### 5.2 Documento: `users/{userId}`

```json
{
  "email": "maria@email.com",
  "role": "user",
  "status": "pending | approved | rejected | suspended",
  "onboarding_completed": false,
  "rejection_reason": null,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "last_active_at": "timestamp"
}
```

**Origem:** `auth.users` + `user_roles` + `profiles.status` (Supabase atual)

### 5.3 Documento: `profiles/{userId}`

```json
{
  "user_id": "uid",
  "first_name": "Maria",
  "last_name": "Silva",
  "display_name": "Maria, 28",
  "gender": "female",
  "date_of_birth": "1998-03-15",
  "age": 28,
  "bio": "CatÃ³lica praticante...",
  "profile_photo_url": "gs://...",
  "gallery_photos": ["url1", "url2"],
  "location": {
    "latitude": -23.55,
    "longitude": -46.63,
    "geohash": "6gyf4",
    "city": "SÃ£o Paulo",
    "state": "SP"
  },
  "preferences": {
    "min_age": 25,
    "max_age": 35,
    "max_distance_km": 50,
    "gender_interest": ["male"]
  },
  "marital_status": "Solteira",
  "education_level": "Ensino superior completo",
  "interests": ["mÃºsica", "voluntariado"],
  "is_discoverable": true,
  "show_distance": true,
  "show_age": true,
  "profile_completed": true,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Origem:** tabela `profiles` Supabase + campos de `sync_profiles_schema`

### 5.4 Documento: `faith_profiles/{userId}`

```json
{
  "user_id": "uid",
  "parish": "ParÃ³quia SÃ£o JosÃ©",
  "church_type": "Paroquia",
  "spirituality": "Mariana",
  "devotion_saint": "Nossa Senhora de FÃ¡tima",
  "mass_frequency_display": "Semanalmente",
  "confession_frequency_display": "Mensalmente",
  "bible_reading_frequency_display": "Diariamente",
  "baptism_certificate_url": "gs://baptism-certificates/...",
  "wants_children": true,
  "open_to_sacramental_marriage": true,
  "faith_tags": ["adoracao", "terÃ§o"],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Origem:** colunas catÃ³licas do `profiles` Supabase, separadas para clareza (padrÃ£o CatholicMatch)

### 5.5 Documento: `swipes/{swipeId}`

```json
{
  "id": "auto",
  "from_user_id": "uid_a",
  "to_user_id": "uid_b",
  "action": "like | pass | super_like",
  "created_at": "timestamp"
}
```

**Ãndices compostos:**
- `(from_user_id, created_at DESC)` â€” histÃ³rico
- `(from_user_id, to_user_id)` â€” UNIQUE lÃ³gico (via API)

**Origem:** tabela `likes` Supabase (+ `pass` que hoje nÃ£o persiste â€” adicionar no Firestore)

### 5.6 Documento: `matches/{matchId}`

```json
{
  "id": "auto",
  "user_ids": ["uid_a", "uid_b"],
  "created_at": "timestamp",
  "last_message_at": "timestamp",
  "last_message_preview": "Oi! Tudo bem?"
}
```

**Origem:** tabela `matches` Supabase (`user1_id`, `user2_id` â†’ `user_ids` ordenados)

**Regra de negÃ³cio (Tinder):** criado automaticamente quando existe like mÃºtuo (equivalente ao trigger `check_mutual_like()` do Supabase).

### 5.7 SubcoleÃ§Ã£o: `conversations/{id}/messages/{messageId}`

```json
{
  "id": "auto",
  "conversation_id": "match_id",
  "sender_id": "uid",
  "text": "OlÃ¡!",
  "created_at": "timestamp",
  "read_at": null
}
```

**Origem:** tabela `messages` Supabase (`read_status` â†’ `read_at`)

**Realtime:** Firestore `onSnapshot` na subcoleÃ§Ã£o (equivalente ao `supabase_realtime` atual)

### 5.8 Documentos: `blocks` e `reports`

```json
// blocks/{blockId}
{
  "blocker_id": "uid",
  "blocked_id": "uid",
  "created_at": "timestamp"
}

// reports/{reportId}
{
  "reporter_id": "uid",
  "reported_id": "uid",
  "reason": "spam",
  "details": "...",
  "status": "open | reviewed | closed",
  "admin_notes": null,
  "created_at": "timestamp"
}
```

### 5.9 Firebase Storage â€” buckets

| Bucket | PÃºblico | Uso | Origem Supabase |
|--------|---------|-----|-----------------|
| `profile-photos` | Sim | Fotos de perfil e galeria | `profile-photos` |
| `baptism-certificates` | NÃ£o | Certificado de batismo (moderaÃ§Ã£o) | `baptism-certificates` |

Estrutura de path: `{userId}/{filename}`

### 5.10 Ãndices Firestore recomendados

```
profiles:    is_discoverable ASC, gender ASC, age ASC
profiles:    location.geohash ASC, is_discoverable ASC
swipes:      from_user_id ASC, to_user_id ASC
swipes:      from_user_id ASC, created_at DESC
matches:     user_ids ARRAY_CONTAINS, last_message_at DESC
messages:    conversation_id ASC, created_at ASC
reports:     status ASC, created_at DESC
users:       status ASC, created_at ASC
```

### 5.11 Geo / distÃ¢ncia (Brasil)

Firestore nÃ£o tem PostGIS. EstratÃ©gia MVP:

1. Salvar `lat/lng` + `geohash` (precisÃ£o ~5 = ~5 km)
2. Query por prefixos de geohash adjacentes
3. Filtrar distÃ¢ncia exata no backend Go (Haversine)
4. Campo `preferences.max_distance_km` (jÃ¡ existe como `distance_max` no Supabase)

---

## 6. Regras de seguranÃ§a (Firestore + Storage)

### PrincÃ­pios

- Client **lÃª** mensagens do prÃ³prio match (realtime)
- Client **nÃ£o escreve** swipes, matches, aprovaÃ§Ãµes â€” sÃ³ via API Go
- Admin via custom claims Firebase (`role: admin`)
- Certificado de batismo: leitura sÃ³ owner + admin

### Status do usuÃ¡rio (CatholicMatch â†’ Unio)

```
pending   â†’ cadastrou, aguarda admin
approved  â†’ pode usar discover/chat
rejected  â†’ cadastro recusado (motivo em rejection_reason)
suspended â†’ ban temporÃ¡rio/permanente
```

Route guard `RequireApproved` no frontend bloqueia acesso ao app atÃ© `status === approved`.

---

## 7. Mapeamento: projeto atual â†’ arquitetura alvo

| Hoje (Downloads/faith-match-main) | Alvo |
|-----------------------------------|------|
| Vite + React Router | Next.js 14 App Router + PWA |
| Supabase Auth | Firebase Auth |
| Supabase Postgres | Firestore |
| Supabase Storage | Firebase Storage |
| Supabase Realtime (messages) | Firestore onSnapshot |
| LÃ³gica no client + RLS | Client + API Go |
| `likes` table | `swipes` collection (like + pass) |
| `profiles` monolÃ­tico | `profiles` + `faith_profiles` |
| `/admin` no mesmo app | `frontend-admin` separado |
| Features: auth, profile | + discover, matches, chat, settings |

### Modelos Go jÃ¡ iniciados (Projects/faith-match)

Estes arquivos jÃ¡ definem o contrato alvo do backend:

- `models/user.go` â€” User, status, role
- `models/profile.go` â€” Profile, GeoLocation, DiscoveryPreferences
- `models/faith_profile.go` â€” campos catÃ³licos migrados do Supabase
- `models/swipe.go` â€” Swipe, Match, Conversation, Message, Block, Report
- `models/enums.go` â€” Gender, SwipeAction, ChurchType, Spirituality, etc.

---

## 8. MVP â€” fases de implementaÃ§Ã£o

### Fase 1 â€” FundaÃ§Ã£o (2â€“3 semanas)
- [ ] Firebase project (Auth, Firestore, Storage)
- [ ] Backend Go: bootstrap user, profile, faith_profile
- [ ] Frontend: landing, signup, login, guards
- [ ] Upload fotos + certificado batismo
- [ ] Admin: fila de aprovaÃ§Ã£o bÃ¡sica

### Fase 2 â€” Core Tinder (2â€“3 semanas)
- [ ] Discovery deck + swipe API
- [ ] Match mÃºtuo automÃ¡tico
- [ ] Lista de matches
- [ ] Filtros idade/distÃ¢ncia/gÃªnero
- [ ] Block bÃ¡sico

### Fase 3 â€” Chat (1â€“2 semanas)
- [ ] Mensagens realtime
- [ ] FCM: novo match, nova mensagem
- [ ] Report/denÃºncia

### Fase 4 â€” Polish (1 semana)
- [ ] PWA manifest + Ã­cones
- [ ] UX mobile (gestos, animaÃ§Ãµes)
- [ ] Landing SEO PT-BR

### Fora do MVP
- Pagamentos / premium (CatholicMatch tem assinatura)
- Super like / boost (Tinder monetiza)
- VerificaÃ§Ã£o de identidade
- Videochamada
- IntegraÃ§Ã£o parÃ³quias/dioceses

---

## 9. Diferenciais Unio vs Tinder puro

| Feature | Tinder | Unio |
|---------|--------|-------------|
| AprovaÃ§Ã£o manual | NÃ£o | Sim (CatholicMatch) |
| Perfil de fÃ© | NÃ£o | Sim â€” missa, sacramentos, parÃ³quia |
| Certificado batismo | NÃ£o | Opcional no cadastro |
| IntenÃ§Ã£o matrimonial | Opcional | Campo explÃ­cito |
| PÃºblico | Geral | CatÃ³licos â€” Brasil primeiro |
| Idioma | Global | PT-BR nativo |

---

## 10. PrÃ³ximos passos sugeridos

1. Validar este documento (campos de perfil, fluxo de aprovaÃ§Ã£o, rotas)
2. Criar projeto Firebase (`unio-mvp-br` ou similar)
3. Scaffold `frontend-app` Next.js PWA migrando pÃ¡ginas do Vite
4. Completar backend Go (repositories + handlers + services)
5. Script de migraÃ§Ã£o Supabase â†’ Firestore (se quiser preservar dados de teste)

---

*Gerado com base no projeto existente em `Downloads/faith-match-main`, modelos Go em `Projects/faith-match`, padrÃ£o arquitetural do repositÃ³rio ImobiliÃ¡ria, e referÃªncias Tinder + CatholicMatch.*

