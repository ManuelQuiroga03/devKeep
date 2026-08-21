import React, { useEffect, useState } from 'react';
import { Plus, Search, Star, Copy, Check, Trash2 } from 'lucide-react';
import { cheatsheetService } from '../services/cheatsheetService';
import type { CheatSheetItem, CreateCheatSheetDto } from '../types';
import { Modal } from '../components/Modal';
import { toast } from 'sonner';

export const CheatsheetsPage: React.FC = () => {
  const [items, setItems] = useState<CheatSheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        toast.error('Error al eliminar comando');
      }
    }
  };

  const handleCreateCheatSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.command.trim() || !formData.description.trim()) {
      toast.error('El comando y la descripción son obligatorios');
      return;
    }

    try {
      await cheatsheetService.createCheatSheet(formData);
      toast.success('Atajo agregado a la colección');
      setIsModalOpen(false);
      setFormData({
        technology: 'Podman',
        category: 'Contenedores',
        command: '',
        description: '',
        isFavorite: false,
      });
      loadCheatSheets();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error al agregar el atajo');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesTech = selectedTech === 'All' || item.technology.toLowerCase() === selectedTech.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      item.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTech && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark-textMain tracking-tight">Hojas de Atajos (Cheatsheets)</h2>
          <p className="text-sm text-dark-textMuted mt-1">
            Colección de comandos esenciales para Podman, Docker, Git, Linux y .NET CLI con 1-Click Copy.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 text-dark-bg font-semibold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Atajo</span>
        </button>
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
          <Search className="w-4 h-4 text-dark-textMuted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por comando o descripción..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain placeholder-dark-textMuted text-xs outline-none focus:border-cyanAccent font-mono"
          />
        </div>
      </div>

      {/* Cheatsheet Items Grid */}
      {loading ? (
        <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted font-mono text-sm">
          Cargando comandos...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted text-sm">
          No se encontraron comandos para los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-dark-card border border-dark-border hover:border-dark-borderHover transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Tech Badge, Category, Star & Actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20 font-medium">
                      {item.technology}
                    </span>
                    <span className="text-xs text-dark-textMuted font-mono">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
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

      {/* Modal Form: Add CheatSheet Item */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agregar Nuevo Comando a Cheatsheets"
      >
        <form onSubmit={handleCreateCheatSheet} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Tecnología *
              </label>
              <select
                value={formData.technology}
                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-sm font-mono"
              >
                <option value="Podman">Podman</option>
                <option value="Docker">Docker</option>
                <option value="Git">Git</option>
                <option value=".NET">.NET</option>
                <option value="Linux">Linux</option>
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
                placeholder="Ej: Contenedores, Redes, Volúmenes, Build"
                className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Comando CLI *
            </label>
            <input
              type="text"
              required
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="Ej: podman run -d -p 8080:8080 my-image"
              className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-emerald-300 focus:border-cyanAccent outline-none text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Descripción / Utilidad *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explica brevemente qué realiza este comando..."
              className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-sm leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFav"
              checked={formData.isFavorite}
              onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              className="rounded bg-dark-surface border-dark-border text-cyanAccent focus:ring-0"
            />
            <label htmlFor="isFav" className="text-xs text-dark-textMuted cursor-pointer">
              Marcar como comando destacado / favorito
            </label>
          </div>

          <div className="pt-4 border-t border-dark-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-dark-surface text-dark-textMuted hover:text-dark-textMain font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-500 text-dark-bg font-semibold text-sm hover:bg-emerald-400 transition-colors"
            >
              Guardar Comando
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
