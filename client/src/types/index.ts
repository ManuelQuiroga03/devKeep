export interface Course {
  id: string;
  title: string;
  platform: string;
  instructor?: string;
  courseUrl?: string;
  totalChapters: number;
  currentChapter: number;
  totalLessons: number;
  completedLessons: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | string;
  certificateUrl?: string;
  createdAt: string;
  notes?: CourseNote[];
  progressPercentage: number;
}

export interface CourseNote {
  id: string;
  courseId: string;
  sectionTitle?: string;
  lessonTitle: string;
  videoTimestamp?: string;
  directUrl?: string;
  markdownContent: string;
  tags: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CheatSheetItem {
  id: string;
  technology: string;
  category: string;
  command: string;
  description: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface SearchResult {
  queryTerm: string;
  totalMatches: number;
  courses: Course[];
  notes: CourseNote[];
  cheatSheets: CheatSheetItem[];
}

export interface CreateCourseDto {
  title: string;
  platform: string;
  instructor?: string;
  courseUrl?: string;
  totalChapters: number;
  currentChapter: number;
  totalLessons: number;
  completedLessons?: number;
  status: string;
  certificateUrl?: string;
}

export interface UpdateCourseDto {
  title: string;
  platform: string;
  instructor?: string;
  courseUrl?: string;
  totalChapters: number;
  currentChapter: number;
  totalLessons: number;
  completedLessons: number;
  status: string;
  certificateUrl?: string;
}

export interface CreateNoteDto {
  courseId: string;
  lessonTitle: string;
  markdownContent: string;
  sectionTitle?: string;
  videoTimestamp?: string;
  directUrl?: string;
  tags?: string;
}

export interface UpdateNoteDto {
  lessonTitle: string;
  markdownContent: string;
  sectionTitle?: string;
  videoTimestamp?: string;
  directUrl?: string;
  tags?: string;
}

export interface CreateCheatSheetDto {
  technology: string;
  category: string;
  command: string;
  description: string;
  isFavorite?: boolean;
}

export interface UpdateCheatSheetDto {
  technology: string;
  category: string;
  command: string;
  description: string;
  isFavorite: boolean;
}
