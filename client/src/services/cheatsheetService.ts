import { apiClient } from './apiClient';
import type { CheatSheetItem, CreateCheatSheetDto, UpdateCheatSheetDto } from '../types';

export const cheatsheetService = {
  async getCheatSheets(technology?: string, category?: string, isFavorite?: boolean): Promise<CheatSheetItem[]> {
    const params = new URLSearchParams();
    if (technology) params.append('technology', technology);
    if (category) params.append('category', category);
    if (isFavorite !== undefined && isFavorite !== null) params.append('isFavorite', isFavorite.toString());

    const response = await apiClient.get<CheatSheetItem[]>(`/cheatsheets?${params.toString()}`);
    return response.data;
  },

  async createCheatSheet(data: CreateCheatSheetDto): Promise<CheatSheetItem> {
    const response = await apiClient.post<CheatSheetItem>('/cheatsheets', data);
    return response.data;
  },

  async updateCheatSheet(id: string, data: UpdateCheatSheetDto): Promise<void> {
    await apiClient.put(`/cheatsheets/${id}`, data);
  },

  async toggleFavorite(item: CheatSheetItem): Promise<void> {
    const updateDto: UpdateCheatSheetDto = {
      technology: item.technology,
      category: item.category,
      command: item.command,
      description: item.description,
      isFavorite: !item.isFavorite,
    };
    await apiClient.put(`/cheatsheets/${item.id}`, updateDto);
  },

  async deleteCheatSheet(id: string): Promise<void> {
    await apiClient.delete(`/cheatsheets/${id}`);
  },
};
