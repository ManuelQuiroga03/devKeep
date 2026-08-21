import { apiClient } from './apiClient';
import type { Course, CreateCourseDto, UpdateCourseDto } from '../types';

export const courseService = {
  async getCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses');
    return response.data;
  },

  async getCourseById(id: string): Promise<Course> {
    const response = await apiClient.get<Course>(`/courses/${id}`);
    return response.data;
  },

  async createCourse(data: CreateCourseDto): Promise<Course> {
    const response = await apiClient.post<Course>('/courses', data);
    return response.data;
  },

  async updateCourse(id: string, data: UpdateCourseDto): Promise<void> {
    await apiClient.put(`/courses/${id}`, data);
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  },

  async uploadCertificate(id: string, file: File): Promise<{ message: string; certificateUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ message: string; certificateUrl: string }>(
      `/courses/${id}/certificate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async exportCourseMarkdown(id: string, title: string): Promise<void> {
    const response = await apiClient.get(`/courses/${id}/export-markdown`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `${sanitizedTitle}_Notes.md`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
