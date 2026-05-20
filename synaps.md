# Prompt para Claude Code — Synaps.app.br

Cole esse prompt no Claude Code após rodar `claude` na pasta do projeto.

---

## PROMPT

Crie o MVP de um SaaS chamado **Synaps** — plataforma de gerenciamento de projetos multi-tenant, hospedada em synaps.app.br. A identidade visual remete a sinapses cerebrais: nós conectados, fluxo de energia, inteligência. É um concorrente direto de Trello e Miro, focado em consultores que gerenciam projetos com clientes externos.

---

### STACK

**Backend:** Node.js + Express + Prisma ORM + PostgreSQL  
**Frontend:** React + Vite + TailwindCSS  
**Auth:** Auth.js (Microsoft Azure AD OAuth + Google OAuth)  
**Hospedagem:** Railway (backend) + Vercel (frontend) + Neon (banco)  
**Estrutura:** Monorepo com `/backend` e `/frontend`

---

### MODELO DE DADOS (Prisma Schema)

```prisma
// Tenant = empresa/cliente cadastrado na plataforma
model Tenant {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique   // ex: "empresa-abc" → synaps.app.br/w/empresa-abc
  logoUrl     String?
  createdAt   DateTime  @default(now())
  users       TenantUser[]
  projects    Project[]
  invites     Invite[]
}

// Usuário global (autenticado via OAuth)
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  avatarUrl String?
  provider  String    // "google" | "microsoft"
  createdAt DateTime  @default(now())
  tenants   TenantUser[]
}

// Papel do usuário dentro de um tenant
model TenantUser {
  id       String   @id @default(cuid())
  role     Role     @default(VIEWER)
  userId   String
  tenantId String
  user     User     @relation(fields: [userId], references: [id])
  tenant   Tenant   @relation(fields: [tenantId], references: [id])
  @@unique([userId, tenantId])
}

enum Role {
  OWNER       // criador do workspace, acesso total
  EDITOR      // pode criar/editar projetos
  VIEWER      // só visualiza dashboard
  CLIENT      // cliente externo, vê apenas seus projetos
}

model Project {
  id            String    @id @default(cuid())
  tenantId      String
  name          String
  code          String    // ex: PRJ-001
  description   String?
  status        Status    @default(ON_TRACK)
  progress      Int       @default(0)   // 0-100
  healthScore   Int       @default(100) // 0-100, calculado pela IA futuramente
  deadline      DateTime?
  budgetTotal   Float?
  budgetUsed    Float?
  responsible   String?
  category      String?
  clientName    String?
  clientEmail   String?
  tags          String[]
  priority      Priority  @default(MEDIUM)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  tenant        Tenant    @relation(fields: [tenantId], references: [id])
  tasks         Task[]
  logs          AuditLog[]
}

enum Status {
  ON_TRACK    // Em dia
  AT_RISK     // Em risco
  DELAYED     // Atrasado
  COMPLETED   // Concluído
  PAUSED      // Pausado
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model Task {
  id          String   @id @default(cuid())
  projectId   String
  title       String
  done        Boolean  @default(false)
  dueDate     DateTime?
  assignee    String?
  project     Project  @relation(fields: [projectId], references: [id])
}

model AuditLog {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  action    String   // "updated_progress", "changed_status", etc.
  oldValue  String?
  newValue  String?
  createdAt DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id])
}

model Invite {
  id        String   @id @default(cuid())
  tenantId  String
  email     String
  role      Role
  token     String   @unique @default(cuid())
  expiresAt DateTime
  usedAt    DateTime?
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
}
```

---

### BACKEND — Rotas da API

```
AUTH
POST   /auth/callback/google       → OAuth callback Google
POST   /auth/callback/microsoft    → OAuth callback Microsoft
GET    /auth/me                    → retorna usuário logado + tenants
POST   /auth/logout

TENANTS (workspaces)
POST   /api/tenants                → cria novo workspace (vira OWNER)
GET    /api/tenants/:slug          → dados do workspace
PATCH  /api/tenants/:slug          → atualiza nome/logo (OWNER)

USUÁRIOS DO WORKSPACE
GET    /api/tenants/:slug/members        → lista membros
POST   /api/tenants/:slug/invite         → envia convite por email
DELETE /api/tenants/:slug/members/:id    → remove membro
PATCH  /api/tenants/:slug/members/:id    → muda role

PROJETOS
GET    /api/tenants/:slug/projects              → lista projetos (com filtros)
POST   /api/tenants/:slug/projects              → cria projeto (EDITOR+)
GET    /api/tenants/:slug/projects/:id          → detalhe do projeto
PATCH  /api/tenants/:slug/projects/:id          → edita projeto (EDITOR+)
DELETE /api/tenants/:slug/projects/:id          → deleta projeto (OWNER)
GET    /api/tenants/:slug/projects/:id/logs     → histórico de alterações

TASKS
POST   /api/projects/:id/tasks          → cria tarefa
PATCH  /api/tasks/:id                   → edita/conclui tarefa
DELETE /api/tasks/:id                   → remove tarefa

DASHBOARD
GET    /api/tenants/:slug/dashboard     → KPIs agregados (contagens, médias, alertas)
```

Todos os endpoints protegidos por middleware JWT. Middleware de tenant verifica se o usuário pertence ao workspace antes de qualquer operação.

---

### FRONTEND — Páginas e Componentes

**Páginas públicas:**
- `/` — Landing page do Synaps (identidade visual de sinapses/cérebro)
- `/login` — Botões "Entrar com Google" e "Entrar com Microsoft"
- `/invite/:token` — Aceitar convite para workspace

**App autenticado (`/w/:slug/`):**
- `/w/:slug/dashboard` — Dashboard com KPIs, gráfico de status, timeline de prazos, alertas
- `/w/:slug/projects` — Lista de projetos com filtros e busca
- `/w/:slug/projects/new` — Formulário de criação
- `/w/:slug/projects/:id` — Detalhe do projeto + tasks + audit log
- `/w/:slug/projects/:id/edit` — Formulário de edição
- `/w/:slug/settings` — Gerenciar membros, roles, convites (OWNER)

**Componentes principais:**
- `<ProjectCard />` — Card com status colorido, progress bar, health score
- `<KPIBar />` — Linha de 4-5 métricas no topo do dashboard
- `<StatusDonut />` — Gráfico donut de distribuição de status
- `<DeadlineTimeline />` — Próximos prazos ordenados por urgência
- `<AlertsPanel />` — Projetos que precisam de atenção
- `<ProjectForm />` — Formulário completo de projeto com validação
- `<MemberManager />` — Gerenciar equipe do workspace
- `<InviteModal />` — Enviar convite por email

---

### IDENTIDADE VISUAL — Synaps

```
Conceito: sinapses cerebrais — conexões, fluxo, inteligência

Paleta:
  --bg:        #07090f        (quase preto, profundidade)
  --surface:   #0f1520        (cards e painéis)
  --border:    rgba(99,179,237,0.12)
  --synapse:   #63b3ed        (azul neural — cor principal)
  --pulse:     #9f7aea        (violeta — energia/IA)
  --healthy:   #48bb78        (verde — saúde do projeto)
  --warn:      #ed8936        (laranja — atenção)
  --critical:  #fc8181        (vermelho suave — crítico)
  --text:      #e2e8f0
  --muted:     #4a5568

Tipografia:
  Display: 'Clash Display' ou 'Space Grotesk' — para títulos
  Body:    'Inter' — para texto corrido
  Mono:    'JetBrains Mono' — para códigos e IDs

Elementos visuais:
  - Background com SVG animado de nós e conexões (sinapses sutis)
  - Cards com borda gradiente azul-violeta no hover
  - Health score circular com animação de "pulso" quando crítico
  - Loading states com animação de "propagação sináptica"
  - Logo: dois nós conectados formando um "S" estilizado
```

---

### VARIÁVEIS DE AMBIENTE

**backend/.env.example**
```
DATABASE_URL=postgresql://...
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=common
FRONTEND_URL=https://synaps.app.br
SENDGRID_API_KEY=           # para envio de convites por email
PORT=3001
```

**frontend/.env.example**
```
VITE_API_URL=https://api.synaps.app.br
VITE_APP_NAME=Synaps
```

---

### REQUISITOS DE QUALIDADE

1. **Segurança:** JWT com refresh token, rate limiting nas rotas de auth, validação com Zod em todos os inputs, sanitização de slugs
2. **Multi-tenant isolation:** Todo query no banco DEVE incluir `tenantId` — nunca vazar dados entre workspaces
3. **Seed:** Script `prisma/seed.ts` com 1 tenant de exemplo, 3 usuários (OWNER, EDITOR, VIEWER), 8 projetos com dados realistas em português
4. **README.md** completo com: pré-requisitos, setup local, configuração OAuth (Google + Microsoft), deploy no Railway e Vercel, variáveis de ambiente explicadas
5. **Responsivo:** Dashboard funcional em mobile (≥375px)
6. **Polling:** Dashboard faz GET no `/dashboard` a cada 30s com indicador visual de "ao vivo"

---

### ESTRUTURA DE PASTAS ESPERADA

```
synaps/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/   (chamadas à API)
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
└── README.md
```

---

### COMEÇANDO

Após gerar o código, o fluxo de deploy é:

1. Push para GitHub
2. Criar banco no neon.tech → copiar DATABASE_URL
3. Deploy do backend no railway.app → setar variáveis de ambiente
4. Deploy do frontend no vercel.com → apontar para VITE_API_URL
5. Configurar domínio synaps.app.br no Vercel
6. Criar apps OAuth no Google Cloud Console e Azure AD → copiar CLIENT_ID e CLIENT_SECRET

---

*Gere o projeto completo, funcional, com todos os arquivos. Comece pelo backend (schema + rotas), depois o frontend.*
