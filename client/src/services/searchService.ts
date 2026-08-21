import { apiClient } from './apiClient';
import type { SearchResult } from '../types';

export const searchService = {
  async globalSearch(query: string): Promise<SearchResult> {
    if (!query || !query.trim()) {
      return {
        queryTerm: '',
        totalMatches: 0,
        courses: [],
        notes: [],
        cheatSheets: [],
      };
    }

    const response = await apiClient.get<SearchResult>(`/search?q=${encodeURIComponent(query.trim())}`);
    return response.data;
  },
};
