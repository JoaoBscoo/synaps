import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTenant } from '../hooks/useTenant';
import clsx from 'clsx';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { tenant, slug } = useTenant();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { href: `/w/${slug}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `/w/${slug}/projects`, label: 'Projetos', icon: FolderKanban },
    { href: `/w/${slug}/settings`, label: 'Configurações', icon: Settings },
  ];

  const workspaces = user?.tenants || [];

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <Link to={`/w/${slug}/dashboard`} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-synapse-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">S</span>
              </div>
              <span className="font-display font-semibold text-[--text]">Synaps</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted hover:text-[--text]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Workspace selector */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-synapse/8 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded bg-synapse/20 flex items-center justify-center shrink-0">
                  <span className="text-synapse text-xs font-bold">
                    {tenant?.name?.charAt(0) || 'W'}
                  </span>
                </div>
                <span className="text-sm font-medium text-[--text] truncate">
                  {tenant?.name || slug}
                </span>
              </div>
              <ChevronDown size={14} className="text-muted shrink-0" />
            </button>

            {userMenuOpen && workspaces.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-xl z-50 py-1">
                {workspaces.map((tu) => (
                  <button
                    key={tu.tenantId}
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate(`/w/${tu.tenant?.slug}/dashboard`);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-synapse/8 transition-colors flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded bg-pulse/20 flex items-center justify-center">
                      <span className="text-pulse text-xs font-bold">
                        {tu.tenant?.name?.charAt(0)}
                      </span>
                    </div>
                    <span className="truncate">{tu.tenant?.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={clsx('nav-link', location.pathname === href && 'active')}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Quick action */}
        <div className="p-3 border-t border-border">
          <Link
            to={`/w/${slug}/projects/new`}
            className="flex items-center gap-2 w-full btn-primary text-sm justify-center"
          >
            <Plus size={16} />
            Novo Projeto
          </Link>
        </div>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-pulse/20 flex items-center justify-center">
                <span className="text-pulse text-xs font-bold">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[--text] truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-muted hover:text-critical transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
          <button onClick={() => setSidebarOpen(true)} className="text-muted hover:text-[--text]">
            <Menu size={20} />
          </button>
          <span className="font-display font-semibold text-[--text]">Synaps</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
