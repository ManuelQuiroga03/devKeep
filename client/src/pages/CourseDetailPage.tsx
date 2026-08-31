import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { courseService } from '../services/courseService';
import { noteService } from '../services/noteService';
import type { Course, CourseNote, CreateNoteDto } from '../types';
import { CourseHeader } from '../components/course/CourseHeader';
import { ProgressBarCard } from '../components/course/ProgressBarCard';
import { NoteList } from '../components/notes/NoteList';
import { NoteReader } from '../components/notes/NoteReader';
import { NoteStudioModal } from '../components/notes/NoteStudioModal';
import { toast } from 'sonner';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedNote, setSelectedNote] = useState<CourseNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<CourseNote | null>(null);

  // Editor View Mode: 'split' (lado a lado), 'edit' (solo editor), 'preview' (solo vista previa)
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

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
    setViewMode('split');
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
    setViewMode('split');
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

  const handleIncrementChapter = async () => {
    if (!course) return;
    try {
      const updated = await courseService.incrementChapter(course.id);
      setCourse({
        ...updated,
        notes: course.notes,
      });
      toast.success(`Capítulo avanzado (${updated.currentChapter}/${updated.totalChapters})`);
    } catch (err) {
      toast.error('Error al avanzar capítulo');
    }
  };

  const handleToggleLessonComplete = async () => {
    if (!course) return;
    try {
      const updated = await courseService.incrementLesson(course.id);
      setCourse({
        ...updated,
        notes: course.notes,
      });
      toast.success(`Lección marcada (${updated.completedLessons}/${updated.totalLessons})`);
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
      toast.success('Archivo Markdown exportado correctamente');
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
      {/* Top Header Component */}
      <CourseHeader
        course={course}
        certFullUrl={certFullUrl}
        onExportMarkdown={handleExportMarkdown}
        onOpenCreateNoteModal={handleOpenCreateNoteModal}
      />

      {/* Progress & Study Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress Card & Notes Navigation List */}
        <div className="space-y-4">
          <ProgressBarCard
            course={course}
            onIncrementChapter={handleIncrementChapter}
            onToggleLessonComplete={handleToggleLessonComplete}
          />
          <NoteList
            notes={course.notes}
            selectedNote={selectedNote}
            onSelectNote={setSelectedNote}
          />
        </div>

        {/* Right Column: Markdown Reader Component */}
        <div className="lg:col-span-2 space-y-4">
          <NoteReader
            note={selectedNote}
            onEditNote={handleOpenEditNoteModal}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      </div>

      {/* Studio Modal Component */}
      <NoteStudioModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        editingNote={editingNote}
        courseTitle={course.title}
        noteForm={noteForm}
        setNoteForm={setNoteForm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSaveNote={handleSaveNote}
      />
    </div>
  );
};
