import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import ProjectForm from '../components/ProjectForm';
import { projectApi } from '../services/api';
import { Project } from '../types';
import { useTenant } from '../hooks/useTenant';

export default function ProjectEdit() {
  const { id } = useParams<{ id: string }>();
  const { slug } = useTenant();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project', slug, id],
    queryFn: () => projectApi.get(slug!, id!),
    enabled: !!slug && !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => projectApi.update(slug!, id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', slug, id] });
      qc.invalidateQueries({ queryKey: ['projects', slug] });
      navigate(`/w/${slug}/projects/${id}`);
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-surface rounded-lg animate-pulse" />
          <div className="h-96 bg-surface rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to={`/w/${slug}/projects/${id}`}
            className="text-muted hover:text-[--text] transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-[--text]">Editar Projeto</h1>
            <p className="text-sm text-muted font-mono">{project?.code}</p>
          </div>
        </div>

        {mutation.isError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-critical/10 border border-critical/20 text-critical text-sm">
            Erro ao salvar alterações. Tente novamente.
          </div>
        )}

        <div className="card">
          <ProjectForm
            defaultValues={project}
            onSubmit={async (data) => mutation.mutate(data)}
            isLoading={mutation.isPending}
            submitLabel="Salvar Alterações"
          />
        </div>
      </div>
    </Layout>
  );
}
