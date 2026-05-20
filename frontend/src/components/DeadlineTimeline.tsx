import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import { DashboardData, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS } from '../types';

interface DeadlineTimelineProps {
  items: DashboardData['upcomingDeadlines'];
  slug: string;
}

function UrgencyBar({ daysLeft, progress }: { daysLeft: number; progress: number }) {
  const urgency = daysLeft <= 7 ? '#fc8181' : daysLeft <= 14 ? '#ed8936' : '#63b3ed';
  return (
    <div className="h-1 bg-bg rounded-full overflow-hidden mt-2">
      <div
        className="h-full rounded-full"
        style={{ width: `${progress}%`, backgroundColor: urgency }}
      />
    </div>
  );
}

export default function DeadlineTimeline({ items, slug }: DeadlineTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-[--text] mb-3">Próximos Prazos</h3>
        <div className="py-8 text-center text-muted text-sm">
          Nenhum prazo nos próximos 30 dias
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-[--text] mb-4">Próximos Prazos</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const statusColor = STATUS_COLORS[item.status];
          const priorityColor = PRIORITY_COLORS[item.priority];
          const isUrgent = item.daysLeft <= 7;

          return (
            <Link
              key={item.id}
              to={`/w/${slug}/projects/${item.id}`}
              className="block p-3 rounded-lg bg-bg border border-border hover:border-synapse/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-muted">{item.code}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[--text] truncate">{item.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={clsx(
                      'text-xs font-semibold',
                      isUrgent ? 'text-critical' : 'text-warn'
                    )}
                  >
                    {item.daysLeft === 0
                      ? 'Hoje!'
                      : item.daysLeft === 1
                      ? 'Amanhã'
                      : `${item.daysLeft}d`}
                  </p>
                  <p className="text-xs text-muted">
                    {format(new Date(item.deadline), 'dd/MM', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <UrgencyBar daysLeft={item.daysLeft} progress={item.progress} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
