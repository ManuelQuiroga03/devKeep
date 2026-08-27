import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Clock, ExternalLink, Tag, Edit3, Trash2 } from 'lucide-react';
import type { CourseNote } from '../../types';
import { CodeBlock } from '../CodeBlock';
import { useAuth } from '../../context/AuthContext';

interface NoteReaderProps {
  note: CourseNote | null;
  onEditNote: (note: CourseNote) => void;
  onDeleteNote: (id: string) => void;
}

export const NoteReader: React.FC<NoteReaderProps> = ({ note, onEditNote, onDeleteNote }) => {
  const { isAdmin } = useAuth();

  if (!note) {
    return (
      <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted text-sm">
        Selecciona una nota de la lista izquierda para visualizar su contenido Markdown.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-dark-card border border-dark-border space-y-6">
      {/* Note Metadata Header */}
      <div className="flex items-start justify-between border-b border-dark-border pb-4">
        <div>
          {note.sectionTitle && (
            <span className="text-xs font-mono text-cyanAccent uppercase tracking-wider">
              Módulo: {note.sectionTitle}
            </span>
          )}
          <h3 className="text-xl font-bold text-dark-textMain mt-1">{note.lessonTitle}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-dark-textMuted">
            {note.videoTimestamp && (
              <span className="flex items-center gap-1 font-mono text-cyan-300 bg-dark-surface px-2 py-0.5 rounded border border-dark-border">
                <Clock className="w-3.5 h-3.5" />
                {note.videoTimestamp}
              </span>
            )}
            {note.directUrl && (
              <a
                href={note.directUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyanAccent hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Enlace directo</span>
              </a>
            )}
            {note.tags && (
              <span className="flex items-center gap-1 text-dark-textMuted">
                <Tag className="w-3.5 h-3.5 text-indigoAccent-light" />
                <code>{note.tags}</code>
              </span>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEditNote(note)}
              className="p-2 rounded-lg hover:bg-cyanAccent/15 text-dark-textMuted hover:text-cyanAccent hover:border hover:border-cyanAccent/30 hover:scale-105 active:scale-95 transition-all duration-150"
              title="Editar esta nota"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteNote(note.id)}
              className="p-2 rounded-lg hover:bg-rose-500/15 text-dark-textMuted hover:text-rose-400 hover:border hover:border-rose-500/30 hover:scale-105 active:scale-95 transition-all duration-150"
              title="Eliminar esta nota"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Markdown Content Reader */}
      <div className="prose prose-invert prose-cyan max-w-none text-sm text-dark-textMain leading-relaxed">
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
                <code className="px-1.5 py-0.5 rounded bg-dark-surface border border-dark-border text-cyan-300 font-mono text-xs" {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {note.markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};
