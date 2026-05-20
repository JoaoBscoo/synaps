import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, ChevronDown } from 'lucide-react';
import { tenantApi } from '../services/api';
import { TenantUser, ROLE_LABELS, Role } from '../types';
import { useAuth } from '../hooks/useAuth';

interface MemberManagerProps {
  slug: string;
}

export default function MemberManager({ slug }: MemberManagerProps) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: members = [], isLoading } = useQuery<TenantUser[]>({
    queryKey: ['members', slug],
    queryFn: () => tenantApi.members(slug),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      tenantApi.updateMember(slug, id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', slug] }),
  });

  const removeMember = useMutation({
    mutationFn: (id: string) => tenantApi.removeMember(slug, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', slug] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((m) => {
        const isMe = m.userId === user?.id;
        const isOwner = m.role === 'OWNER';

        return (
          <div
            key={m.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border"
          >
            {m.user?.avatarUrl ? (
              <img
                src={m.user.avatarUrl}
                alt={m.user.name}
                className="w-9 h-9 rounded-full border border-border shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-pulse/20 flex items-center justify-center shrink-0">
                <span className="text-pulse text-sm font-bold">
                  {m.user?.name?.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[--text] truncate">
                {m.user?.name}
                {isMe && <span className="text-xs text-muted ml-1">(você)</span>}
              </p>
              <p className="text-xs text-muted truncate">{m.user?.email}</p>
            </div>

            {/* Role selector */}
            {!isOwner && !isMe ? (
              <select
                className="text-xs bg-bg border border-border rounded-lg px-2 py-1.5 text-[--text] focus:outline-none focus:border-synapse/50"
                value={m.role}
                onChange={(e) => updateRole.mutate({ id: m.id, role: e.target.value })}
                disabled={updateRole.isPending}
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Visualizador</option>
                <option value="CLIENT">Cliente</option>
              </select>
            ) : (
              <span className="text-xs px-2 py-1 rounded-lg bg-synapse/10 text-synapse">
                {ROLE_LABELS[m.role as Role]}
              </span>
            )}

            {/* Remove button */}
            {!isOwner && !isMe && (
              <button
                onClick={() => {
                  if (confirm(`Remover ${m.user?.name} do workspace?`)) {
                    removeMember.mutate(m.id);
                  }
                }}
                disabled={removeMember.isPending}
                className="text-muted hover:text-critical transition-colors shrink-0"
                title="Remover membro"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
