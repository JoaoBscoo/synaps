import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import Layout from '../components/Layout';
import ProjectCard from '../components/ProjectCard';
import { projectApi } from '../services/api';
import { Project, Status, Priority, STATUS_LABELS, PRIORITY_LABELS } from '../types';
import { useTenant } from '../hooks/useTenant';
import clsx from 'clsx';

export default function Projects() {
  const { slug } = useTenant();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects', slug],
    queryFn: () => projectApi.list(slug!),
    enabled: !!slug,
  });

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        p.responsible?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchPriority = !priorityFilter || p.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [projects, search, statusFilter, priorityFilter]);

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[--text]">Projetos</h1>
            <p className="text-sm text-muted">
              {filtered.length} de {projects.length} projetos
            </p>
          </div>
          <Link to={`/w/${slug}/projects/new`} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Novo Projeto
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              placeholder="Buscar projetos, clientes, responsáveis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select w-auto min-w-36"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | '')}
          >
            <option value="">Todos os status</option>
            {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          <select
            className="select w-auto min-w-36"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | '')}
          >
            <option value="">Todas as prioridades</option>
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>

          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={clsx('p-2.5 transition-colors', view === 'grid' ? 'bg-synapse/15 text-synapse' : 'text-muted hover:text-[--text]')}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={clsx('p-2.5 transition-colors', view === 'list' ? 'bg-synapse/15 text-synapse' : 'text-muted hover:text-[--text]')}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-surface rounded-xl animate-pulse" />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-synapse/10 flex items-center justify-center mx-auto mb-4">
              <Filter size={24} className="text-synapse" />
            </div>
            <p className="text-[--text] font-medium mb-1">
              {projects.length === 0 ? 'Nenhum projeto ainda' : 'Nenhum projeto encontrado'}
            </p>
            <p className="text-sm text-muted mb-4">
              {projects.length === 0
                ? 'Crie seu primeiro projeto para começar'
                : 'Tente ajustar os filtros de busca'}
            </p>
            {projects.length === 0 && (
              <Link to={`/w/${slug}/projects/new`} className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} />
                Criar primeiro projeto
              </Link>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} slug={slug!} />)}
          </div>
        )}

        {/* List */}
        {!isLoading && filtered.length > 0 && view === 'list' && (
          <div className="space-y-2">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to={`/w/${slug}/projects/${p.id}`}
                className="flex items-center gap-4 p-4 card hover:border-synapse/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ backgroundColor: '#63b3ed18', color: '#63b3ed' }}>
                  {p.healthScore}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted">{p.code}</span>
                    <span className="font-medium text-[--text] truncate">{p.name}</span>
                  </div>
                  {p.clientName && <p className="text-xs text-muted">{p.clientName}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 h-1.5 bg-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-synapse-gradient" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted w-8 text-right">{p.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
