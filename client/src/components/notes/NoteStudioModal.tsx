import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, Heading, List, Code, Link as LinkIcon, Columns, Eye, FileText } from 'lucide-react';
import type { CourseNote, CreateNoteDto } from '../../types';
import { Modal } from '../Modal';
import { CodeBlock } from '../CodeBlock';

interface NoteStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote: CourseNote | null;
  courseTitle: string;
  noteForm: CreateNoteDto;
  setNoteForm: React.Dispatch<React.SetStateAction<CreateNoteDto>>;
  viewMode: 'split' | 'edit' | 'preview';
  setViewMode: (mode: 'split' | 'edit' | 'preview') => void;
  onSaveNote: (e: React.FormEvent) => void;
}

export const NoteStudioModal: React.FC<NoteStudioModalProps> = ({
  isOpen,
  onClose,
  editingNote,
  courseTitle,
  noteForm,
  setNoteForm,
  viewMode,
  setViewMode,
  onSaveNote,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Helper para insertar sintaxis de Markdown en la posición actual del cursor
  const insertMarkdownFormat = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    const currentContent = noteForm.markdownContent;

    if (!textarea) {
      setNoteForm((prev) => ({
        ...prev,
        markdownContent: prev.markdownContent + `${prefix}${defaultText}${suffix}`,
      }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentContent.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = currentContent.substring(0, start) + replacement + currentContent.substring(end);
    setNoteForm((prev) => ({ ...prev, markdownContent: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingNote ? `Editar Nota "${editingNote.lessonTitle}"` : `Agregar Nota a "${courseTitle}"`}
      maxWidth="max-w-6xl"
      className="h-[92vh]"
    >
      <form onSubmit={onSaveNote} className="flex flex-col h-full grow space-y-4">
        {/* Top Header Bar: Metadata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0 bg-dark-surface/80 p-3 rounded-xl border border-dark-border">
          <div className="md:col-span-6">
            <label className="block text-[11px] font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Título de la Lección *
            </label>
            <input
              type="text"
              required
              value={noteForm.lessonTitle}
              onChange={(e) => setNoteForm({ ...noteForm, lessonTitle: e.target.value })}
              placeholder="Ej: Métodos HTTP y arquitectura RESTful"
              className="w-full px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-xs transition-all"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Sección / Módulo
            </label>
            <input
              type="text"
              value={noteForm.sectionTitle}
              onChange={(e) => setNoteForm({ ...noteForm, sectionTitle: e.target.value })}
              placeholder="Ej: Sección 3 / Capítulo 19"
              className="w-full px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-xs transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Marca de Tiempo
            </label>
            <input
              type="text"
              value={noteForm.videoTimestamp}
              onChange={(e) => setNoteForm({ ...noteForm, videoTimestamp: e.target.value })}
              placeholder="Ej: 4:15"
              className="w-full px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-xs font-mono transition-all"
            />
          </div>
        </div>

        {/* Quick Format Toolbar & View Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 bg-dark-surface/60 p-2 rounded-xl border border-dark-border">
          {/* Format Buttons */}
          {viewMode !== 'preview' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertMarkdownFormat('**', '**', 'texto en negrita')}
                className="p-1.5 rounded hover:bg-dark-border text-dark-textMuted hover:text-cyanAccent transition-colors btn-action-icon"
                title="Negrita (**texto**)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownFormat('*', '*', 'texto en cursiva')}
                className="p-1.5 rounded hover:bg-dark-border text-dark-textMuted hover:text-cyanAccent transition-colors btn-action-icon"
                title="Cursiva (*texto*)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownFormat('\n# ', '', 'Título Principal')}
                className="p-1.5 rounded hover:bg-dark-border text-dark-textMuted hover:text-cyanAccent transition-colors btn-action-icon"
                title="Título (# Título)"
              >
                <Heading className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownFormat('\n* ', '', 'Elemento de lista')}
                className="p-1.5 rounded hover:bg-dark-border text-dark-textMuted hover:text-cyanAccent transition-colors btn-action-icon"
                title="Lista de Viñetas (* Elemento)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownFormat('\n```csharp\n', '\n```\n', '// Tu código aquí')}
                className="p-1.5 rounded hover:bg-dark-border text-dark-textMuted hover:text-cyanAccent transition-colors btn-action-icon"
                title="Bloque de Código (```csharp ... ```)"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownFormat('[', '](https://...)', 'Texto del enlace')}
                className="p-1.5 rounded hover:bg-dark-border text-dark-textMuted hover:text-cyanAccent transition-colors btn-action-icon"
                title="Enlace ([Texto](URL))"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-dark-bg p-1 rounded-lg border border-dark-border ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-cyanAccent/20 text-cyanAccent border border-cyanAccent/30'
                  : 'text-dark-textMuted hover:text-dark-textMain'
              }`}
              title="Lado a Lado (50% Editor + 50% Render)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'edit'
                  ? 'bg-cyanAccent/20 text-cyanAccent border border-cyanAccent/30'
                  : 'text-dark-textMuted hover:text-dark-textMain'
              }`}
              title="Solo Editor de Texto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Escribir</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'preview'
                  ? 'bg-cyanAccent/20 text-cyanAccent border border-cyanAccent/30'
                  : 'text-dark-textMuted hover:text-dark-textMain'
              }`}
              title="Solo Vista Previa Renderizada"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista Previa</span>
            </button>
          </div>
        </div>

        {/* Central Body (Full Height Split Editor / Live Preview Studio) */}
        <div className={`grow grid gap-4 min-h-[350px] overflow-hidden ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}>
          {/* Left Column: Markdown Editor */}
          {(viewMode === 'split' || viewMode === 'edit') && (
            <div className="flex flex-col h-full border border-dark-border rounded-xl bg-dark-bg overflow-hidden shadow-inner">
              <div className="px-3 py-1.5 bg-dark-surface border-b border-dark-border text-[11px] font-mono text-dark-textMuted uppercase flex items-center justify-between">
                <span>Markdown Raw Editor</span>
                <span>Sintaxis Estándar</span>
              </div>
              <textarea
                ref={textareaRef}
                required
                value={noteForm.markdownContent}
                onChange={(e) => setNoteForm({ ...noteForm, markdownContent: e.target.value })}
                placeholder="Escribe tus notas en formato Markdown...&#10;&#10;# Título Principal (h1)&#10;## Subtítulo de Lección (h2)&#10;* Get: Para solicitar datos&#10;* Post: Para enviar datos"
                className="grow w-full p-4 bg-transparent text-dark-textMain text-xs font-mono leading-relaxed outline-none resize-none overflow-y-auto"
              />
            </div>
          )}

          {/* Right Column: Real-Time Rendered Preview */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className="flex flex-col h-full border border-dark-border rounded-xl bg-dark-bg overflow-hidden shadow-inner">
              <div className="px-3 py-1.5 bg-dark-surface border-b border-dark-border text-[11px] font-mono text-cyanAccent uppercase flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Vista Previa Renderizada en Tiempo Real</span>
                </span>
                <span>HTML Output</span>
              </div>
              <div className="grow w-full p-4 overflow-y-auto">
                {noteForm.markdownContent.trim() ? (
                  <div className="prose prose-invert prose-cyan max-w-none text-xs text-dark-textMain leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          if (!inline) {
                            return <CodeBlock code={codeString} language={match ? match[1] : undefined} />;
                          }
                          return (
                            <code className="px-1.5 py-0.5 rounded bg-dark-surface border border-dark-border text-cyan-300 font-mono text-[11px]" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {noteForm.markdownContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-dark-textMuted font-mono">
                    Comienza a escribir a la izquierda para ver el renderizado en tiempo real.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Bar: Metadata Inputs & Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0 bg-dark-surface/80 p-3.5 rounded-xl border border-dark-border">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Etiquetas (Separadas por coma)
            </label>
            <input
              type="text"
              value={noteForm.tags}
              onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
              placeholder="dotnet, efcore, postgresql"
              className="w-full px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-xs font-mono transition-all"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Enlace Directo (URL Opcional)
            </label>
            <input
              type="url"
              value={noteForm.directUrl}
              onChange={(e) => setNoteForm({ ...noteForm, directUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-xs transition-all"
            />
          </div>

          <div className="md:col-span-3 flex items-end justify-end gap-2 pt-2 md:pt-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto btn-secondary text-xs py-2 px-3.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full md:w-auto btn-primary text-xs py-2 px-4"
            >
              {editingNote ? 'Guardar Cambios' : 'Guardar Nota'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
