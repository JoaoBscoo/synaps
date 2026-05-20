import { TrendingUp, AlertTriangle, Clock, CheckCircle2, Activity } from 'lucide-react';
import clsx from 'clsx';
import { DashboardData } from '../types';

interface KPIBarProps {
  data: DashboardData['kpis'];
}

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
  pulse?: boolean;
}

function KPICard({ label, value, icon, color, sub, pulse }: KPICardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className={clsx(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
          pulse && 'animate-pulse'
        )}
        style={{ backgroundColor: `${color}18` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold font-display text-[--text] leading-none mb-0.5">{value}</p>
        <p className="text-xs text-muted">{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function KPIBar({ data }: KPIBarProps) {
  const healthColor = data.avgHealth >= 70 ? '#48bb78' : data.avgHealth >= 40 ? '#ed8936' : '#fc8181';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        label="Total de Projetos"
        value={data.total}
        icon={<TrendingUp size={20} />}
        color="#63b3ed"
      />
      <KPICard
        label="Em Risco"
        value={data.atRisk}
        icon={<AlertTriangle size={20} />}
        color="#ed8936"
        pulse={data.atRisk > 0}
      />
      <KPICard
        label="Atrasados"
        value={data.delayed}
        icon={<Clock size={20} />}
        color="#fc8181"
        pulse={data.delayed > 0}
      />
      <KPICard
        label="Concluídos"
        value={data.completed}
        icon={<CheckCircle2 size={20} />}
        color="#48bb78"
      />
      <KPICard
        label="Health Médio"
        value={`${data.avgHealth}%`}
        icon={<Activity size={20} />}
        color={healthColor}
        sub={data.avgHealth >= 70 ? 'Portfólio saudável' : data.avgHealth >= 40 ? 'Atenção necessária' : 'Crítico'}
      />
    </div>
  );
}
