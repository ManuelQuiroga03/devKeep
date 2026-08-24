import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Plus, Download, ArrowLeft, CheckCircle2, 
  Clock, ExternalLink, Tag, FileText, Trash2, Award, Edit3 
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { noteService } from '../services/noteService';
import type { Course, CourseNote, CreateNoteDto } from '../types';
import { Modal } from '../components/Modal';
import { CodeBlock } from '../components/CodeBlock';
import { toast } from 'sonner';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedNote, setSelectedNote] = useState<CourseNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<CourseNote | null>(null);

  const [noteForm, setNoteForm] = useState<CreateNoteDto>({
    courseId: id || '',
    lessonTitle: '',
    sectionTitle: '',
    videoTimestamp: '',
    directUrl: '',
    markdownContent: '',
    tags: '',
  });

  const loadCourseData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await courseService.getCourseById(id);
      setCourse(data);
      if (data.notes && data.notes.length > 0) {
        if (selectedNote) {
          const updatedSelected = data.notes.find((n) => n.id === selectedNote.id);
          setSelectedNote(updatedSelected || data.notes[0]);
        } else {
          setSelectedNote(data.notes[0]);
        }
      } else {
        setSelectedNote(null);
      }
    } catch (err) {
      toast.error('Error al cargar la información del curso');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const handleOpenCreateNoteModal = () => {
    setEditingNote(null);
    setNoteForm({
      courseId: id!,
      lessonTitle: '',
      sectionTitle: '',
      videoTimestamp: '',
      directUrl: '',
      markdownContent: '',
      tags: '',
    });
    setIsNoteModalOpen(true);
  };

  const handleOpenEditNoteModal = (note: CourseNote) => {
    setEditingNote(note);
    setNoteForm({
      courseId: id!,
      lessonTitle: note.lessonTitle,
      sectionTitle: note.sectionTitle || '',
      videoTimestamp: note.videoTimestamp || '',
      directUrl: note.directUrl || '',
      markdownContent: note.markdownContent,
      tags: note.tags || '',
    });
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.lessonTitle.trim() || !noteForm.markdownContent.trim()) {
      toast.error('El título y contenido de la nota son obligatorios');
      return;
    }

    try {
      const sectionClean = noteForm.sectionTitle?.trim() || undefined;
      const timestampClean = noteForm.videoTimestamp?.trim() || undefined;
      const directUrlClean = noteForm.directUrl?.trim() || undefined;
      const tagsClean = noteForm.tags?.trim() || undefined;

      if (editingNote) {
        await noteService.updateNote(editingNote.id, {
          lessonTitle: noteForm.lessonTitle.trim(),
          markdownContent: noteForm.markdownContent,
          sectionTitle: sectionClean,
          videoTimestamp: timestampClean,
          directUrl: directUrlClean,
          tags: tagsClean || '',
        });
        toast.success('Nota actualizada correctamente');
      } else {
        const payload: CreateNoteDto = {
          courseId: id!,
          lessonTitle: noteForm.lessonTitle.trim(),
          markdownContent: noteForm.markdownContent,
          sectionTitle: sectionClean,
          videoTimestamp: timestampClean,
          directUrl: directUrlClean,
          tags: tagsClean,
        };
        const newNote = await noteService.createNote(payload);
        toast.success('Nota registrada en el curso', {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        });
        setSelectedNote(newNote);
      }

      setIsNoteModalOpen(false);
      await loadCourseData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Error al guardar la nota';
      toast.error(msg);
    }
  };

  const handleToggleLessonComplete = async () => {
    if (!course) return;
    const isIncrementing = course.completedLessons < course.totalLessons;
    const newCompleted = isIncrementing ? course.completedLessons + 1 : Math.max(0, course.completedLessons - 1);
    const newStatus = newCompleted === course.totalLessons && course.totalLessons > 0 ? 'Completed' : 'In Progress';

    try {
      await courseService.updateCourse(course.id, {
        title: course.title,
        platform: course.platform,
        instructor: course.instructor,
        courseUrl: course.courseUrl,
        totalChapters: course.totalChapters,
        currentChapter: course.currentChapter,
        totalLessons: course.totalLessons,
        completedLessons: newCompleted,
        status: newStatus,
        certificateUrl: course.certificateUrl,
      });

      setCourse({
        ...course,
        completedLessons: newCompleted,
        status: newStatus,
        progressPercentage: course.totalLessons > 0 ? Math.round((newCompleted / course.totalLessons) * 100) : 0,
      });

      toast.success(`Lección marcada (${newCompleted}/${course.totalLessons})`);
    } catch (err) {
      toast.error('Error al actualizar avance');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('¿Deseas eliminar esta nota?')) {
      try {
        await noteService.deleteNote(noteId);
        toast.success('Nota eliminada');
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
        }
        loadCourseData();
      } catch (err) {
        toast.error('Error al eliminar la nota');
      }
    }
  };

  const handleExportMarkdown = async () => {
    if (!course) return;
    try {
      await courseService.exportCourseMarkdown(course.id, course.title);
      toast.success('Archivo Markdown exportado correctamente', {
        icon: <Download className="w-4 h-4 text-cyanAccent" />,
      });
    } catch (err) {
      toast.error('Error al exportar las notas del curso');
    }
  };

  if (loading || !course) {
    return (
      <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted font-mono text-sm">
        Cargando la sala de estudio de DevKeep...
      </div>
    );
  }

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5270';
  const certFullUrl = course.certificateUrl?.startsWith('http')
    ? course.certificateUrl
    : `${apiBase}${course.certificateUrl}`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dark-border">
        <div>
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-1.5 text-xs text-dark-textMuted hover:text-cyanAccent transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 text-xs font-semibold transition-colors btn-action-icon"
              title="Ver o descargar certificado de finalización"
            >
              <Award className="w-4 h-4" />
              <span>Ver Certificado</span>
            </a>
          )}

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-dark-surface border border-dark-border hover:bg-dark-border text-dark-textMain text-xs font-medium transition-colors btn-action-icon"
            title="Exportar todas las notas del curso en archivo .md"
          >
            <Download className="w-4 h-4 text-cyanAccent" />
            <span>Exportar Markdown</span>
          </button>

          <button
            onClick={handleOpenCreateNoteModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyanAccent text-dark-bg font-semibold text-xs hover:bg-cyanAccent-hover transition-colors shadow-lg shadow-cyanAccent/20 btn-action-icon"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Nota</span>
          </button>
        </div>
      </div>

      {/* Progress & Study Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Modules / Notes List & Interactive Checkbox */}
        <div className="space-y-4">
          {/* Progress Card */}
          <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-dark-textMuted">Avance del Curso</span>
              <span className="text-cyanAccent font-bold">{course.progressPercentage}%</span>
            </div>
            <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${course.status === 'Completed' ? 'bg-emerald-400' : 'bg-cyanAccent'
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
              <button
                onClick={handleToggleLessonComplete}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyanAccent/10 text-cyanAccent border border-cyanAccent/20 hover:bg-cyanAccent/20 text-xs font-medium transition-colors btn-action-icon"
                title="Marcar avance de lección"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar Lección</span>
              </button>
            </div>
          </div>

          {/* Notes Navigation List */}
          <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-3">
            <div className="flex items-center justify-between border-b border-dark-border pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-textMuted flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyanAccent" />
                <span>Notas de Lecciones ({course.notes?.length || 0})</span>
              </h3>
            </div>

            {course.notes && course.notes.length > 0 ? (
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {course.notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${selectedNote?.id === note.id
                        ? 'bg-cyanAccent/10 border-cyanAccent/40 text-dark-textMain'
                        : 'bg-dark-surface border-dark-border hover:border-dark-borderHover text-dark-textMuted hover:text-dark-textMain'
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
        </div>

        {/* Right Column: Markdown Reader / Editor View */}
        <div className="lg:col-span-2 space-y-4">
          {selectedNote ? (
            <div className="p-6 rounded-xl bg-dark-card border border-dark-border space-y-6">
              {/* Note Metadata Header */}
              <div className="flex items-start justify-between border-b border-dark-border pb-4">
                <div>
                  {selectedNote.sectionTitle && (
                    <span className="text-xs font-mono text-cyanAccent uppercase tracking-wider">
                      Módulo: {selectedNote.sectionTitle}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-dark-textMain mt-1">{selectedNote.lessonTitle}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-dark-textMuted">
                    {selectedNote.videoTimestamp && (
                      <span className="flex items-center gap-1 font-mono text-cyan-300 bg-dark-surface px-2 py-0.5 rounded border border-dark-border">
                        <Clock className="w-3.5 h-3.5" />
                        {selectedNote.videoTimestamp}
                      </span>
                    )}
                    {selectedNote.directUrl && (
                      <a
                        href={selectedNote.directUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyanAccent hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Enlace directo</span>
                      </a>
                    )}
                    {selectedNote.tags && (
                      <span className="flex items-center gap-1 text-dark-textMuted">
                        <Tag className="w-3.5 h-3.5 text-indigoAccent-light" />
                        <code>{selectedNote.tags}</code>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditNoteModal(selectedNote)}
                    className="p-2 rounded-lg hover:bg-cyanAccent/10 text-dark-textMuted hover:text-cyanAccent hover:border hover:border-cyanAccent/30 transition-all btn-action-icon"
                    title="Editar esta nota"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-dark-textMuted hover:text-rose-400 hover:border hover:border-rose-500/30 transition-all btn-action-icon"
                    title="Eliminar esta nota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                  {selectedNote.markdownContent}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted text-sm">
              Selecciona una nota de la lista izquierda para visualizar su contenido Markdown.
            </div>
          )}
        </div>
      </div>

      {/* Modal Form: Add / Edit Note */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNote ? `Editar Nota "${editingNote.lessonTitle}"` : `Agregar Nota a "${course.title}"`}
      >
        <form onSubmit={handleSaveNote} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Título de la Lección *
            </label>
            <input
              type="text"
              required
              value={noteForm.lessonTitle}
              onChange={(e) => setNoteForm({ ...noteForm, lessonTitle: e.target.value })}
              placeholder="Ej: Configuración de DbContext y Npgsql PostgreSQL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Sección / Módulo
              </label>
              <input
                type="text"
                value={noteForm.sectionTitle}
                onChange={(e) => setNoteForm({ ...noteForm, sectionTitle: e.target.value })}
                placeholder="Ej: Módulo 3 - Persistencia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Marca de Tiempo (Timestamp)
              </label>
              <input
                type="text"
                value={noteForm.videoTimestamp}
                onChange={(e) => setNoteForm({ ...noteForm, videoTimestamp: e.target.value })}
                placeholder="Ej: 14:25"
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm font-mono transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Contenido Markdown *
            </label>
            <textarea
              required
              rows={8}
              value={noteForm.markdownContent}
              onChange={(e) => setNoteForm({ ...noteForm, markdownContent: e.target.value })}
              placeholder="Escribe tus notas en formato Markdown (soporta sintaxis de código, listas, fragmentos)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm font-mono leading-relaxed transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Etiquetas (Separadas por coma)
              </label>
              <input
                type="text"
                value={noteForm.tags}
                onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                placeholder="dotnet, efcore, postgresql"
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm font-mono transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Enlace Directo (Opcional)
              </label>
              <input
                type="url"
                value={noteForm.directUrl}
                onChange={(e) => setNoteForm({ ...noteForm, directUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-dark-border flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMuted hover:text-dark-textMain hover:bg-dark-border/40 hover:border-dark-borderHover font-medium text-sm transition-all active:scale-95 shadow-sm text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyanAccent text-dark-bg font-semibold text-sm hover:bg-cyanAccent-hover hover:shadow-lg hover:shadow-cyanAccent/20 transition-all active:scale-95 text-center shadow-md flex items-center justify-center gap-2"
            >
              {editingNote ? 'Guardar Cambios' : 'Guardar Nota'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
