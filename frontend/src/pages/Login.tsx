import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SynapseBackground from '../components/SynapseBackground';
import { useAuth } from '../hooks/useAuth';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="0" y="0" width="8.5" height="8.5" fill="#F25022"/>
      <rect x="9.5" y="0" width="8.5" height="8.5" fill="#7FBA00"/>
      <rect x="0" y="9.5" width="8.5" height="8.5" fill="#00A4EF"/>
      <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900"/>
    </svg>
  );
}

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const firstTenant = user.tenants?.[0]?.tenant?.slug;
      if (firstTenant) navigate(`/w/${firstTenant}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <SynapseBackground intensity={0.8} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-synapse-gradient flex items-center justify-center mx-auto mb-4 shadow-synapse-lg">
            <span className="text-white font-bold text-xl font-display">S</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[--text]">Synaps</h1>
          <p className="text-sm text-muted mt-1">Gerenciamento de projetos inteligente</p>
        </div>

        {/* Card */}
        <div className="card border-synapse/20 shadow-synapse">
          <h2 className="text-lg font-semibold font-display text-[--text] mb-2 text-center">
            Entrar na plataforma
          </h2>
          <p className="text-xs text-muted text-center mb-6">
            Use sua conta corporativa para acessar
          </p>

          {error === 'auth_failed' && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-critical/10 border border-critical/20 text-critical text-sm text-center">
              Autenticação falhou. Tente novamente.
            </div>
          )}
          {error === 'no_token' && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-warn/10 border border-warn/20 text-warn text-sm text-center">
              Token não encontrado. Tente fazer login novamente.
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => login('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
                         bg-white text-gray-700 font-medium text-sm
                         hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]
                         border border-gray-200"
            >
              <GoogleIcon />
              Entrar com Google
            </button>

            <button
              onClick={() => login('microsoft')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
                         bg-[#0078d4] text-white font-medium text-sm
                         hover:bg-[#006cbe] transition-all duration-200 active:scale-[0.98]"
            >
              <MicrosoftIcon />
              Entrar com Microsoft
            </button>
          </div>

          <p className="text-xs text-muted text-center mt-6 leading-relaxed">
            Ao entrar, você concorda com os{' '}
            <span className="text-synapse cursor-pointer hover:underline">termos de uso</span>
            {' '}e{' '}
            <span className="text-synapse cursor-pointer hover:underline">política de privacidade</span>.
          </p>
        </div>

        <p className="text-center text-xs text-muted mt-4">
          © {new Date().getFullYear()} Synaps · synaps.app.br
        </p>
      </div>
    </div>
  );
}
