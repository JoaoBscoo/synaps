import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login?error=no_token');
      return;
    }

    localStorage.setItem('synaps_token', token);

    // Buscar dados do usuário para saber para qual workspace redirecionar
    authApi.me()
      .then((user) => {
        const firstSlug = user?.tenants?.[0]?.tenant?.slug;
        if (firstSlug) {
          navigate(`/w/${firstSlug}/dashboard`, { replace: true });
        } else {
          navigate('/login?error=no_workspace');
        }
      })
      .catch(() => {
        navigate('/login?error=auth_failed');
      });
  }, []);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-synapse border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Autenticando...</p>
      </div>
    </div>
  );
}
