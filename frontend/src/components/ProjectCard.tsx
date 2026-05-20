import { Link } from 'react-router-dom';
import { Calendar, User, TrendingUp, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import { Project, STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '../types';

interface ProjectCardProps {
  project: Project;
  slug: string;
}

function HealthCircle({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? '#48bb78' : score >= 40 ? '#ed8936' : '#fc8181';
  const isCritical = score < 40;

  return (
    <div className={clsx('relative w-12 h-12 shrink-0', isCritical && 'animate-pulse')}>
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export default function ProjectCard({ project, slug }: ProjectCardProps) {
  const isOverdue = project.deadline && isPast(new Date(project.deadline)) && project.status !== 'COMPLETED';
  const statusColor = STATUS_COLORS[project.status];
  const priorityColor = PRIORITY_COLORS[project.priority];

  return (
    <Link
      to={`/w/${slug}/projects/${project.id}`}
      className="card block group hover:border-synapse/30 hover:shadow-synapse transition-all duration-300 animate-slide-up"
      style={{
        background: 'linear-gradient(135deg, rgba(15,21,32,1) 0%, rgba(15,21,32,0.95) 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted">{project.code}</span>
            <span
              className="badge text-xs"
              style={{
                backgroundColor: `${priorityColor}18`,
                color: priorityColor,
              }}
            >
              {PRIORITY_LABELS[project.priority]}
            </span>
          </div>
          <h3 className="font-semibold text-[--text] group-hover:text-synapse transition-colors line-clamp-2 leading-snug">
            {project.name}
          </h3>
        </div>
        <HealthCircle score={project.healthScore} />
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="badge"
          style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          {STATUS_LABELS[project.status]}
        </span>
        {isOverdue && (
          <span className="badge bg-critical/10 text-critical">
            <AlertCircle size={10} />
            Prazo vencido
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted flex items-center gap-1">
            <TrendingUp size={11} />
            Progresso
          </span>
          <span className="text-xs font-medium text-[--text]">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${project.progress}%`,
              background: project.progress === 100
                ? 'linear-gradient(90deg, #48bb78, #38a169)'
                : 'linear-gradient(90deg, #63b3ed, #9f7aea)',
            }}
          />
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center gap-4 text-xs text-muted">
        {project.responsible && (
          <span className="flex items-center gap-1.5 truncate">
            <User size={11} />
            <span className="truncate">{project.responsible}</span>
          </span>
        )}
        {project.deadline && (
          <span
            className={clsx(
              'flex items-center gap-1.5 ml-auto shrink-0',
              isOverdue && 'text-critical'
            )}
          >
            <Calendar size={11} />
            {format(new Date(project.deadline), 'dd MMM', { locale: ptBR })}
          </span>
        )}
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-synapse/8 text-synapse/80">
              #{tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-xs text-muted">+{project.tags.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  );
}
