import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Download, Plus } from 'lucide-react';
import type { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CourseHeaderProps {
  course: Course;
  certFullUrl: string;
  onExportMarkdown: () => void;
  onOpenCreateNoteModal: () => void;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  certFullUrl,
  onExportMarkdown,
  onOpenCreateNoteModal,
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dark-border">
      <div>
        <button
          onClick={() => navigate('/courses')}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-surface/60 border border-dark-border/80 text-xs font-medium text-dark-textMuted hover:text-dark-textMain hover:bg-dark-surface hover:border-cyanAccent/40 hover:shadow-sm hover:shadow-cyanAccent/10 transition-all duration-200 active:scale-95 mb-2"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-cyanAccent" />
          <span>Volver a Cursos</span>
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20">
            {course.platform}
          </span>
          <h2 className="text-2xl font-bold text-dark-textMain">{course.title}</h2>
        </div>
        {course.instructor && (
          <p className="text-xs text-dark-textMuted mt-1">Instructor: {course.instructor}</p>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {course.status === 'Completed' && course.certificateUrl && (
          <a
            href={certFullUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 hover:border-amber-400/50 hover:shadow-sm hover:shadow-amber-400/15 active:scale-95 text-xs font-semibold transition-all duration-200"
            title="Ver o descargar certificado de finalización"
          >
            <Award className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span>Ver Certificado</span>
          </a>
        )}

        <button
          onClick={onExportMarkdown}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-surface/80 border border-dark-border hover:border-cyanAccent/40 hover:text-cyanAccent hover:bg-dark-surface hover:shadow-sm hover:shadow-cyanAccent/10 active:scale-95 transition-all duration-200 text-xs font-medium text-dark-textMain"
          title="Exportar todas las notas del curso en archivo .md"
        >
          <Download className="w-4 h-4 text-cyanAccent transition-transform duration-200 group-hover:translate-y-0.5" />
          <span>Exportar Markdown</span>
        </button>

        {isAdmin && (
          <button
            onClick={onOpenCreateNoteModal}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyanAccent text-dark-bg font-semibold text-xs hover:bg-cyanAccent-hover hover:shadow-lg hover:shadow-cyanAccent/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Nueva Nota</span>
          </button>
        )}
      </div>
    </div>
  );
};
