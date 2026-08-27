import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, FileText, Terminal, Copy, Check, ExternalLink } from 'lucide-react';
import { searchService } from '../services/searchService';
import type { SearchResult } from '../types';
import { toast } from 'sonner';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  //Listener para cerrar el modal de busqueda
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if(isOpen){
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isOpen]);

  //Listener para buscar en la base de datos
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const res = await searchService.globalSearch(query);
          setResults(res);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleCopyCommand = async (command: string, id: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedId(id);
      toast.success('Comando copiado al portapapeles', {
        icon: <Check className="w-4 h-4 text-emerald-400" />,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Error al copiar el comando');
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="flex items-center px-4 py-3 border-b border-dark-border bg-dark-surface">
          <Search className="w-5 h-5 text-cyanAccent mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cursos, notas, comandos o tecnologías (ej: Docker, Podman, Git)..."
            className="w-full bg-transparent border-none outline-none text-dark-textMain placeholder-dark-textMuted text-base font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded text-dark-textMuted hover:text-dark-textMain"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-8 text-center text-dark-textMuted font-mono text-sm">
              Buscando en DevKeep...
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-dark-textMuted text-sm">
              Escribe para buscar entre tus notas, cursos y cheatsheets...
            </div>
          )}

          {!loading && query && results && results.totalMatches === 0 && (
            <div className="py-8 text-center text-dark-textMuted text-sm">
              No se encontraron coincidencias para &quot;{query}&quot;.
            </div>
          )}

          {results && results.totalMatches > 0 && (
            <>
              {/* Courses Results */}
              {results.courses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyanAccent uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    <span>Cursos ({results.courses.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.courses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => handleNavigate(`/courses/${course.id}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-dark-surface hover:bg-dark-border cursor-pointer transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-medium text-dark-textMain group-hover:text-cyanAccent transition-colors">
                            {course.title}
                          </div>
                          <div className="text-xs text-dark-textMuted">
                            {course.platform} • {course.completedLessons}/{course.totalLessons} lecciones ({course.progressPercentage}%)
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-dark-textMuted group-hover:text-cyanAccent" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Results */}
              {results.notes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-indigoAccent-light uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Notas ({results.notes.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.notes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => handleNavigate(`/courses/${note.courseId}`)}
                        className="p-2.5 rounded-lg bg-dark-surface hover:bg-dark-border cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-dark-textMain group-hover:text-indigoAccent-light transition-colors">
                            {note.lessonTitle}
                          </span>
                          {note.videoTimestamp && (
                            <span className="text-xs font-mono text-dark-textMuted bg-dark-bg px-1.5 py-0.5 rounded">
                              {note.videoTimestamp}
                            </span>
                          )}
                        </div>
                        {note.sectionTitle && (
                          <div className="text-xs text-dark-textMuted mt-0.5">
                            Sección: {note.sectionTitle}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CheatSheets Results */}
              {results.cheatSheets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    <Terminal className="w-4 h-4" />
                    <span>Comandos ({results.cheatSheets.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.cheatSheets.map((cs) => (
                      <div
                        key={cs.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-dark-surface border border-dark-border hover:border-dark-borderHover transition-colors"
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20">
                              {cs.technology}
                            </span>
                            <span className="text-xs text-dark-textMuted">
                              {cs.category}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-emerald-300 bg-dark-bg p-1.5 rounded">
                            {cs.command}
                          </div>
                          <div className="text-xs text-dark-textMuted mt-1">
                            {cs.description}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyCommand(cs.command, cs.id)}
                          className="p-2 rounded bg-dark-bg hover:bg-dark-border text-dark-textMain transition-colors"
                          title="Copiar comando"
                        >
                          {copiedId === cs.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-dark-textMuted" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-dark-border bg-dark-surface flex items-center justify-between text-xs text-dark-textMuted">
          <span>Pulsa <kbd className="px-1.5 py-0.5 bg-dark-bg border border-dark-border rounded text-dark-textMain">Esc</kbd> para cerrar</span>
          <span>Búsqueda global en DevKeep</span>
        </div>
      </div>
    </div>
  );
};
