import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Shield, Users, Zap, CheckCircle } from 'lucide-react';
import SynapseBackground from '../components/SynapseBackground';

const features = [
  {
    icon: <BarChart3 size={20} />,
    title: 'Dashboard em Tempo Real',
    desc: 'KPIs, gráficos de status e alertas automáticos. Saiba o que precisa de atenção antes de seus clientes.',
  },
  {
    icon: <Users size={20} />,
    title: 'Multi-tenant & Papéis',
    desc: 'Proprietário, Editor, Visualizador, Cliente. Cada um vê exatamente o que deve ver.',
  },
  {
    icon: <Shield size={20} />,
    title: 'Isolamento Total',
    desc: 'Cada workspace é independente. Dados de um cliente jamais vazam para outro.',
  },
  {
    icon: <Zap size={20} />,
    title: 'Health Score Inteligente',
    desc: 'Score visual de saúde do projeto com indicador de pulso quando crítico.',
  },
];

const stats = [
  { value: '100%', label: 'Isolamento multi-tenant' },
  { value: '< 30s', label: 'Atualização do dashboard' },
  { value: '4', label: 'Níveis de acesso' },
  { value: '∞', label: 'Projetos por workspace' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-[--text] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-synapse-gradient flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">S</span>
          </div>
          <span className="font-display font-semibold text-lg">Synaps</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted hover:text-[--text] transition-colors">
            Entrar
          </Link>
          <Link to="/login" className="btn-primary text-sm px-4 py-2">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0">
          <SynapseBackground intensity={1.2} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-synapse/30 bg-synapse/8 text-synapse text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-synapse animate-pulse" />
            MVP — Synaps v1.0 disponível
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Gerencie projetos
            <br />
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #63b3ed, #9f7aea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              com inteligência sináptica
            </span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma de gerenciamento de projetos para consultores que atendem múltiplos clientes.
            Dashboard em tempo real, health score automático e isolamento total entre workspaces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2"
            >
              Criar workspace grátis
              <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="btn-ghost text-base px-8 py-3.5"
            >
              Ver funcionalidades
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-synapse mb-1">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-[--text] mb-4">
              Tudo que um consultor precisa
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Desenvolvido especificamente para quem gerencia projetos com clientes externos e múltiplos stakeholders.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="card hover:border-synapse/30 hover:shadow-synapse transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-synapse/10 flex items-center justify-center text-synapse mb-4 group-hover:bg-synapse/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-[--text] mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual mockup section */}
      <section className="py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <SynapseBackground intensity={0.5} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="card p-8 border-synapse/20 shadow-synapse-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-critical" />
              <div className="w-3 h-3 rounded-full bg-warn" />
              <div className="w-3 h-3 rounded-full bg-healthy" />
              <span className="text-xs text-muted ml-2 font-mono">synaps.app.br/w/consultoria-nexus/dashboard</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total', value: '8', color: '#63b3ed' },
                { label: 'Em Risco', value: '2', color: '#ed8936' },
                { label: 'Atrasados', value: '1', color: '#fc8181' },
                { label: 'Health Médio', value: '79%', color: '#48bb78' },
              ].map((k) => (
                <div key={k.label} className="bg-bg rounded-lg p-3 border border-border">
                  <p className="text-lg font-bold font-display" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-xs text-muted">{k.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { name: 'Migração AWS', status: 'Em Dia', health: 82, progress: 65, color: '#48bb78' },
                { name: 'ERP SAP S/4HANA', status: 'Em Risco', health: 54, progress: 40, color: '#ed8936' },
                { name: 'Portal do Cliente', status: 'Concluído', health: 100, progress: 100, color: '#63b3ed' },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg border border-border">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${p.color}18`, color: p.color }}>
                    {p.health}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[--text] truncate">{p.name}</p>
                    <div className="h-1 bg-[--border] rounded-full mt-1.5">
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: p.color }}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-[--text] mb-4">
            Pronto para conectar seus projetos?
          </h2>
          <p className="text-muted mb-8">
            Entre com sua conta Google ou Microsoft e crie seu primeiro workspace em segundos.
          </p>
          <Link
            to="/login"
            className="btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2"
          >
            Começar agora
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-synapse-gradient flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-display font-semibold text-sm">Synaps</span>
        </div>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Synaps · synaps.app.br · Gerenciamento de projetos inteligente
        </p>
      </footer>
    </div>
  );
}
