import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Edit2, Trash2, Plus, Check, Clock, User,
  Calendar, Tag, DollarSign, Activity, History
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Layout from '../components/Layout';
import { projectApi, taskApi } from '../services/api';
import { Project, Task, AuditLog, STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, ACTION_LABELS } from '../types';
import { useTenant } from '../hooks/useTenant';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

function HealthRing({ score }: { score: number }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? '#48bb78' : score >= 40 ? '#ed8936' : '#fc8181';
  return (
    <div className={clsx('relative w-24 h-24', score < 40 && 'animate-pulse')}>
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted">health</span>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { slug } = useTenant();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'tasks' | 'logs'>('tasks');

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project', slug, id],
    queryFn: () => projectApi.get(slug!, id!),
    enabled: !!slug && !!id,
  });

  const { data: logs = [] } = useQuery<AuditLog[]>({
    queryKey: ['project-logs', slug, id],
    queryFn: () => projectApi.logs(slug!, id!),
    enabled: activeTab === 'logs' && !!slug && !!id,
  });

  const deleteProject = useMutation({
    mutationFn: () => projectApi.delete(slug!, id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', slug] });
      navigate(`/w/${slug}/projects`);
    },
  });

  const createTask = useMutation({
    mutationFn: () => taskApi.create(id!, { title: newTaskTitle }),
    onSuccess: () => {
      setNewTaskTitle('');
      qc.invalidateQueries({ queryKey: ['project', slug, id] });
    },
  });

  const toggleTask = useMutation({
    mutationFn: (task: Task) => taskApi.update(task.id, { done: !task.done }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', slug, id] }),
  });

  const deleteTask = useMutation({
    mutationFn: (taskId: string) => taskApi.delete(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', slug, id] }),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-8 w-64 bg-surface rounded-lg animate-pulse" />
          <div className="h-48 bg-surface rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!project) return null;

  const statusColor = STATUS_COLORS[project.status];
  const priorityColor = PRIORITY_COLORS[project.priority];
  const tasks = project.tasks || [];
  const doneTasks = tasks.filter(t => t.done).length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link to={`/w/${slug}/projects`} className="text-muted hover:text-[--text] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-muted text-sm">Projetos</span>
          <span className="text-muted text-sm">/</span>
          <span className="text-sm text-[--text] truncate">{project.name}</span>
        </div>

        {/* Header card */}
        <div className="card">
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm font-mono text-muted">{project.code}</span>
                <span className="badge" style={{ backgroundColor: `${statusColor}18`, color: statusColor }}>
                  {STATUS_LABELS[project.status]}
                </span>
                <span className="badge" style={{ backgroundColor: `${priorityColor}18`, color: priorityColor }}>
                  {PRIORITY_LABELS[project.priority]}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-[--text] mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted leading-relaxed">{project.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <HealthRing score={project.healthScore} />
              <div className="flex gap-2">
                <Link to={`/w/${slug}/projects/${id}/edit`} className="btn-ghost flex items-center gap-1.5 text-sm">
                  <Edit2 size={14} />
                  Editar
                </Link>
                <button
                  onClick={() => {
                    if (confirm(`Deletar "${project.name}"? Esta ação não pode ser desfeita.`)) {
                      deleteProject.mutate();
                    }
                  }}
                  className="btn-ghost text-critical border-critical/20 hover:bg-critical/10 flex items-center gap-1.5 text-sm"
                >
                  <Trash2 size={14} />
                  Deletar
                </button>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Progresso geral</span>
              <span className="font-medium text-[--text]">{project.progress}%</span>
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${project.progress}%`,
                  background: 'linear-gradient(90deg, #63b3ed, #9f7aea)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {project.responsible && (
            <div className="card py-3">
              <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
                <User size={11} /> Responsável
              </div>
              <p className="text-sm font-medium text-[--text]">{project.responsible}</p>
            </div>
          )}
          {project.deadline && (
            <div className="card py-3">
              <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
                <Calendar size={11} /> Prazo
              </div>
              <p className="text-sm font-medium text-[--text]">
                {format(new Date(project.deadline), "dd 'de' MMM yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
          {project.budgetTotal && (
            <div className="card py-3">
              <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
                <DollarSign size={11} /> Orçamento
              </div>
              <p className="text-sm font-medium text-[--text]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budgetTotal)}
              </p>
              {project.budgetUsed && (
                <p className="text-xs text-muted">
                  Utilizado: {Math.round((project.budgetUsed / project.budgetTotal) * 100)}%
                </p>
              )}
            </div>
          )}
          {project.clientName && (
            <div className="card py-3">
              <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
                <Tag size={11} /> Cliente
              </div>
              <p className="text-sm font-medium text-[--text]">{project.clientName}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex gap-4 mb-5 border-b border-border -mt-1 pb-0">
            {(['tasks', 'logs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'pb-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab
                    ? 'border-synapse text-synapse'
                    : 'border-transparent text-muted hover:text-[--text]'
                )}
              >
                {tab === 'tasks' ? (
                  <span className="flex items-center gap-1.5">
                    <Check size={13} />
                    Tarefas {tasks.length > 0 && `(${doneTasks}/${tasks.length})`}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <History size={13} />
                    Histórico
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {/* Add task */}
              <form
                onSubmit={(e) => { e.preventDefault(); if (newTaskTitle.trim()) createTask.mutate(); }}
                className="flex gap-2"
              >
                <input
                  className="input flex-1"
                  placeholder="Adicionar tarefa..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim() || createTask.isPending}
                  className="btn-primary px-3"
                >
                  <Plus size={16} />
                </button>
              </form>

              {tasks.length === 0 && (
                <p className="text-center text-sm text-muted py-6">Nenhuma tarefa ainda</p>
              )}

              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    task.done ? 'border-healthy/20 bg-healthy/5' : 'border-border bg-bg'
                  )}
                >
                  <button
                    onClick={() => toggleTask.mutate(task)}
                    className={clsx(
                      'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                      task.done
                        ? 'border-healthy bg-healthy text-white'
                        : 'border-muted hover:border-synapse'
                    )}
                  >
                    {task.done && <Check size={11} />}
                  </button>
                  <span
                    className={clsx(
                      'flex-1 text-sm',
                      task.done ? 'line-through text-muted' : 'text-[--text]'
                    )}
                  >
                    {task.title}
                  </span>
                  {task.assignee && (
                    <span className="text-xs text-muted flex items-center gap-1">
                      <User size={10} />
                      {task.assignee}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock size={10} />
                      {format(new Date(task.dueDate), 'dd/MM')}
                    </span>
                  )}
                  <button
                    onClick={() => deleteTask.mutate(task.id)}
                    className="text-muted hover:text-critical transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Audit Log */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              {logs.length === 0 && (
                <p className="text-center text-sm text-muted py-6">Nenhuma alteração registrada</p>
              )}
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-synapse/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity size={12} className="text-synapse" />
                  </div>
                  <div>
                    <p className="text-sm text-[--text]">
                      <span className="font-medium">{log.user?.name || 'Usuário'}</span>
                      {' '}
                      <span className="text-muted">{ACTION_LABELS[log.action] || log.action}</span>
                    </p>
                    {log.oldValue && log.newValue && (
                      <p className="text-xs text-muted mt-0.5">
                        <span className="line-through">{log.oldValue}</span>
                        {' → '}
                        <span className="text-synapse">{log.newValue}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted mt-0.5">
                      {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
