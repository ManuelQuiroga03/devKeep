import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Terminal, Star, Layers } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Cursos y Recursos',
      path: '/courses',
      icon: BookOpen,
    },
    {
      name: 'Cheatsheets',
      path: '/cheatsheets',
      icon: Terminal,
    },
    {
      name: 'Favoritos',
      path: '/favorites',
      icon: Star,
    },
  ];

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-dark-border">
          <div className="p-2 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700">
            <Layers className="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-dark-textMain tracking-wide">DevKeep</h1>
            <p className="text-[10px] font-mono text-dark-textMuted uppercase tracking-wider">Dev Docs & Keep</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out ${
                    isActive
                      ? 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/80 font-semibold shadow-sm translate-x-1'
                      : 'text-dark-textMuted hover:text-dark-textMain hover:bg-dark-surface/80 hover:translate-x-1'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-zinc-100' : 'text-dark-textMuted group-hover:text-dark-textMain'}`} />
                    <span className="tracking-wide">{item.name}</span>
                    {isActive && (
                      <span className="absolute right-2 w-1.5 h-4 rounded-full bg-zinc-300"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-dark-border">
        <div className="p-3 rounded-xl bg-dark-surface border border-dark-border text-xs text-dark-textMuted">
          <div className="font-semibold text-dark-textMain mb-1">DevKeep API</div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Conectado a .NET 8</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
