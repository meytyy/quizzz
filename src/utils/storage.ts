import { Question, QuizStats } from '../types';

const STORAGE_KEY_QUESTIONS = 'quiz_questions';
const STORAGE_KEY_PROGRESS = 'quiz_progress';
const STORAGE_KEY_STATS = 'quiz_stats';

export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
  } catch (error) {
    console.error('Ошибка сохранения вопросов:', error);
  }
}

export function loadQuestions(): Question[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Ошибка загрузки вопросов:', error);
    return null;
  }
}

export function saveProgress(questionIndex: number, selectedAnswers: Map<number, number>): void {
  try {
    const data = {
      questionIndex,
      selectedAnswers: Array.from(selectedAnswers.entries()),
    };
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
  } catch (error) {
    console.error('Ошибка сохранения прогресса:', error);
  }
}

export function loadProgress(): { questionIndex: number; selectedAnswers: Map<number, number> } | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return {
      questionIndex: parsed.questionIndex || 0,
      selectedAnswers: new Map(parsed.selectedAnswers || []),
    };
  } catch (error) {
    console.error('Ошибка загрузки прогресса:', error);
    return null;
  }
}

export function saveStats(stats: QuizStats): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Ошибка сохранения статистики:', error);
  }
}

export function loadStats(): QuizStats | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_STATS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    return null;
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
  } catch (error) {
    console.error('Ошибка очистки прогресса:', error);
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_QUESTIONS);
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    localStorage.removeItem(STORAGE_KEY_STATS);
  } catch (error) {
    console.error('Ошибка очистки хранилища:', error);
  }
}




