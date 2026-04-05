import { describe, it, expect } from 'vitest';
import { parseCSV, exportToCSV } from '../csvParser';
import { Question } from '../../types';

describe('CSV Parser', () => {
  describe('parseCSV', () => {
    it('should parse standard format CSV', () => {
      const csv = `question,option1,option2,option3,option4,answer
What is 2+2?,2,3,4,5,3
What is the capital?,A,B,C,D,2`;

      const questions = parseCSV(csv);
      expect(questions).toHaveLength(2);
      expect(questions[0].question).toBe('What is 2+2?');
      expect(questions[0].options).toEqual(['2', '3', '4', '5']);
      expect(questions[0].correctAnswer).toBe(2); // 0-based index
    });

    it('should parse Options format CSV', () => {
      const csv = `Question,Options,Correct_Letter,Correct_Answer
What is 2+2?,"A) 2 | B) 3 | C) 4 | D) 5",C,4`;

      const questions = parseCSV(csv);
      expect(questions).toHaveLength(1);
      expect(questions[0].question).toBe('What is 2+2?');
      expect(questions[0].options.length).toBeGreaterThan(0);
      expect(questions[0].correctAnswer).toBe(2); // C is index 2
    });

    it('should parse alternative format CSV', () => {
      const csv = `question,correct,wrong1,wrong2,wrong3
What is 2+2?,4,2,3,5`;

      const questions = parseCSV(csv);
      expect(questions).toHaveLength(1);
      expect(questions[0].options).toContain('4');
      expect(questions[0].options).toContain('2');
      expect(questions[0].options).toContain('3');
      expect(questions[0].options).toContain('5');
    });

    it('should parse simple format CSV and generate options', () => {
      const csv = `question,answer
What is 2+2?,4`;

      const questions = parseCSV(csv);
      expect(questions).toHaveLength(1);
      expect(questions[0].options.length).toBeGreaterThanOrEqual(2);
      expect(questions[0].options).toContain('4');
    });

    it('should handle CSV with explanation column', () => {
      const csv = `question,option1,option2,option3,option4,answer,explanation
What is 2+2?,2,3,4,5,3,Because 2+2 equals 4`;

      const questions = parseCSV(csv);
      expect(questions[0].explanation).toBe('Because 2+2 equals 4');
    });

    it('should throw error for invalid CSV', () => {
      const csv = `invalid,format,here`;
      expect(() => parseCSV(csv)).toThrow();
    });

    it('should handle empty CSV', () => {
      const csv = `question,option1,option2,answer`;
      expect(() => parseCSV(csv)).toThrow();
    });
  });

  describe('exportToCSV', () => {
    it('should export questions to CSV format', () => {
      const questions: Question[] = [
        {
          id: 1,
          question: 'What is 2+2?',
          options: ['2', '3', '4', '5'],
          correctAnswer: 2,
          explanation: 'Test explanation',
        },
      ];

      const csv = exportToCSV(questions);
      expect(csv).toContain('What is 2+2?');
      expect(csv).toContain('2 | 3 | 4 | 5');
      expect(csv).toContain('C'); // Correct letter
      expect(csv).toContain('4'); // Correct answer
    });

    it('should handle questions without explanation', () => {
      const questions: Question[] = [
        {
          id: 1,
          question: 'Test?',
          options: ['A', 'B'],
          correctAnswer: 0,
        },
      ];

      const csv = exportToCSV(questions);
      expect(csv).toContain('Test?');
      expect(csv).toContain('A');
    });
  });
});




