# ⬡ Synaps — Plataforma de Gerenciamento de Projetos

**Synaps** é um SaaS multi-tenant de gerenciamento de projetos para consultores que atendem clientes externos. Concorrente direto de Trello e Miro, com identidade visual inspirada em sinapses cerebrais.

🌐 **synaps.app.br**

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL (Neon) |
| Auth | Passport.js (Google + Microsoft OAuth) + JWT |
| Frontend | React + Vite + TypeScript |
| Estilo | TailwindCSS (design system customizado) |
| Hospedagem | Railway (backend) + Vercel (frontend) |

---

## Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Conta no [Neon](https://neon.tech) (banco PostgreSQL)
- App OAuth no Google Cloud Console
- App OAuth no Azure AD (Microsoft)
- Conta no [SendGrid](https://sendgrid.com) (opcional, para emails)

---

## Setup Local

### 1. Clone e instale dependências

```bash
git clone https://github.com/seu-usuario/synaps.git
cd synaps

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure variáveis de ambiente

```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas credenciais

# Frontend
cp frontend/.env.example frontend/.env.local
# Edite frontend/.env.local
```

### 3. Configure o banco de dados

```bash
cd backend

# Gerar cliente Prisma
npm run prisma:generate

# Criar tabelas
npm run prisma:migrate

# Popular com dados de exemplo (opcional)
npm run prisma:seed
```

### 4. Rode o projeto

```bash
# Terminal 1 — Backend (porta 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (porta 5173)
cd frontend && npm run dev
```

Acesse: http://localhost:5173

---

## Configuração OAuth

### Google OAuth

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services → Credentials**
4. Clique em **Create Credentials → OAuth 2.0 Client IDs**
5. Tipo de aplicação: **Web application**
6. Adicione URIs autorizados:
   - **Authorized JavaScript origins**: `http://localhost:5173` (dev) e `https://synaps.app.br` (prod)
   - **Authorized redirect URIs**: `http://localhost:3001/auth/google/callback` (dev) e `https://api.synaps.app.br/auth/google/callback` (prod)
7. Copie **Client ID** e **Client Secret** para o `.env`

### Microsoft Azure AD

1. Acesse [portal.azure.com](https://portal.azure.com)
2. Vá em **Microsoft Entra ID → App registrations → New registration**
3. Nome: `Synaps`
4. Tipos de conta suportados: **Accounts in any organizational directory and personal Microsoft accounts**
5. Redirect URI: `http://localhost:3001/auth/microsoft/callback` (Web)
6. Após criar, vá em **Certificates & Secrets → New client secret**
7. Copie o **Client ID** (Application ID) e o **Client Secret** para o `.env`
8. Em **Authentication**, adicione o redirect URI de produção: `https://api.synaps.app.br/auth/microsoft/callback`

### Variáveis de Ambiente Explicadas

#### backend/.env

```env
# PostgreSQL connection string do Neon
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# Chave secreta para assinar JWT (min 32 chars, use: openssl rand -base64 32)
JWT_SECRET=

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Microsoft OAuth (portal.azure.com → App registrations)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=common  # ou o tenant ID específico

# URL do backend (usado nos callbacks OAuth)
BACKEND_URL=https://api.synaps.app.br

# URL do frontend (para redirecionar após login)
FRONTEND_URL=https://synaps.app.br

# SendGrid (opcional — sem isso, emails são logados no console)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@synaps.app.br

PORT=3001
NODE_ENV=production
```

#### frontend/.env.local

```env
# URL da API (sem barra no final)
VITE_API_URL=https://api.synaps.app.br

VITE_APP_NAME=Synaps
```

> **Nota de desenvolvimento**: Em dev, o `vite.config.ts` já configura proxy para `http://localhost:3001`, então `VITE_API_URL` pode ficar vazio ou apontar para localhost.

---

## Deploy

### Railway (Backend)

1. Crie conta em [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub repo**
3. Selecione o repositório, raiz: `/backend`
4. Configure variáveis de ambiente no dashboard do Railway
5. Na aba **Settings**, configure:
   - **Start command**: `npm run prisma:migrate:prod && npm start`
   - **Root directory**: `backend`
6. Adicione um domínio customizado: `api.synaps.app.br`
7. Após o primeiro deploy, rode o seed:
   ```bash
   railway run npm run prisma:seed
   ```

### Vercel (Frontend)

1. Crie conta em [vercel.com](https://vercel.com)
2. **Import Git Repository**
3. Selecione o repositório, **Root Directory**: `frontend`
4. Configure variáveis de ambiente:
   - `VITE_API_URL` = `https://api.synaps.app.br`
5. Deploy automático a cada push na branch `main`
6. Configure domínio customizado: `synaps.app.br`

### Neon (Banco de Dados)

1. Crie conta em [neon.tech](https://neon.tech)
2. **New Project** → escolha região próxima (ex: `us-east-1`)
3. Copie a **Connection string** para `DATABASE_URL`
4. O Neon tem auto-scaling e suporte nativo a Prisma

---

## Estrutura do Projeto

```
synaps/
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.ts          # Singleton do Prisma Client
│   │   │   └── passport.ts        # Config OAuth (Google + Microsoft)
│   │   ├── middleware/
│   │   │   ├── auth.ts            # Verificação JWT
│   │   │   └── tenant.ts          # Isolamento multi-tenant + controle de roles
│   │   ├── routes/
│   │   │   ├── auth.ts            # OAuth callbacks + /auth/me
│   │   │   ├── tenants.ts         # CRUD workspace + membros + convites
│   │   │   ├── projects.ts        # CRUD projetos + audit log
│   │   │   ├── tasks.ts           # CRUD tarefas
│   │   │   └── dashboard.ts       # KPIs e métricas agregadas
│   │   ├── services/
│   │   │   └── email.ts           # Envio de convites via SendGrid
│   │   └── index.ts               # App Express principal
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts                # Dados de exemplo em português
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx          # Sidebar + nav + header mobile
│   │   │   ├── SynapseBackground.tsx # Animação canvas de nós/sinapses
│   │   │   ├── ProjectCard.tsx     # Card com health score circular
│   │   │   ├── KPIBar.tsx          # Linha de métricas do dashboard
│   │   │   ├── StatusDonut.tsx     # Gráfico donut (Recharts)
│   │   │   ├── DeadlineTimeline.tsx # Próximos prazos
│   │   │   ├── AlertsPanel.tsx     # Projetos com alertas
│   │   │   ├── ProjectForm.tsx     # Formulário create/edit com Zod
│   │   │   ├── MemberManager.tsx   # Gerenciar equipe
│   │   │   └── InviteModal.tsx     # Enviar convite por email
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          # Context de autenticação
│   │   │   └── useTenant.ts        # Dados do workspace atual
│   │   ├── pages/
│   │   │   ├── Landing.tsx         # Landing page pública
│   │   │   ├── Login.tsx           # Login Google/Microsoft
│   │   │   ├── AuthCallback.tsx    # Processa token OAuth
│   │   │   ├── Invite.tsx          # Aceitar convite
│   │   │   ├── Dashboard.tsx       # Dashboard com polling 30s
│   │   │   ├── Projects.tsx        # Lista/busca/filtros
│   │   │   ├── ProjectNew.tsx      # Criar projeto
│   │   │   ├── ProjectDetail.tsx   # Detalhe + tasks + audit log
│   │   │   ├── ProjectEdit.tsx     # Editar projeto
│   │   │   └── Settings.tsx        # Workspace + membros
│   │   ├── services/
│   │   │   └── api.ts              # Axios + interceptors JWT
│   │   ├── types/
│   │   │   └── index.ts            # Tipos TypeScript + constantes UI
│   │   ├── App.tsx                 # Router + AuthProvider
│   │   ├── main.tsx               # Entry point + QueryClient
│   │   └── index.css              # Tailwind + CSS vars + componentes
│   └── package.json
└── README.md
```

---

## Modelo de Dados

```
Tenant (workspace)
  └── TenantUser (usuários do workspace, com role)
       └── User (conta global OAuth)
  └── Project (isolado por tenantId)
       └── Task
       └── AuditLog
  └── Invite (tokens de convite por email)
```

**Roles:**
- `OWNER` — acesso total, gerencia membros
- `EDITOR` — cria e edita projetos
- `VIEWER` — somente leitura
- `CLIENT` — cliente externo, vê seus projetos

---

## Segurança

- ✅ JWT com expiração de 7 dias
- ✅ Rate limiting: 300 req/15min global, 20 req/15min para auth
- ✅ Todo query inclui `tenantId` — isolamento multi-tenant garantido
- ✅ Validação de inputs com Zod em todas as rotas
- ✅ Slug sanitizado: remove acentos, espaços e caracteres especiais
- ✅ Helmet para headers HTTP de segurança
- ✅ CORS configurado para o domínio do frontend

---

## Dados de Exemplo (Seed)

Após rodar `npm run prisma:seed`, você terá:

| Item | Detalhe |
|------|---------|
| Workspace | Consultoria Nexus (`/w/consultoria-nexus`) |
| OWNER | dono@nexus.com.br (Carlos Mendes) |
| EDITOR | gerente@nexus.com.br (Ana Paula Ferreira) |
| VIEWER | analista@nexus.com.br (Ricardo Oliveira) |
| Projetos | 8 projetos com status variados e dados realistas |

---

## Paleta de Cores

| Variável | Cor | Uso |
|----------|-----|-----|
| `--bg` | `#07090f` | Fundo principal |
| `--surface` | `#0f1520` | Cards e painéis |
| `--synapse` | `#63b3ed` | Cor principal (azul neural) |
| `--pulse` | `#9f7aea` | Violeta (energia/IA) |
| `--healthy` | `#48bb78` | Verde (projeto saudável) |
| `--warn` | `#ed8936` | Laranja (atenção) |
| `--critical` | `#fc8181` | Vermelho suave (crítico) |

---

## Licença

MIT — Uso livre com atribuição.
