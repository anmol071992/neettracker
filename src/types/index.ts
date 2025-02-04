// Existing types...

export interface ChapterScore {
  chapterId: string;
  score: number;
  totalMarks: number;
}

export interface SubjectScore {
  subjectId: string;
  score: number;
  totalMarks: number;
  chapterScores?: ChapterScore[];
}

export interface TestScore {
  id: string;
  date: string;
  type: 'subject' | 'full';
  scores: SubjectScore[];
  remarks?: string;
  weakAreas?: string[];
  strongAreas?: string[];
}

export interface TestScoreFormData {
  type: 'subject' | 'full';
  scores: SubjectScore[];
  remarks?: string;
}

export interface TestAnalytics {
  overallPerformance: number;
  subjectPerformance: {
    [key: string]: {
      average: number;
      trend: 'up' | 'down' | 'stable';
      weakChapters: string[];
      strongChapters: string[];
    };
  };
  recentScores: TestScore[];
  performanceByChapter: {
    [key: string]: {
      chapterId: string;
      average: number;
      attempts: number;
    };
  };
}