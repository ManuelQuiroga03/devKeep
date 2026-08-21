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
          <div className="p-2 rounded-lg bg-cyanAccent/10 border border-cyanAccent/30 text-cyanAccent">
            <Layers className="w-5 h-5" />
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
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20 shadow-sm'
                      : 'text-dark-textMuted hover:text-dark-textMain hover:bg-dark-surface'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-dark-border">
        <div className="p-3 rounded-lg bg-dark-surface border border-dark-border text-xs text-dark-textMuted">
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
