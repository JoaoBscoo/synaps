import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Settings as SettingsIcon, Save } from 'lucide-react';
import Layout from '../components/Layout';
import MemberManager from '../components/MemberManager';
import InviteModal from '../components/InviteModal';
import { tenantApi } from '../services/api';
import { Tenant } from '../types';
import { useTenant } from '../hooks/useTenant';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const { slug } = useTenant();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['tenant', slug],
    queryFn: () => tenantApi.get(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (tenant && !tenantName) setTenantName(tenant.name);
  }, [tenant]);

  const updateTenant = useMutation({
    mutationFn: () => tenantApi.update(slug!, { name: tenantName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant', slug] });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    },
  });

  // Verificar se é OWNER
  const myTenantRole = user?.tenants?.find((tu) => tu.tenant?.slug === slug)?.role;
  const isOwner = myTenantRole === 'OWNER';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[--text]">Configurações</h1>
          <p className="text-sm text-muted">Gerencie o workspace e os membros da equipe</p>
        </div>

        {/* Workspace info */}
        {isOwner && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <SettingsIcon size={16} className="text-synapse" />
              <h2 className="font-semibold text-[--text]">Workspace</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Nome do Workspace</label>
                <input
                  className="input"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div>
                <label className="label">Slug (URL)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">synaps.app.br/w/</span>
                  <span className="text-sm font-mono text-synapse">{slug}</span>
                </div>
                <p className="text-xs text-muted mt-1">O slug não pode ser alterado após a criação</p>
              </div>

              <button
                onClick={() => updateTenant.mutate()}
                disabled={updateTenant.isPending || !tenantName.trim()}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={15} />
                {nameSaved ? 'Salvo!' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        )}

        {/* Members */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[--text]">Membros da Equipe</h2>
            {isOwner && (
              <button
                onClick={() => setShowInvite(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <UserPlus size={15} />
                Convidar
              </button>
            )}
          </div>

          <MemberManager slug={slug!} />
        </div>

        {/* Workspace info */}
        <div className="card bg-synapse/5 border-synapse/20">
          <h2 className="font-semibold text-[--text] mb-3">Sobre o Workspace</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Workspace ID</span>
              <span className="font-mono text-xs text-muted">{tenant?.id?.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Criado em</span>
              <span className="text-[--text]">
                {tenant?.createdAt
                  ? new Date(tenant.createdAt).toLocaleDateString('pt-BR')
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Seu papel</span>
              <span className="text-synapse font-medium">
                {myTenantRole === 'OWNER' ? 'Proprietário' :
                 myTenantRole === 'EDITOR' ? 'Editor' :
                 myTenantRole === 'VIEWER' ? 'Visualizador' : myTenantRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showInvite && (
        <InviteModal slug={slug!} onClose={() => setShowInvite(false)} />
      )}
    </Layout>
  );
}
