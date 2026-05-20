import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '../services/api';

interface InviteModalProps {
  slug: string;
  onClose: () => void;
}

export default function InviteModal({ slug, onClose }: InviteModalProps) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => tenantApi.invite(slug, { email, role }),
    onSuccess: () => {
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ['members', slug] });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md card animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold font-display text-[--text]">Convidar Membro</h2>
          <button onClick={onClose} className="text-muted hover:text-[--text] transition-colors">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-healthy/10 flex items-center justify-center mx-auto mb-3">
              <Send size={20} className="text-healthy" />
            </div>
            <p className="text-[--text] font-medium">Convite enviado!</p>
            <p className="text-sm text-muted mt-1">Um email foi enviado para <strong>{email}</strong></p>
            <button onClick={onClose} className="btn-primary mt-4 px-8">Fechar</button>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            className="space-y-4"
          >
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@empresa.com"
                required
              />
            </div>

            <div>
              <label className="label">Papel</label>
              <select
                className="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="EDITOR">Editor — pode criar e editar projetos</option>
                <option value="VIEWER">Visualizador — só leitura</option>
                <option value="CLIENT">Cliente — acesso a seus projetos</option>
              </select>
            </div>

            {mutation.isError && (
              <p className="text-sm text-critical">
                Erro ao enviar convite. Tente novamente.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Send size={15} />
                {mutation.isPending ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
