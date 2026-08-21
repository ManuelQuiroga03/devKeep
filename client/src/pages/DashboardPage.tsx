import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Terminal, Star, Plus, Copy, Check } from 'lucide-react';
import { courseService } from '../services/courseService';
import { cheatsheetService } from '../services/cheatsheetService';
import { noteService } from '../services/noteService';
import type { Course, CheatSheetItem, CourseNote } from '../types';
import { toast } from 'sonner';

export const DashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [cheatSheets, setCheatSheets] = useState<CheatSheetItem[]>([]);
  const [recentNotes, setRecentNotes] = useState<CourseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, cheatSheetsData, notesData] = await Promise.all([
          courseService.getCourses(),
          cheatsheetService.getCheatSheets(),
          noteService.getNotes(),
        ]);
        setCourses(coursesData);
        setCheatSheets(cheatSheetsData);
        setRecentNotes(notesData.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        toast.error('Error al conectar con la API de DevKeep');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      toast.error('Error al copiar el comando');
    }
  };

  const favoriteCheatSheets = cheatSheets.filter((cs) => cs.isFavorite);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark-textMain tracking-tight">Dashboard General</h2>
          <p className="text-sm text-dark-textMuted mt-1">
            Resumen de progreso técnico, notas de lecciones y hojas de atajos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyanAccent text-dark-bg font-semibold text-sm hover:bg-cyanAccent-hover transition-colors shadow-lg shadow-cyanAccent/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Curso</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-dark-card border border-dark-border flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-dark-textMain">{courses.length}</div>
            <div className="text-xs text-dark-textMuted font-medium">Cursos Totales</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-dark-card border border-dark-border flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigoAccent/10 text-indigoAccent-light border border-indigoAccent/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-dark-textMain">{recentNotes.length}</div>
            <div className="text-xs text-dark-textMuted font-medium">Notas Registradas</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-dark-card border border-dark-border flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-dark-textMain">{cheatSheets.length}</div>
            <div className="text-xs text-dark-textMuted font-medium">Atajos & Comandos</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-dark-card border border-dark-border flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-dark-textMain">{favoriteCheatSheets.length}</div>
            <div className="text-xs text-dark-textMuted font-medium">Favoritos Guardados</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Courses & Featured Cheatsheets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col (2 cols): Active Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dark-textMain flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyanAccent" />
              <span>Cursos en Progreso</span>
            </h3>
            <Link to="/courses" className="text-xs text-cyanAccent hover:underline font-medium">
              Ver todos ({courses.length})
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted font-mono text-sm">
              Cargando cursos...
            </div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted text-sm">
              No hay cursos creados aún. Haz clic en &quot;Nuevo Curso&quot; para registrar tu primer recurso.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.slice(0, 4).map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="p-5 rounded-xl bg-dark-card border border-dark-border hover:border-dark-borderHover transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20">
                        {course.platform}
                      </span>
                      <span className="text-xs text-dark-textMuted font-mono">
                        {course.completedLessons}/{course.totalLessons} lecciones
                      </span>
                    </div>
                    <h4 className="font-semibold text-dark-textMain group-hover:text-cyanAccent transition-colors line-clamp-1">
                      {course.title}
                    </h4>
                    {course.instructor && (
                      <p className="text-xs text-dark-textMuted mt-1">Instructor: {course.instructor}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-dark-border">
                    <div className="flex justify-between text-xs text-dark-textMuted mb-1 font-mono">
                      <span>Progreso</span>
                      <span>{course.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyanAccent h-full rounded-full transition-all duration-300"
                        style={{ width: `${course.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Featured Cheatsheets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dark-textMain flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span>Atajos Destacados</span>
            </h3>
            <Link to="/cheatsheets" className="text-xs text-cyanAccent hover:underline font-medium">
              Explorar atajos
            </Link>
          </div>

          <div className="space-y-3">
            {cheatSheets.slice(0, 5).map((cs) => (
              <div
                key={cs.id}
                className="p-3.5 rounded-xl bg-dark-card border border-dark-border hover:border-dark-borderHover transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-cyanAccent font-medium">
                    {cs.technology} • {cs.category}
                  </span>
                  <button
                    onClick={() => handleCopyCommand(cs.command, cs.id)}
                    className="p-1 rounded bg-dark-surface hover:bg-dark-border text-dark-textMuted hover:text-dark-textMain transition-colors"
                    title="Copiar comando"
                  >
                    {copiedId === cs.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="text-xs font-mono text-emerald-300 bg-dark-bg p-2 rounded border border-dark-border">
                  {cs.command}
                </div>
                <p className="text-xs text-dark-textMuted mt-1.5 line-clamp-1">{cs.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
