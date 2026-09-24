import React, { useEffect, useState } from 'react';
import { Search, Radio, Eye, ShieldCheck, Lock, LogOut } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { AdminLoginModal } from '../components/AdminLoginModal';

interface TopbarProps {
  onOpenCommandPalette: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette }) => {
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAdmin, logout } = useAuth();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.get('/courses');
        setApiConnected(true);
      } catch (err) {
        setApiConnected(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-dark-border bg-dark-card/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
        {/* Quick Search Bar */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-dark-bg border border-dark-border hover:border-dark-borderHover text-dark-textMuted hover:text-dark-textMain text-sm w-64 md:w-96 transition-all"
        >
          <Search className="w-4 h-4 text-dark-textMuted" />
          <span className="flex-1 text-left line-clamp-1">Buscar cursos, notas o atajos...</span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-dark-textMuted bg-dark-surface border border-dark-border rounded">
            Ctrl + K
          </kbd>
        </button>

        {/* Status Indicators & Auth Access */}
        <div className="flex items-center gap-3">
          {/* Read-Only vs Admin Status Badge */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Modo Propietario</span>
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-dark-surface border border-dark-border text-dark-textMuted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMuted text-xs font-medium">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Modo Lectura (Público)</span>
              </span>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMuted hover:text-dark-textMain hover:border-dark-borderHover text-xs font-medium transition-all"
                title="Ingresar PIN de administrador para editar"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acceso Admin</span>
              </button>
            </div>
          )}

          {/* API Health Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-surface border border-dark-border text-xs">
            <Radio className={`w-3.5 h-3.5 ${apiConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-dark-textMuted font-mono">
              {apiConnected === null ? 'Verificando...' : apiConnected ? 'API Conectada' : 'Modo Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
