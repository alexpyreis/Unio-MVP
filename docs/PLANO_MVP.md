# Plano MVP — Unio

## Objetivo

Lançar um app funcional para católicos no Brasil: cadastro, aprovação, discover (swipe), match mútuo e chat.

## Decisões fechadas

- **Mercado:** Brasil (PT-BR)
- **Plataforma:** Mobile/Web PWA (expandir para app nativo depois)
- **Banco:** Firebase (Auth + Firestore + Storage + FCM)
- **Monetização:** Depois do MVP funcionando

## Fases

### Fase 1 — Fundação
- [ ] Projeto Firebase configurado
- [ ] Backend Go: health check + auth middleware
- [ ] Frontend: landing, signup, login
- [ ] Bootstrap de usuário no Firestore

### Fase 2 — Perfil e moderação
- [ ] Onboarding (perfil básico + fé + fotos)
- [ ] Status `pending` → tela "conta em análise"
- [ ] Admin: aprovar/rejeitar usuários

### Fase 3 — Core dating (Tinder)
- [ ] Discover deck + swipe (like/pass)
- [ ] Match mútuo automático
- [ ] Lista de matches
- [ ] Filtros: idade, distância, gênero

### Fase 4 — Comunicação
- [ ] Chat em tempo real
- [ ] Push notifications (FCM)
- [ ] Block / report

### Fase 5 — Polish
- [ ] PWA instalável
- [ ] UX mobile (gestos, animações)
- [ ] Landing SEO

## Fora do MVP

- Pagamentos / premium
- Super like / boost
- Verificação de identidade
- Videochamada
- Integração com paróquias
