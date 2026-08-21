import { apiClient } from './apiClient';
import type { CourseNote, CreateNoteDto, UpdateNoteDto } from '../types';

export const noteService = {
  async getNotes(courseId?: string, tag?: string): Promise<CourseNote[]> {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (tag) params.append('tag', tag);

    const response = await apiClient.get<CourseNote[]>(`/notes?${params.toString()}`);
    return response.data;
  },

  async getNoteById(id: string): Promise<CourseNote> {
    const response = await apiClient.get<CourseNote>(`/notes/${id}`);
    return response.data;
  },

  async createNote(data: CreateNoteDto): Promise<CourseNote> {
    const response = await apiClient.post<CourseNote>('/notes', data);
    return response.data;
  },

  async updateNote(id: string, data: UpdateNoteDto): Promise<void> {
    await apiClient.put(`/notes/${id}`, data);
  },

  async deleteNote(id: string): Promise<void> {
    await apiClient.delete(`/notes/${id}`);
  },
};
