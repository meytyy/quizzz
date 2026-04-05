export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // индекс правильного ответа (0-based)
  correctAnswerText?: string;
  explanation?: string;
  tags?: string[];
}

export interface QuizResult {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // в миллисекундах
}

export interface QuizStats {
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
  totalTime: number; // в миллисекундах
  averageTimePerQuestion: number; // в миллисекундах
  results: QuizResult[];
}

export type QuizMode = 'quiz' | 'results' | 'admin';

export interface CSVFormat {
  type: 'standard' | 'alternative' | 'simple' | 'custom';
  headers: string[];
}




