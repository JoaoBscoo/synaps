---
name: project-synaps
description: Synaps SaaS MVP — multi-tenant project management platform at synaps.app.br. Full stack created from scratch.
metadata:
  type: project
---

Synaps MVP criado em c:\Users\joao.bosco\Documents\ProjetoSynaps.

**Why:** SaaS de gerenciamento de projetos multi-tenant concorrente do Trello/Miro, focado em consultores com clientes externos. Hospedagem: Railway (backend) + Vercel (frontend) + Neon (banco).

**How to apply:** Quando o usuário fizer perguntas sobre o projeto, referir a esta estrutura. Backend em /backend, frontend em /frontend.

## Stack
- Backend: Node.js + Express + Prisma ORM + PostgreSQL
- Frontend: React + Vite + TailwindCSS
- Auth: Passport.js (Google OAuth + Microsoft Azure AD) + JWT
- Email: SendGrid

## Arquitetura Multi-tenant
- Todo query Prisma inclui `tenantId` (isolamento obrigatório)
- Middleware `requireTenant(minRole?)` verifica acesso antes de cada rota
- Roles: OWNER > EDITOR > VIEWER = CLIENT

## Dados de Seed
- Tenant: "Consultoria Nexus" (slug: consultoria-nexus)
- 3 usuários, 8 projetos em português
- Rodar: `cd backend && npm run prisma:seed`

## Deploy Flow
1. Push GitHub
2. Neon → DATABASE_URL
3. Railway → backend (setar env vars)
4. Vercel → frontend (VITE_API_URL=https://api.synaps.app.br)
5. Google Cloud Console → OAuth app
6. Azure AD → App registration

## Arquivos sensíveis
- `client_secret_*.json` na raiz — credenciais Google OAuth reais, NÃO subir pro git
- `.gitignore` configurado para excluir
