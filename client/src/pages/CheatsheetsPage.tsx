import React, { useEffect, useState } from 'react';
import { Plus, Search, Star, Copy, Check, Trash2 } from 'lucide-react';
import { cheatsheetService } from '../services/cheatsheetService';
import type { CheatSheetItem, CreateCheatSheetDto } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const CheatsheetsPage: React.FC = () => {
  const [items, setItems] = useState<CheatSheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState<CreateCheatSheetDto>({
    technology: 'Podman',
    category: 'Contenedores',
    command: '',
    description: '',
    isFavorite: false,
  });

  const technologies = ['All', 'Podman', 'Docker', 'Git', '.NET', 'Linux'];

  const loadCheatSheets = async () => {
    try {
      setLoading(true);
      const data = await cheatsheetService.getCheatSheets();
      setItems(data);
    } catch (err) {
      toast.error('Error al cargar la lista de atajos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheatSheets();
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

  const handleToggleFavorite = async (item: CheatSheetItem) => {
    if (!isAdmin) return;
    try {
      await cheatsheetService.toggleFavorite(item);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i))
      );
      toast.success(item.isFavorite ? 'Removido de favoritos' : 'Añadido a favoritos');
    } catch (err) {
      toast.error('Error al actualizar favorito');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('¿Eliminar este comando de la hoja de atajos?')) {
      try {
        await cheatsheetService.deleteCheatSheet(id);
        toast.success('Comando eliminado');
        loadCheatSheets();
      } catch (err) {
        toast.error('Error al eliminar el comando');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.command.trim() || !formData.description.trim()) {
      toast.error('El comando y la descripción son obligatorios');
      return;
    }

    try {
      await cheatsheetService.createCheatSheet({
        ...formData,
        command: formData.command.trim(),
        description: formData.description.trim(),
      });
      toast.success('Atajo agregado correctamente');
      setIsModalOpen(false);
      setFormData({
        technology: 'Podman',
        category: 'Contenedores',
        command: '',
        description: '',
        isFavorite: false,
      });
      loadCheatSheets();
    } catch (err) {
      toast.error('Error al agregar el atajo');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesTech = selectedTech === 'All' || item.technology.toLowerCase() === selectedTech.toLowerCase();
    const matchesSearch =
      item.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTech && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark-textMain tracking-tight">Atajos de Desarrollador</h2>
          <p className="text-sm text-dark-textMuted mt-1">
            Colección de comandos esenciales para Podman, Docker, Git, Linux y .NET CLI con 1-Click Copy.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 text-dark-bg font-semibold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Atajo</span>
          </button>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-dark-card border border-dark-border">
        {/* Technology Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {technologies.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                selectedTech === tech
                  ? 'bg-cyanAccent text-dark-bg font-semibold shadow-sm'
                  : 'bg-dark-surface text-dark-textMuted hover:text-dark-textMain hover:bg-dark-border'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-dark-textMuted absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por comando..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain text-xs outline-none focus:border-cyanAccent transition-all"
          />
        </div>
      </div>

      {/* Grid of CheatSheet Cards */}
      {loading ? (
        <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted font-mono text-sm">
          Cargando atajos técnicos...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted text-sm">
          No se encontraron comandos con los filtros actuales.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-3 hover:border-dark-borderHover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Tech & Category Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20">
                      {item.technology}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-dark-surface text-dark-textMuted border border-dark-border">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => handleToggleFavorite(item)}
                          className={`p-1.5 rounded transition-colors ${
                            item.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-dark-textMuted hover:text-amber-400'
                          }`}
                          title={item.isFavorite ? 'Remover favorito' : 'Marcar favorito'}
                        >
                          <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-dark-textMuted hover:text-rose-400 transition-colors"
                          title="Eliminar comando"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      item.isFavorite && (
                        <span className="p-1 text-amber-400">
                          <Star className="w-4 h-4 fill-amber-400" />
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-dark-textMuted mb-2">{item.description}</p>

                {/* Command Box with 1-Click Copy */}
                <div className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                  <code className="text-xs font-mono text-emerald-300 break-all pr-2">
                    {item.command}
                  </code>
                  <button
                    onClick={() => handleCopyCommand(item.command, item.id)}
                    className="p-1.5 rounded bg-dark-surface hover:bg-dark-border text-dark-textMain transition-colors shrink-0"
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

      {/* Modal Form: Add New CheatSheet */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agregar Atajo Técnico"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Tecnología *
              </label>
              <select
                value={formData.technology}
                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain text-xs font-mono outline-none"
              >
                <option value="Podman">Podman</option>
                <option value="Docker">Docker</option>
                <option value="Git">Git</option>
                <option value=".NET">.NET CLI</option>
                <option value="Linux">Linux CLI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Categoría *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Contenedores, Git Flow, EF Core"
                className="w-full px-3.5 py-2 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Comando o Script *
            </label>
            <textarea
              required
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="podman run -d --name postgres -p 5432:5432 postgres:15"
              className="w-full p-3 rounded-xl bg-dark-bg border border-dark-border text-emerald-300 font-mono text-xs outline-none h-20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Descripción Breve *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej: Levantar contenedor de PostgreSQL 15 en segundo plano"
              className="w-full px-3.5 py-2 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isFavorite"
              checked={formData.isFavorite}
              onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              className="rounded bg-dark-bg border-dark-border text-cyanAccent focus:ring-0"
            />
            <label htmlFor="isFavorite" className="text-xs text-dark-textMuted cursor-pointer">
              Marcar como comando favorito por defecto
            </label>
          </div>

          <div className="pt-4 border-t border-dark-border flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar Atajo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
