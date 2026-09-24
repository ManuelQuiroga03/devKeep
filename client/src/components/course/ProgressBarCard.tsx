import React from 'react';
import { CheckCircle2, PlusCircle } from 'lucide-react';
import type { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ProgressBarCardProps {
  course: Course;
  onIncrementChapter: () => void;
  onToggleLessonComplete: () => void;
}

export const ProgressBarCard: React.FC<ProgressBarCardProps> = ({
  course,
  onIncrementChapter,
  onToggleLessonComplete,
}) => {
  const { isAdmin } = useAuth();

  return (
    <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-dark-textMuted">Avance del Curso</span>
        <span className="text-dark-textMain font-bold">{course.progressPercentage}%</span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden border border-dark-border/60">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            course.status === 'Completed' ? 'bg-emerald-500' : 'bg-sky-400'
          }`}
          style={{ width: `${course.progressPercentage}%` }}
        ></div>
      </div>

      {/* Stats & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Dual Counters */}
        <div className="text-xs text-dark-textMuted font-mono space-y-0.5">
          {course.totalLessons > 0 && (
            <div>{course.completedLessons} de {course.totalLessons} lecciones</div>
          )}
          {course.totalChapters > 0 && (
            <div className="text-[11px] text-sky-400 font-semibold">
              Capítulo {course.currentChapter} de {course.totalChapters}
            </div>
          )}
        </div>

        {/* Admin Action Buttons */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            {course.totalChapters > 0 && (
              <button
                onClick={onIncrementChapter}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-surface text-sky-400 border border-sky-500/30 hover:bg-sky-500/10 hover:border-sky-500/50 active:scale-95 transition-all duration-200 text-xs font-medium"
                title="Avanzar 1 capítulo (avance fino)"
              >
                <PlusCircle className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                <span>+1 Cap.</span>
              </button>
            )}

            <button
              onClick={onToggleLessonComplete}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 hover:text-white active:scale-95 transition-all duration-200 text-xs font-medium"
              title="Marcar avance de lección completada (sección)"
            >
              <CheckCircle2 className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
              <span>Marcar Lección</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
