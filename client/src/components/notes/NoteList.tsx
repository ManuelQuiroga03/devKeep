import React from 'react';
import { FileText } from 'lucide-react';
import type { CourseNote } from '../../types';

interface NoteListProps {
  notes?: CourseNote[];
  selectedNote: CourseNote | null;
  onSelectNote: (note: CourseNote) => void;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, selectedNote, onSelectNote }) => {
  return (
    <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-3">
      <div className="flex items-center justify-between border-b border-dark-border pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-textMuted flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyanAccent" />
          <span>Notas de Lecciones ({notes?.length || 0})</span>
        </h3>
      </div>

      {notes && notes.length > 0 ? (
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                selectedNote?.id === note.id
                  ? 'bg-cyanAccent/15 border-cyanAccent/50 text-dark-textMain translate-x-1 shadow-sm shadow-cyanAccent/10 font-medium'
                  : 'bg-dark-surface/60 border-dark-border/80 text-dark-textMuted hover:text-dark-textMain hover:bg-dark-surface hover:border-dark-borderHover hover:translate-x-1'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium line-clamp-1">{note.lessonTitle}</span>
                {note.videoTimestamp && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-bg text-cyanAccent border border-dark-border">
                    {note.videoTimestamp}
                  </span>
                )}
              </div>
              {note.sectionTitle && (
                <div className="text-xs text-dark-textMuted mt-1 line-clamp-1">
                  Sección: {note.sectionTitle}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-dark-textMuted">
          No hay notas registradas aún. Registra una con &quot;Nueva Nota&quot;.
        </div>
      )}
    </div>
  );
};
