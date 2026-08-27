import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle2, Upload, Award, Clock } from 'lucide-react';
import { courseService } from '../services/courseService';
import type { Course, CreateCourseDto, UpdateCourseDto } from '../types';
import { Modal } from '../components/Modal';
import { CourseCard } from '../components/course/CourseCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const CoursesPage: React.FC = () => {
  const { isAdmin } = useAuth();
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
        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyanAccent text-dark-bg font-semibold text-sm hover:bg-cyanAccent-hover hover:shadow-lg hover:shadow-cyanAccent/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Registrar Curso</span>
          </button>
        )}
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
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteCourse}
            />
          ))}
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Plataforma *
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm cursor-pointer transition-all"
              >
                <option value="Udemy" className="bg-[#0f172a] text-[#f8fafc]">Udemy</option>
                <option value="YouTube" className="bg-[#0f172a] text-[#f8fafc]">YouTube</option>
                <option value="Platzi" className="bg-[#0f172a] text-[#f8fafc]">Platzi</option>
                <option value="Doc" className="bg-[#0f172a] text-[#f8fafc]">Documentación</option>
                <option value="Libro" className="bg-[#0f172a] text-[#f8fafc]">Libro / Ebook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-textMuted uppercase tracking-wider mb-1">
                Estado Inicial *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm font-medium cursor-pointer transition-all"
              >
                <option value="Not Started" className="bg-[#0f172a] text-[#f8fafc]">Por empezar</option>
                <option value="In Progress" className="bg-[#0f172a] text-[#f8fafc]">En progreso</option>
                <option value="Completed" className="bg-[#0f172a] text-[#f8fafc]">Completado</option>
              </select>
            </div>
          </div>

          {/* Conditional Inputs: In Progress */}
          {formData.status === 'In Progress' && (
            <div className="p-4 rounded-xl bg-dark-surface/70 border border-dark-border space-y-3 shadow-inner">
              <div className="text-xs font-semibold text-cyanAccent uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Estado de Avance Actual</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-dark-textMuted mb-1">Capítulo Actual</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentChapter}
                    onChange={(e) => setFormData({ ...formData, currentChapter: parseInt(e.target.value) || 0 })}
                    placeholder="Ej. 4"
                    className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-cyanAccent focus:ring-1 focus:ring-cyanAccent/40 text-xs font-mono outline-none transition-all"
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
                    className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-cyanAccent focus:ring-1 focus:ring-cyanAccent/40 text-xs font-mono outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-dark-textMuted mb-1">Lecciones Completadas</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.completedLessons}
                    onChange={(e) => setFormData({ ...formData, completedLessons: parseInt(e.target.value) || 0 })}
                    placeholder="Ej. 24"
                    className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-cyanAccent focus:ring-1 focus:ring-cyanAccent/40 text-xs font-mono outline-none transition-all"
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
                    className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-cyanAccent focus:ring-1 focus:ring-cyanAccent/40 text-xs font-mono outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Inputs: Completed */}
          {formData.status === 'Completed' && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Curso Completado (100% Progreso)</span>
              </div>

              {/* Certificate Upload Area */}
              <div>
                <label className="block text-xs text-dark-textMuted mb-1.5">
                  Adjuntar Certificado de Finalización (.pdf, .png, .jpg, .jpeg, .webp)
                </label>

                <div className="border-2 border-dashed border-dark-border rounded-xl p-4 text-center bg-dark-bg hover:border-emerald-500/50 transition-colors">
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
                  className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-textMain focus:border-emerald-500 text-xs font-mono outline-none transition-all"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm transition-all"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-textMain focus:ring-2 focus:ring-cyanAccent/40 focus:border-cyanAccent outline-none text-sm transition-all"
            />
          </div>

          <div className="pt-4 border-t border-dark-border flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploadingCert}
              className="w-full sm:w-auto btn-primary"
            >
              {uploadingCert ? 'Guardando...' : 'Guardar Curso'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
