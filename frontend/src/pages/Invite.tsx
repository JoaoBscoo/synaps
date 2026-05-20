import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { tenantApi } from '../services/api';
import { Invite, ROLE_LABELS } from '../types';
import { useAuth } from '../hooks/useAuth';
import SynapseBackground from '../components/SynapseBackground';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const { data: invite, isLoading, error } = useQuery<Invite>({
    queryKey: ['invite', token],
    queryFn: () => tenantApi.getInvite(token!),
    enabled: !!token,
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () => tenantApi.acceptInvite(token!),
    onSuccess: (data) => {
      navigate(`/w/${data.slug}/dashboard`);
    },
  });

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <SynapseBackground intensity={0.6} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-synapse-gradient flex items-center justify-center mx-auto mb-3 shadow-synapse">
            <span className="text-white font-bold text-lg font-display">S</span>
          </div>
          <h1 className="font-display font-bold text-xl text-[--text]">Synaps</h1>
        </div>

        <div className="card border-synapse/20">
          {isLoading && (
            <div className="text-center py-8">
              <Loader size={24} className="animate-spin mx-auto mb-3 text-synapse" />
              <p className="text-sm text-muted">Carregando convite...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertCircle size={32} className="mx-auto mb-3 text-critical" />
              <p className="font-medium text-[--text] mb-1">Convite inválido</p>
              <p className="text-sm text-muted">Este convite expirou ou já foi utilizado.</p>
            </div>
          )}

          {invite && (
            <>
              <div className="text-center mb-6">
                <CheckCircle size={28} className="mx-auto mb-3 text-synapse" />
                <h2 className="font-semibold text-[--text] mb-1">Você foi convidado!</h2>
                <p className="text-sm text-muted">
                  Para colaborar em{' '}
                  <strong className="text-[--text]">{invite.tenant.name}</strong>
                </p>
              </div>

              <div className="bg-bg rounded-lg p-4 mb-5 border border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Workspace</span>
                  <span className="text-[--text] font-medium">{invite.tenant.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Seu papel</span>
                  <span className="text-synapse font-medium">{ROLE_LABELS[invite.role]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Email</span>
                  <span className="text-[--text]">{invite.email}</span>
                </div>
              </div>

              {accept.isError && (
                <p className="text-sm text-critical text-center mb-3">
                  Erro ao aceitar convite. Tente novamente.
                </p>
              )}

              {isAuthenticated ? (
                <button
                  onClick={() => accept.mutate()}
                  disabled={accept.isPending}
                  className="btn-primary w-full"
                >
                  {accept.isPending ? 'Entrando...' : 'Aceitar e entrar no workspace'}
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted text-center">
                    Faça login para aceitar o convite
                  </p>
                  <button
                    onClick={() => login('google')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continuar com Google
                  </button>
                  <button
                    onClick={() => login('microsoft')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0078d4] text-white text-sm font-medium hover:bg-[#006cbe] transition-colors"
                  >
                    Continuar com Microsoft
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
