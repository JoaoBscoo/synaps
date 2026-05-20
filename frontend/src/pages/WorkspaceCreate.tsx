import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { tenantApi } from '../services/api';
import SynapseBackground from '../components/SynapseBackground';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export default function WorkspaceCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const slug = slugify(name);

  const mutation = useMutation({
    mutationFn: () => tenantApi.create({ name, slug }),
    onSuccess: (tenant) => {
      navigate(`/w/${tenant.slug}/dashboard`, { replace: true });
    },
  });

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <SynapseBackground intensity={0.7} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-synapse-gradient flex items-center justify-center mx-auto mb-4 shadow-synapse-lg">
            <span className="text-white font-bold text-xl font-display">S</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[--text]">Bem-vindo ao Synaps!</h1>
          <p className="text-sm text-muted mt-2">
            Crie seu workspace para começar a gerenciar projetos.
          </p>
        </div>

        <div className="card border-synapse/20 shadow-synapse">
          <h2 className="font-semibold text-[--text] mb-1">Criar workspace</h2>
          <p className="text-xs text-muted mb-5">
            Um workspace é o espaço da sua empresa ou consultoria dentro do Synaps.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) mutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="label">Nome do workspace</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Consultoria Nexus"
                autoFocus
                required
                minLength={2}
              />
            </div>

            {slug && (
              <div className="px-3 py-2 rounded-lg bg-bg border border-border text-xs">
                <span className="text-muted">URL: </span>
                <span className="text-synapse font-mono">
                  synaps.app.br/w/<strong>{slug}</strong>
                </span>
              </div>
            )}

            {mutation.isError && (
              <p className="text-sm text-critical">
                Erro ao criar workspace. O nome pode já estar em uso, tente outro.
              </p>
            )}

            <button
              type="submit"
              disabled={!name.trim() || mutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              {mutation.isPending ? 'Criando...' : 'Criar workspace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
