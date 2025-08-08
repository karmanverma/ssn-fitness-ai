export interface Report {
  id: string;
  title: string;
  content: string; // Markdown content
  category: 'analysis' | 'summary' | 'technical' | 'business' | 'fitness' | 'project' | 'other';
  tags: string[];
  createdAt: number;
  updatedAt: number;
  status: 'generating' | 'completed' | 'error';
  metadata?: {
    wordCount: number;
    estimatedReadTime: number; // in minutes
    source: 'conversation' | 'data_analysis' | 'user_request';
  };
}

export interface ReportGenerationProgress {
  reportId: string;
  stage: 'initializing' | 'analyzing' | 'generating' | 'formatting' | 'completed';
  progress: number; // 0-100
  message: string;
}

export interface AnalysisResult {
  id: string;
  dataType: 'numerical' | 'textual' | 'mixed' | 'performance' | 'user_behavior' | 'other';
  insights: string[];
  recommendations: string[];
  summary: string;
  createdAt: number;
}