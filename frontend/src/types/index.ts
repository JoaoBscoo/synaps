export type Role = 'OWNER' | 'EDITOR' | 'VIEWER' | 'CLIENT';
export type Status = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED' | 'PAUSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  provider: string;
  createdAt: string;
  tenants: TenantUser[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  role?: Role;
}

export interface TenantUser {
  id: string;
  role: Role;
  userId: string;
  tenantId: string;
  user?: User;
  tenant?: Tenant;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string | null;
  status: Status;
  progress: number;
  healthScore: number;
  deadline: string | null;
  budgetTotal: number | null;
  budgetUsed: number | null;
  responsible: string | null;
  category: string | null;
  clientName: string | null;
  clientEmail: string | null;
  tags: string[];
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  done: boolean;
  dueDate: string | null;
  assignee: string | null;
}

export interface AuditLog {
  id: string;
  projectId: string;
  userId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user?: { id: string; name: string; avatarUrl: string | null };
}

export interface DashboardData {
  kpis: {
    total: number;
    atRisk: number;
    delayed: number;
    completed: number;
    avgHealth: number;
    totalBudget: number;
    usedBudget: number;
    budgetUtilization: number;
  };
  byStatus: Record<Status, number>;
  upcomingDeadlines: Array<{
    id: string;
    name: string;
    code: string;
    deadline: string;
    status: Status;
    progress: number;
    priority: Priority;
    daysLeft: number;
  }>;
  alerts: Array<{
    id: string;
    name: string;
    code: string;
    status: Status;
    healthScore: number;
    priority: Priority;
    deadline: string | null;
    isOverdue: boolean;
  }>;
  tasks: { total: number; done: number };
  updatedAt: string;
}

export interface Invite {
  id: string;
  email: string;
  role: Role;
  tenant: { name: string; slug: string; logoUrl: string | null };
  expiresAt: string;
}

export const STATUS_LABELS: Record<Status, string> = {
  ON_TRACK: 'Em Dia',
  AT_RISK: 'Em Risco',
  DELAYED: 'Atrasado',
  COMPLETED: 'Concluído',
  PAUSED: 'Pausado',
};

export const STATUS_COLORS: Record<Status, string> = {
  ON_TRACK: '#48bb78',
  AT_RISK: '#ed8936',
  DELAYED: '#fc8181',
  COMPLETED: '#63b3ed',
  PAUSED: '#4a5568',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: '#48bb78',
  MEDIUM: '#63b3ed',
  HIGH: '#ed8936',
  CRITICAL: '#fc8181',
};

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Proprietário',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
  CLIENT: 'Cliente',
};

export const ACTION_LABELS: Record<string, string> = {
  updated_progress: 'Progresso atualizado',
  changed_status: 'Status alterado',
  created: 'Projeto criado',
  updated_budget: 'Orçamento atualizado',
  updated_deadline: 'Prazo alterado',
};
