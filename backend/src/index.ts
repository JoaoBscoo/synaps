import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';

import './lib/passport'; // registrar estratégias

import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenants';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import dashboardRoutes from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

// Segurança
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting global
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  })
);

// Rate limiting específico para rotas de auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de autenticação. Aguarde 15 minutos.' },
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Sessão para Passport (OAuth redirect flow)
app.use(
  session({
    secret: process.env.JWT_SECRET || 'synaps-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 min — só para o OAuth flow
    },
  })
);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'synaps-backend', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/auth', authLimiter, authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/tenants/:slug/projects', projectRoutes);
app.use('/api/tenants/:slug/dashboard', dashboardRoutes);
app.use('/api/projects', taskRoutes); // POST /api/projects/:id/tasks
app.use('/api/tasks', taskRoutes);    // PATCH/DELETE /api/tasks/:id

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🧠 Synaps backend rodando na porta ${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
