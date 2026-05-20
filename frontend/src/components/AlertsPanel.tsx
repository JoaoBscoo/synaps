import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, Activity } from 'lucide-react';
import clsx from 'clsx';
import { DashboardData, STATUS_LABELS, STATUS_COLORS } from '../types';

interface AlertsPanelProps {
  alerts: DashboardData['alerts'];
  slug: string;
}

export default function AlertsPanel({ alerts, slug }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-healthy" />
          <h3 className="text-sm font-semibold text-[--text]">Alertas</h3>
        </div>
        <div className="py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-healthy/10 flex items-center justify-center mx-auto mb-3">
            <Activity size={20} className="text-healthy" />
          </div>
          <p className="text-sm text-muted">Portfólio saudável — nenhum alerta</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-warn" />
        <h3 className="text-sm font-semibold text-[--text]">Alertas</h3>
        <span className="ml-auto badge bg-warn/10 text-warn">{alerts.length}</span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const statusColor = STATUS_COLORS[alert.status];
          const healthColor =
            alert.healthScore >= 70 ? '#48bb78' : alert.healthScore >= 40 ? '#ed8936' : '#fc8181';

          return (
            <Link
              key={alert.id}
              to={`/w/${slug}/projects/${alert.id}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border hover:border-critical/30 transition-colors group"
            >
              {/* Health indicator */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                style={{
                  backgroundColor: `${healthColor}18`,
                  color: healthColor,
                }}
              >
                {alert.healthScore}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[--text] truncate group-hover:text-synapse transition-colors">
                  {alert.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs"
                    style={{ color: statusColor }}
                  >
                    {STATUS_LABELS[alert.status]}
                  </span>
                  {alert.isOverdue && (
                    <span className="text-xs flex items-center gap-0.5 text-critical">
                      <Clock size={10} />
                      Prazo vencido
                    </span>
                  )}
                </div>
              </div>

              <span className="text-xs font-mono text-muted shrink-0">{alert.code}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
