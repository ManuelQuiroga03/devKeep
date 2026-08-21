import React, { useEffect, useState } from 'react';
import { Search, Radio } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface TopbarProps {
  onOpenCommandPalette: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette }) => {
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

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
    <header className="h-16 border-b border-dark-border bg-dark-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Quick Search Bar */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-dark-bg border border-dark-border hover:border-dark-borderHover text-dark-textMuted hover:text-dark-textMain text-sm w-72 md:w-96 transition-all"
      >
        <Search className="w-4 h-4 text-cyanAccent" />
        <span className="flex-1 text-left">Buscar cursos, notas o atajos...</span>
        <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-dark-textMuted bg-dark-surface border border-dark-border rounded">
          Ctrl + K
        </kbd>
      </button>

      {/* API Sync Status Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-surface border border-dark-border text-xs">
          <Radio className={`w-3.5 h-3.5 ${apiConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          <span className="text-dark-textMuted font-mono">
            {apiConnected === null ? 'Verificando...' : apiConnected ? 'API Conectada' : 'Modo Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};
