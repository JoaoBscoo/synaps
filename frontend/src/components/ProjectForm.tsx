import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Project, Status, Priority } from '../types';

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(120),
  description: z.string().max(1000).optional(),
  status: z.enum(['ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED', 'PAUSED']),
  progress: z.number().int().min(0).max(100),
  healthScore: z.number().int().min(0).max(100),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  deadline: z.string().optional(),
  budgetTotal: z.string().optional(),
  budgetUsed: z.string().optional(),
  responsible: z.string().max(100).optional(),
  category: z.string().max(60).optional(),
  clientName: z.string().max(120).optional(),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProjectFormProps {
  defaultValues?: Partial<Project>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function ProjectForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar' }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      status: (defaultValues?.status as Status) || 'ON_TRACK',
      progress: defaultValues?.progress ?? 0,
      healthScore: defaultValues?.healthScore ?? 100,
      priority: (defaultValues?.priority as Priority) || 'MEDIUM',
      deadline: defaultValues?.deadline
        ? new Date(defaultValues.deadline).toISOString().split('T')[0]
        : '',
      budgetTotal: defaultValues?.budgetTotal?.toString() || '',
      budgetUsed: defaultValues?.budgetUsed?.toString() || '',
      responsible: defaultValues?.responsible || '',
      category: defaultValues?.category || '',
      clientName: defaultValues?.clientName || '',
      clientEmail: defaultValues?.clientEmail || '',
      tags: defaultValues?.tags?.join(', ') || '',
    },
  });

  async function handleFormSubmit(values: FormValues) {
    const payload: Record<string, unknown> = {
      ...values,
      deadline: values.deadline || null,
      budgetTotal: values.budgetTotal ? parseFloat(values.budgetTotal) : null,
      budgetUsed: values.budgetUsed ? parseFloat(values.budgetUsed) : null,
      clientEmail: values.clientEmail || null,
      tags: values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };
    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Nome */}
      <div>
        <label className="label">Nome do Projeto *</label>
        <input className="input" {...register('name')} placeholder="Ex: Migração para Cloud AWS" />
        {errors.name && <p className="text-xs text-critical mt-1">{errors.name.message}</p>}
      </div>

      {/* Descrição */}
      <div>
        <label className="label">Descrição</label>
        <textarea
          className="input min-h-[80px] resize-y"
          {...register('description')}
          placeholder="Descreva o objetivo e escopo do projeto..."
        />
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="select" {...register('status')}>
            <option value="ON_TRACK">Em Dia</option>
            <option value="AT_RISK">Em Risco</option>
            <option value="DELAYED">Atrasado</option>
            <option value="COMPLETED">Concluído</option>
            <option value="PAUSED">Pausado</option>
          </select>
        </div>
        <div>
          <label className="label">Prioridade</label>
          <select className="select" {...register('priority')}>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </div>
      </div>

      {/* Progress + Health */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Progresso (%)</label>
          <input
            type="number"
            className="input"
            {...register('progress', { valueAsNumber: true })}
            min={0}
            max={100}
          />
          {errors.progress && <p className="text-xs text-critical mt-1">{errors.progress.message}</p>}
        </div>
        <div>
          <label className="label">Health Score</label>
          <input
            type="number"
            className="input"
            {...register('healthScore', { valueAsNumber: true })}
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Deadline + Responsible */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Prazo</label>
          <input type="date" className="input" {...register('deadline')} />
        </div>
        <div>
          <label className="label">Responsável</label>
          <input className="input" {...register('responsible')} placeholder="Nome do responsável" />
        </div>
      </div>

      {/* Budget */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Orçamento Total (R$)</label>
          <input
            type="number"
            className="input"
            {...register('budgetTotal')}
            placeholder="0,00"
            step="0.01"
          />
        </div>
        <div>
          <label className="label">Orçamento Utilizado (R$)</label>
          <input
            type="number"
            className="input"
            {...register('budgetUsed')}
            placeholder="0,00"
            step="0.01"
          />
        </div>
      </div>

      {/* Category + Client */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Categoria</label>
          <input className="input" {...register('category')} placeholder="Ex: Infraestrutura, ERP" />
        </div>
        <div>
          <label className="label">Nome do Cliente</label>
          <input className="input" {...register('clientName')} placeholder="Empresa cliente" />
        </div>
      </div>

      {/* Client email */}
      <div>
        <label className="label">Email do Cliente</label>
        <input
          type="email"
          className="input"
          {...register('clientEmail')}
          placeholder="contato@cliente.com"
        />
        {errors.clientEmail && (
          <p className="text-xs text-critical mt-1">{errors.clientEmail.message}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags (separadas por vírgula)</label>
        <input
          className="input"
          {...register('tags')}
          placeholder="aws, devops, cloud"
        />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
