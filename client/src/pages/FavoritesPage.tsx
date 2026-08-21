import React, { useEffect, useState } from 'react';
import { Star, Copy, Check } from 'lucide-react';
import { cheatsheetService } from '../services/cheatsheetService';
import type { CheatSheetItem } from '../types';
import { toast } from 'sonner';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<CheatSheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await cheatsheetService.getCheatSheets(undefined, undefined, true);
      setFavorites(data);
    } catch (err) {
      toast.error('Error al cargar elementos favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleCopyCommand = async (command: string, id: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedId(id);
      toast.success('Comando copiado al portapapeles', {
        icon: <Check className="w-4 h-4 text-emerald-400" />,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Error al copiar comando');
    }
  };

  const handleRemoveFavorite = async (item: CheatSheetItem) => {
    try {
      await cheatsheetService.toggleFavorite(item);
      toast.success('Removido de favoritos');
      loadFavorites();
    } catch (err) {
      toast.error('Error al actualizar favorito');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-dark-textMain tracking-tight flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          <span>Comandos Favoritos</span>
        </h2>
        <p className="text-sm text-dark-textMuted mt-1">
          Acceso rápido a tus atajos técnicos destacados para consulta inmediata.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted font-mono text-sm">
          Cargando favoritos...
        </div>
      ) : favorites.length === 0 ? (
        <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted text-sm">
          No tienes comandos marcados como favoritos. Haz clic en el icono de la estrella en cualquier atajo para agregarlo aquí.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-dark-card border border-dark-border hover:border-dark-borderHover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20 font-medium">
                      {item.technology}
                    </span>
                    <span className="text-xs text-dark-textMuted font-mono">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(item)}
                    className="p-1.5 rounded text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition-colors"
                    title="Remover de favoritos"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>

                <p className="text-xs text-dark-textMuted mb-2">{item.description}</p>

                <div className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                  <code className="text-xs font-mono text-emerald-300 break-all pr-2">
                    {item.command}
                  </code>
                  <button
                    onClick={() => handleCopyCommand(item.command, item.id)}
                    className="p-1.5 rounded bg-dark-surface hover:bg-dark-border text-dark-textMain transition-colors flex-shrink-0"
                    title="1-Click Copy"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-dark-textMuted" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
