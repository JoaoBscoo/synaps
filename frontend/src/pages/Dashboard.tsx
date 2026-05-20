import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Radio } from 'lucide-react';
import Layout from '../components/Layout';
import KPIBar from '../components/KPIBar';
import StatusDonut from '../components/StatusDonut';
import DeadlineTimeline from '../components/DeadlineTimeline';
import AlertsPanel from '../components/AlertsPanel';
import { dashboardApi } from '../services/api';
import { DashboardData } from '../types';
import { useTenant } from '../hooks/useTenant';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const POLL_INTERVAL = 30 * 1000;

export default function Dashboard() {
  const { slug, tenant } = useTenant();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [pulsing, setPulsing] = useState(false);

  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard', slug],
    queryFn: () => dashboardApi.get(slug!),
    enabled: !!slug,
    refetchInterval: POLL_INTERVAL,
  });

  // Animar o indicador ao atualizar
  useEffect(() => {
    if (data) {
      setLastUpdate(new Date());
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 1200);
      return () => clearTimeout(t);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-surface rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-surface rounded-xl animate-pulse" />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[--text]">
              {tenant?.name || 'Dashboard'}
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Visão geral do portfólio de projetos
            </p>
          </div>

          {/* Live indicator */}
          <button
            onClick={() => refetch()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 text-xs font-medium ${
              pulsing
                ? 'border-synapse/50 bg-synapse/10 text-synapse'
                : 'border-border bg-surface text-muted hover:border-synapse/30'
            }`}
          >
            <Radio size={12} className={pulsing ? 'animate-pulse' : ''} />
            <span>Ao vivo</span>
            <span className="text-muted font-normal">
              · {format(lastUpdate, 'HH:mm:ss', { locale: ptBR })}
            </span>
          </button>
        </div>

        {/* KPI Bar */}
        {data && <KPIBar data={data.kpis} />}

        {/* Main grid */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatusDonut byStatus={data.byStatus} />
            <DeadlineTimeline items={data.upcomingDeadlines} slug={slug!} />
            <AlertsPanel alerts={data.alerts} slug={slug!} />
          </div>
        )}

        {/* Tasks summary */}
        {data && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[--text]">Tarefas do Portfólio</h3>
              <span className="text-xs text-muted">
                {data.tasks.done} de {data.tasks.total} concluídas
              </span>
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: data.tasks.total > 0
                    ? `${Math.round((data.tasks.done / data.tasks.total) * 100)}%`
                    : '0%',
                  background: 'linear-gradient(90deg, #63b3ed, #9f7aea)',
                }}
              />
            </div>
            <p className="text-xs text-muted mt-2">
              {data.tasks.total > 0
                ? `${Math.round((data.tasks.done / data.tasks.total) * 100)}% do total de tarefas concluídas`
                : 'Nenhuma tarefa cadastrada'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
