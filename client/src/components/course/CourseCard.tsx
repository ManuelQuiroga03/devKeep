import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, ExternalLink, Trash2, Award } from 'lucide-react';
import type { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CourseCardProps {
  course: Course;
  onEdit: (e: React.MouseEvent, course: Course) => void;
  onDelete: (e: React.MouseEvent, id: string, title: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5270';
  const certFullUrl = course.certificateUrl?.startsWith('http')
    ? course.certificateUrl
    : `${apiBase}${course.certificateUrl}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Completado
          </span>
        );
      case 'Not Started':
        return (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-surface text-dark-textMuted border border-dark-border font-medium">
            Por Empezar
          </span>
        );
      default:
        return (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20 font-medium">
            En Progreso
          </span>
        );
    }
  };

  const calculateProgress = (): number => {
    if (course.status === 'Completed') return 100;
    if (course.progressPercentage !== undefined && course.progressPercentage !== null) {
      return course.progressPercentage;
    }
    if (course.totalLessons > 0) {
      return Math.min(100, Math.round((course.completedLessons / course.totalLessons) * 100));
    }
    if (course.totalChapters > 0) {
      return Math.min(100, Math.round((course.currentChapter / course.totalChapters) * 100));
    }
    return 0;
  };

  const progress = calculateProgress();

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="p-5 rounded-2xl bg-dark-card border border-dark-border hover:border-cyanAccent/80 hover:shadow-[0_0_25px_rgba(6,182,212,0.22)] hover:-translate-y-1.5 transition-all duration-300 ease-in-out flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Platform, Status Badge & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20 font-medium">
              {course.platform}
            </span>
            {getStatusBadge(course.status)}
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <button
                onClick={(e) => onEdit(e, course)}
                className="p-1.5 rounded-lg hover:bg-cyanAccent/10 text-dark-textMuted hover:text-cyanAccent hover:border hover:border-cyanAccent/30 transition-all btn-action-icon"
                title="Editar información del curso"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {course.courseUrl && (
              <a
                href={course.courseUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-cyanAccent/10 text-dark-textMuted hover:text-cyanAccent hover:border hover:border-cyanAccent/30 transition-all btn-action-icon"
                title="Abrir enlace del curso en una nueva pestaña"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {isAdmin && (
              <button
                onClick={(e) => onDelete(e, course.id, course.title)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-dark-textMuted hover:text-rose-400 hover:border hover:border-rose-500/30 transition-all btn-action-icon"
                title="Eliminar este curso"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Instructor */}
        <h3 className="font-semibold text-lg text-dark-textMain group-hover:text-cyanAccent transition-colors leading-snug line-clamp-2">
          {course.title}
        </h3>
        {course.instructor && (
          <p className="text-xs text-dark-textMuted mt-1">Instructor: {course.instructor}</p>
        )}

        {/* Chapter & Certificate Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {course.totalChapters > 0 && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-surface text-dark-textMuted border border-dark-border">
              Cap. {course.currentChapter}/{course.totalChapters}
            </span>
          )}

          {course.status === 'Completed' && course.certificateUrl && (
            <a
              href={certFullUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 transition-colors font-medium btn-action-icon"
              title="Ver o descargar certificado de finalización"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Ver Certificado</span>
            </a>
          )}
        </div>
      </div>

      {/* Progress & Lessons Info */}
      <div className="mt-6 pt-4 border-t border-dark-border">
        <div className="flex items-center justify-between text-xs text-dark-textMuted font-mono mb-1.5">
          <span>
            {course.totalLessons > 0
              ? `${course.completedLessons} / ${course.totalLessons} lecciones`
              : course.totalChapters > 0
              ? `Cap. ${course.currentChapter} / ${course.totalChapters}`
              : 'Sin lecciones registradas'}
          </span>
          <span className="font-semibold text-dark-textMain">{progress}%</span>
        </div>
        <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden border border-dark-border/50">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              course.status === 'Completed' ? 'bg-emerald-400' : 'bg-cyan-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
