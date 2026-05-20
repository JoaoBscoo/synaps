import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import ProjectForm from '../components/ProjectForm';
import { projectApi } from '../services/api';
import { useTenant } from '../hooks/useTenant';

export default function ProjectNew() {
  const { slug } = useTenant();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => projectApi.create(slug!, data),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ['projects', slug] });
      navigate(`/w/${slug}/projects/${project.id}`);
    },
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-muted hover:text-[--text] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-[--text]">Novo Projeto</h1>
            <p className="text-sm text-muted">Preencha as informações do projeto</p>
          </div>
        </div>

        {mutation.isError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-critical/10 border border-critical/20 text-critical text-sm">
            Erro ao criar projeto. Verifique os dados e tente novamente.
          </div>
        )}

        <div className="card">
          <ProjectForm
            onSubmit={async (data) => mutation.mutate(data)}
            isLoading={mutation.isPending}
            submitLabel="Criar Projeto"
          />
        </div>
      </div>
    </Layout>
  );
}
