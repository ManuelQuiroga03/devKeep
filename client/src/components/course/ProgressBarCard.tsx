import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ProgressBarCardProps {
  course: Course;
  onToggleLessonComplete: () => void;
}

export const ProgressBarCard: React.FC<ProgressBarCardProps> = ({
  course,
  onToggleLessonComplete,
}) => {
  const { isAdmin } = useAuth();

  return (
    <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-dark-textMuted">Avance del Curso</span>
        <span className="text-cyanAccent font-bold">{course.progressPercentage}%</span>
      </div>
      <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden border border-dark-border/50">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            course.status === 'Completed' ? 'bg-emerald-400' : 'bg-cyan-500'
          }`}
          style={{ width: `${course.progressPercentage}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-dark-textMuted font-mono space-y-0.5">
          <div>{course.completedLessons} de {course.totalLessons} lecciones</div>
          {course.totalChapters > 0 && (
            <div className="text-[11px] text-cyanAccent">Capítulo {course.currentChapter} de {course.totalChapters}</div>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={onToggleLessonComplete}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20 hover:bg-cyanAccent/20 hover:border-cyanAccent/40 hover:shadow-sm hover:shadow-cyanAccent/15 active:scale-95 transition-all duration-200 text-xs font-medium"
            title="Marcar avance de lección"
          >
            <CheckCircle2 className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
            <span>Marcar Lección</span>
          </button>
        )}
      </div>
    </div>
  );
};
