import Papa from 'papaparse';
import { Question } from '../types';

/**
 * Парсит CSV файл и преобразует его в массив вопросов
 */
export function parseCSV(csvContent: string): Question[] {
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors && result.errors.length > 0) {
    throw new Error(`Ошибка парсинга CSV: ${result.errors.map((e: any) => e.message).join(', ')}`);
  }

  const data = result.data as any[];
  const questions: Question[] = [];

  data.forEach((row, index) => {
    try {
      const question = parseRow(row, index + 1);
      if (question) {
        questions.push(question);
      }
    } catch (error) {
      console.warn(`Ошибка при парсинге строки ${index + 1}:`, error);
    }
  });

  if (questions.length === 0) {
    throw new Error('CSV файл не содержит валидных вопросов');
  }

  // Перемешиваем вопросы
  const shuffledQuestions = shuffleArray(questions);
  
  // Перемешиваем варианты ответов для каждого вопроса и обновляем ID
  const finalQuestions = shuffledQuestions.map((question, index) => {
    // Перемешиваем варианты ответов
    const shuffledOptions = shuffleArray([...question.options]);
    // Находим новый индекс правильного ответа
    // Используем correctAnswerText если есть, иначе берем из options по индексу
    const correctAnswerText = question.correctAnswerText || question.options[question.correctAnswer];
    const newCorrectAnswer = shuffledOptions.findIndex(opt => 
      opt === correctAnswerText || 
      opt.toLowerCase().includes(correctAnswerText.toLowerCase()) ||
      correctAnswerText.toLowerCase().includes(opt.toLowerCase())
    );
    
    return {
      ...question,
      id: index + 1, // Обновляем ID после перемешивания
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer >= 0 ? newCorrectAnswer : 0,
    };
  });

  return finalQuestions;
}

/**
 * Парсит одну строку CSV в вопрос
 */
function parseRow(row: any, id: number): Question | null {
  const headers = Object.keys(row).map(h => h.toLowerCase().trim());

  // Вариант A: question, option1, option2, option3, option4, answer
  if (hasColumns(headers, ['question', 'option1', 'option2', 'option3', 'option4', 'answer'])) {
    return parseStandardFormat(row, id);
  }

  // Вариант B: question, correct, wrong1, wrong2, wrong3
  if (hasColumns(headers, ['question', 'correct', 'wrong1', 'wrong2', 'wrong3'])) {
    return parseAlternativeFormat(row, id);
  }

  // Вариант с Options (наш случай): Question, Options, Correct_Letter, Correct_Answer
  if (hasColumns(headers, ['question', 'options', 'correct_letter', 'correct_answer'])) {
    return parseOptionsFormat(row, id);
  }

  // Простой формат: question, answer (2 колонки)
  if (headers.length === 2 && headers.includes('question') && headers.includes('answer')) {
    return parseSimpleFormat(row, id);
  }

  // Попытка автоматического определения формата
  return parseAutoFormat(row, headers, id);
}

function hasColumns(headers: string[], required: string[]): boolean {
  return required.every(col => headers.some(h => h.includes(col)));
}

function parseStandardFormat(row: any, id: number): Question {
  const question = row.question || row.Question || '';
  const options = [
    row.option1 || row.Option1 || '',
    row.option2 || row.Option2 || '',
    row.option3 || row.Option3 || '',
    row.option4 || row.Option4 || '',
  ].filter(opt => opt);

  let correctAnswer = 0;
  const answer = String(row.answer || row.Answer || '').trim();

  // Попытка определить правильный ответ
  if (!isNaN(Number(answer))) {
    correctAnswer = Number(answer) - 1; // если это число (1-based), переводим в 0-based
  } else {
    // Ищем по тексту
    const answerIndex = options.findIndex(opt => 
      opt.toLowerCase().includes(answer.toLowerCase()) || 
      answer.toLowerCase().includes(opt.toLowerCase())
    );
    if (answerIndex >= 0) {
      correctAnswer = answerIndex;
    }
  }

  // Сохраняем текст правильного ответа для последующего перемешивания
  const correctAnswerText = options[correctAnswer] || answer;

  return {
    id,
    question,
    options,
    correctAnswer,
    correctAnswerText,
    explanation: row.explanation || row.Explanation || undefined,
    tags: row.tags || row.Tags ? String(row.tags || row.Tags).split(',').map((t: string) => t.trim()) : undefined,
  };
}

function parseAlternativeFormat(row: any, id: number): Question {
  const question = row.question || row.Question || '';
  const correct = row.correct || row.Correct || '';
  const wrong1 = row.wrong1 || row.Wrong1 || '';
  const wrong2 = row.wrong2 || row.Wrong2 || '';
  const wrong3 = row.wrong3 || row.Wrong3 || '';

  // Перемешиваем варианты, но запоминаем правильный
  const allOptions = [correct, wrong1, wrong2, wrong3].filter(opt => opt);
  const shuffled = shuffleArray([...allOptions]);
  const correctAnswer = shuffled.findIndex(opt => opt === correct);

  return {
    id,
    question,
    options: shuffled,
    correctAnswer: correctAnswer >= 0 ? correctAnswer : 0,
    correctAnswerText: correct, // Сохраняем для последующего перемешивания
    explanation: row.explanation || row.Explanation || undefined,
    tags: row.tags || row.Tags ? String(row.tags || row.Tags).split(',').map((t: string) => t.trim()) : undefined,
  };
}

function parseOptionsFormat(row: any, id: number): Question {
  const question = row.question || row.Question || '';
  const optionsStr = row.options || row.Options || '';
  const correctLetter = String(row.correct_letter || row.Correct_Letter || '').trim().toUpperCase();
  const correctAnswerText = row.correct_answer || row.Correct_Answer || '';

  // Парсим варианты из строки (разделены через |)
  const options = optionsStr
    .split('|')
    .map((opt: string) => {
      // Убираем пробелы
      let cleaned = opt.trim();
      // Убираем префикс буквы (A), B), C), D), E))
      cleaned = cleaned.replace(/^[A-E]\)\s*/, '').trim();
      return cleaned;
    })
    .filter((opt: string) => opt && opt.length > 0);

  // Определяем правильный ответ по букве (до перемешивания)
  let correctAnswer = 0;
  const letterMap: { [key: string]: number } = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
  if (correctLetter && letterMap[correctLetter] !== undefined) {
    correctAnswer = letterMap[correctLetter];
    if (correctAnswer >= options.length) {
      correctAnswer = 0; // fallback
    }
  } else {
    // Пытаемся найти по тексту
    const answerIndex = options.findIndex((opt: string) => 
      opt.toLowerCase().includes(correctAnswerText.toLowerCase()) ||
      correctAnswerText.toLowerCase().includes(opt.toLowerCase())
    );
    if (answerIndex >= 0) {
      correctAnswer = answerIndex;
    }
  }

  // Сохраняем текст правильного ответа для последующего перемешивания
  const correctText = options[correctAnswer] || correctAnswerText;

  return {
    id,
    question,
    options,
    correctAnswer,
    correctAnswerText: correctText,
    explanation: row.explanation || row.Explanation || undefined,
    tags: row.tags || row.Tags ? String(row.tags || row.Tags).split(',').map((t: string) => t.trim()) : undefined,
  };
}

function parseSimpleFormat(row: any, id: number): Question {
  const question = row.question || row.Question || '';
  const answer = row.answer || row.Answer || '';

  // Генерируем 3 случайных варианта
  const fakeOptions = generateFakeOptions(answer);
  const allOptions = [answer, ...fakeOptions];
  const shuffled = shuffleArray([...allOptions]);
  const correctAnswer = shuffled.findIndex(opt => opt === answer);

  return {
    id,
    question,
    options: shuffled,
    correctAnswer: correctAnswer >= 0 ? correctAnswer : 0,
    correctAnswerText: answer, // Сохраняем для последующего перемешивания
    explanation: row.explanation || row.Explanation || undefined,
    tags: row.tags || row.Tags ? String(row.tags || row.Tags).split(',').map((t: string) => t.trim()) : undefined,
  };
}

function parseAutoFormat(row: any, headers: string[], id: number): Question | null {
  // Ищем колонку с вопросом
  const questionKey = headers.find(h => h.includes('question') || h.includes('вопрос'));
  if (!questionKey) return null;

  const question = row[questionKey] || '';

  // Ищем колонки с вариантами
  const optionKeys = headers.filter(h => 
    h.includes('option') || 
    h.includes('вариант') || 
    h.includes('choice') ||
    h.match(/^[a-e]\)?$/i)
  );

  if (optionKeys.length >= 2) {
    const options = optionKeys
      .map(key => row[key])
      .filter(opt => opt && String(opt).trim());

    // Ищем правильный ответ
    const answerKey = headers.find(h => 
      h.includes('answer') || 
      h.includes('correct') || 
      h.includes('ответ') ||
      h.includes('правильный')
    );

    let correctAnswer = 0;
    let answerText = '';
    if (answerKey) {
      const answer = String(row[answerKey] || '').trim();
      answerText = answer;
      if (!isNaN(Number(answer))) {
        correctAnswer = Number(answer) - 1;
      } else {
        const answerIndex = options.findIndex(opt => 
          String(opt).toLowerCase().includes(answer.toLowerCase())
        );
        if (answerIndex >= 0) {
          correctAnswer = answerIndex;
        }
      }
    }

    return {
      id,
      question,
      options,
      correctAnswer,
      correctAnswerText: options[correctAnswer] || answerText || undefined,
      explanation: row.explanation || row.Explanation || undefined,
      tags: row.tags || row.Tags ? String(row.tags || row.Tags).split(',').map((t: string) => t.trim()) : undefined,
    };
  }

  return null;
}

function generateFakeOptions(_correctAnswer: string): string[] {
  // Простые варианты для генерации
  const commonAnswers = [
    'Неверный вариант 1',
    'Неверный вариант 2',
    'Неверный вариант 3',
    'Другой ответ',
    'Альтернативный вариант',
  ];
  
  // Берем случайные варианты, исключая правильный
  const shuffled = shuffleArray([...commonAnswers]);
  return shuffled.slice(0, 3);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Экспортирует вопросы в CSV формат
 */
export function exportToCSV(questions: Question[]): string {
  const rows = questions.map(q => ({
    Question: q.question,
    Options: q.options.join(' | '),
    Correct_Letter: String.fromCharCode(65 + q.correctAnswer), // A, B, C, D, E
    Correct_Answer: q.correctAnswerText || q.options[q.correctAnswer] || '',
    Explanation: q.explanation || '',
    Tags: q.tags?.join(', ') || '',
  }));

  return Papa.unparse(rows, {
    header: true,
  });
}

/**
 * Загружает CSV файл из URL или локального пути
 */
export async function loadCSVFromPath(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Не удалось загрузить файл: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Ошибка загрузки CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

