import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, ExternalLink, Trash2, CheckCircle2, Upload, Award, 
  Clock, Edit3 
} from 'lucide-react';
import { courseService } from '../services/courseService';
import type { Course, CreateCourseDto, UpdateCourseDto } from '../types';
import { Modal } from '../components/Modal';
import { toast } from 'sonner';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);

  const [formData, setFormData] = useState<CreateCourseDto>({
    title: '',
    platform: 'Udemy',
    instructor: '',
    courseUrl: '',
    totalChapters: 0,
    currentChapter: 0,
    totalLessons: 10,
    completedLessons: 0,
    status: 'In Progress',
    certificateUrl: '',
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (err) {
      toast.error('Error al cargar la lista de cursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setSelectedFile(null);
    setFormData({
      title: '',
      platform: 'Udemy',
      instructor: '',
      courseUrl: '',
      totalChapters: 0,
      currentChapter: 0,
      totalLessons: 10,
      completedLessons: 0,
      status: 'In Progress',
      certificateUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingCourse(course);
    setSelectedFile(null);
    setFormData({
      title: course.title,
      platform: course.platform,
      instructor: course.instructor || '',
      courseUrl: course.courseUrl || '',
      totalChapters: course.totalChapters || 0,
      currentChapter: course.currentChapter || 0,
      totalLessons: course.totalLessons || 0,
      completedLessons: course.completedLessons || 0,
      status: course.status || 'In Progress',
      certificateUrl: course.certificateUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'Completed') {
      setFormData((prev) => ({
        ...prev,
        status: newStatus,
        completedLessons: prev.totalLessons > 0 ? prev.totalLessons : prev.completedLessons,
        currentChapter: prev.totalChapters > 0 ? prev.totalChapters : prev.currentChapter,
      }));
    } else if (newStatus === 'Not Started') {
      setFormData((prev) => ({
        ...prev,
        status: newStatus,
        completedLessons: 0,
        currentChapter: 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        status: newStatus,
      }));
    }
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('El título del curso es obligatorio');
      return;
    }

    try {
      setUploadingCert(true);
      let courseId = editingCourse?.id;

      // Sanitizar campos opcionales: si están vacíos o contienen solo espacios, enviar undefined
      const courseUrlClean = formData.courseUrl?.trim() ? formData.courseUrl.trim() : undefined;
      const instructorClean = formData.instructor?.trim() ? formData.instructor.trim() : undefined;
      const certUrlClean = formData.certificateUrl?.trim() ? formData.certificateUrl.trim() : undefined;

      if (editingCourse) {
        const updateDto: UpdateCourseDto = {
          title: formData.title.trim(),
          platform: formData.platform,
          instructor: instructorClean,
          courseUrl: courseUrlClean,
          totalChapters: formData.totalChapters,
          currentChapter: formData.currentChapter,
          totalLessons: formData.totalLessons,
          completedLessons: formData.status === 'Completed' ? formData.totalLessons : (formData.completedLessons || 0),
          status: formData.status,
          certificateUrl: certUrlClean,
        };
        await courseService.updateCourse(editingCourse.id, updateDto);
        toast.success('Curso actualizado correctamente');
      } else {
        const createDto: CreateCourseDto = {
          title: formData.title.trim(),
          platform: formData.platform,
          instructor: instructorClean,
          courseUrl: courseUrlClean,
          totalChapters: formData.totalChapters,
          currentChapter: formData.currentChapter,
          totalLessons: formData.totalLessons,
          completedLessons: formData.status === 'Completed' ? formData.totalLessons : (formData.completedLessons || 0),
          status: formData.status,
          certificateUrl: certUrlClean,
        };
        const newCourse = await courseService.createCourse(createDto);
        courseId = newCourse.id;
        toast.success('Curso registrado correctamente', {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        });
      }

      // Upload file if selected
      if (selectedFile && courseId) {
        try {
          await courseService.uploadCertificate(courseId, selectedFile);
          toast.success('Certificado subido correctamente', {
            icon: <Award className="w-4 h-4 text-amber-400" />,
          });
        } catch (uploadErr) {
          toast.error('Error al subir el archivo del certificado');
        }
      }

      setIsModalOpen(false);
      loadCourses();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al procesar el curso';
      toast.error(msg);
    } finally {
      setUploadingCert(false);
    }
  };

  const handleDeleteCourse = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`¿Estás seguro de eliminar el curso "${title}" y todas sus notas?`)) {
      try {
        await courseService.deleteCourse(id);
        toast.success('Curso eliminado');
        loadCourses();
      } catch (err) {
        toast.error('Error al eliminar el curso');
      }
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark-textMain tracking-tight">Cursos y Recursos</h2>
          <p className="text-sm text-dark-textMuted mt-1">
            Gestión y seguimiento de avance técnico con soporte de certificados y módulos por capítulo.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyanAccent text-dark-bg font-semibold text-sm hover:bg-cyanAccent-hover transition-colors shadow-lg shadow-cyanAccent/20"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Curso</span>
        </button>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted font-mono text-sm">
          Cargando cursos de DevKeep...
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-dark-textMuted text-sm">
          No tienes ningún curso registrado. Haz clic en &quot;Registrar Curso&quot; para comenzar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5270';
            const certFullUrl = course.certificateUrl?.startsWith('http')
              ? course.certificateUrl
              : `${apiBase}${course.certificateUrl}`;

            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="p-5 rounded-xl bg-dark-card border border-dark-border hover:border-dark-borderHover transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
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
                      <button
                        onClick={(e) => handleOpenEditModal(e, course)}
                        className="p-1.5 rounded hover:bg-dark-surface text-dark-textMuted hover:text-cyanAccent transition-colors"
                        title="Editar curso"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {course.courseUrl && (
                        <a
                          href={course.courseUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded hover:bg-dark-surface text-dark-textMuted hover:text-cyanAccent transition-colors"
                          title="Abrir enlace externo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={(e) => handleDeleteCourse(e, course.id, course.title)}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-dark-textMuted hover:text-rose-400 transition-colors"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                        className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 transition-colors font-medium"
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
                    <span>{course.completedLessons} / {course.totalLessons} lecciones</span>
                    <span className="font-semibold text-dark-textMain">{course.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        course.status === 'Completed' ? 'bg-emerald-400' : 'bg-cyanAccent'
                      }`}
                      style={{ width: `${course.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal Form: Create / Edit Course */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? `Editar Curso "${editingCourse.title}"` : 'Registrar Nuevo Curso'}
      >
        <form onSubmit={handleSubmitCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Título del Curso *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: ASP.NET Core 8 Web API & Docker Masterclass"
              className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Plataforma *
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-sm"
              >
                <option value="Udemy">Udemy</option>
                <option value="YouTube">YouTube</option>
                <option value="Platzi">Platzi</option>
                <option value="Doc">Documentación</option>
                <option value="Libro">Libro / Ebook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Estado Inicial *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-sm font-medium"
              >
                <option value="Not Started">Por empezar</option>
                <option value="In Progress">En progreso</option>
                <option value="Completed">Completado</option>
              </select>
            </div>
          </div>

          {/* Conditional Inputs: In Progress */}
          {formData.status === 'In Progress' && (
            <div className="p-3.5 rounded-lg bg-dark-surface border border-dark-border space-y-3">
              <div className="text-xs font-semibold text-cyanAccent uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Estado de Avance Actual</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-dark-textMuted mb-1">Capítulo Actual</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentChapter}
                    onChange={(e) => setFormData({ ...formData, currentChapter: parseInt(e.target.value) || 0 })}
                    placeholder="Ej. 4"
                    className="w-full px-2.5 py-1.5 rounded bg-dark-bg border border-dark-border text-dark-textMain text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-dark-textMuted mb-1">Total Capítulos</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalChapters}
                    onChange={(e) => setFormData({ ...formData, totalChapters: parseInt(e.target.value) || 0 })}
                    placeholder="Ej. 12"
                    className="w-full px-2.5 py-1.5 rounded bg-dark-bg border border-dark-border text-dark-textMain text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-dark-textMuted mb-1">Lecciones Completadas</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.completedLessons}
                    onChange={(e) => setFormData({ ...formData, completedLessons: parseInt(e.target.value) || 0 })}
                    placeholder="Ej. 24"
                    className="w-full px-2.5 py-1.5 rounded bg-dark-bg border border-dark-border text-dark-textMain text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-dark-textMuted mb-1">Total Lecciones</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalLessons}
                    onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value) || 0 })}
                    placeholder="Ej. 80"
                    className="w-full px-2.5 py-1.5 rounded bg-dark-bg border border-dark-border text-dark-textMain text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Inputs: Completed */}
          {formData.status === 'Completed' && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Curso Completado (100% Progreso)</span>
              </div>

              {/* Certificate Upload Area */}
              <div>
                <label className="block text-xs text-dark-textMuted mb-1.5">
                  Adjuntar Certificado de Finalización (.pdf, .png, .jpg, .jpeg, .webp)
                </label>

                <div className="border-2 border-dashed border-dark-border rounded-lg p-4 text-center bg-dark-bg hover:border-emerald-500/50 transition-colors">
                  <input
                    type="file"
                    id="cert-file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="cert-file" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Upload className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs text-dark-textMain font-medium">
                      {selectedFile ? selectedFile.name : 'Haz clic o arrastra tu certificado aquí'}
                    </span>
                    <span className="text-[11px] text-dark-textMuted">Formatos aceptados: PDF, PNG, JPG, WEBP</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-dark-textMuted mb-1">
                  O pega directamente la URL pública del certificado
                </label>
                <input
                  type="url"
                  value={formData.certificateUrl}
                  onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 rounded bg-dark-bg border border-dark-border text-dark-textMain text-xs font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              Instructor / Autor (Opcional)
            </label>
            <input
              type="text"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              placeholder="Ej: Fernando Herrera, Tim Corey"
              className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
              URL del Curso / Enlace (Opcional)
            </label>
            <input
              type="url"
              value={formData.courseUrl}
              onChange={(e) => setFormData({ ...formData, courseUrl: e.target.value })}
              placeholder="https://www.udemy.com/course/..."
              className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-textMain focus:border-cyanAccent outline-none text-sm"
            />
          </div>

          <div className="pt-4 border-t border-dark-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-dark-surface text-dark-textMuted hover:text-dark-textMain font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploadingCert}
              className="px-4 py-2 rounded-lg bg-cyanAccent text-dark-bg font-semibold text-sm hover:bg-cyanAccent-hover transition-colors disabled:opacity-50"
            >
              {uploadingCert ? 'Guardando...' : 'Guardar Curso'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
