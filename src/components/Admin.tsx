import { useState, useRef } from 'react';
import { Upload, Download, FileText, Edit2, Save, X, Trash2, Plus } from 'lucide-react';
import { Question } from '../types';
import { exportToCSV } from '../utils/csvParser';
import { saveQuestions } from '../utils/storage';
import Papa from 'papaparse';

interface AdminProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onLoadCSV: (content: string, fromFile?: boolean) => void;
  onReset: () => void;
}

export default function Admin({ questions, onQuestionsChange, onLoadCSV, onReset }: AdminProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onLoadCSV(content, true);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(questions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quiz_questions.csv';
    link.click();
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        Question: 'Пример вопроса?',
        Options: 'A) Вариант 1 | B) Вариант 2 | C) Вариант 3 | D) Вариант 4',
        Correct_Letter: 'B',
        Correct_Answer: 'Вариант 2',
        Explanation: 'Это правильный ответ, потому что...',
        Tags: 'тег1, тег2',
      },
    ];
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quiz_template.csv';
    link.click();
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditedQuestion({ ...question });
  };

  const handleSaveEdit = () => {
    if (!editedQuestion || !editingId) return;

    const updated = questions.map(q => 
      q.id === editingId ? editedQuestion : q
    );
    onQuestionsChange(updated);
    saveQuestions(updated);
    setEditingId(null);
    setEditedQuestion(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedQuestion(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      const updated = questions.filter(q => q.id !== id).map((q, idx) => ({
        ...q,
        id: idx + 1,
      }));
      onQuestionsChange(updated);
      saveQuestions(updated);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      question: 'Новый вопрос?',
      options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
      correctAnswer: 0,
      explanation: '',
    };
    const updated = [...questions, newQuestion];
    onQuestionsChange(updated);
    saveQuestions(updated);
    handleEdit(newQuestion);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Админ панель
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Загрузить CSV</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={handleExportCSV}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Экспорт CSV</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Скачать шаблон</span>
          </button>

          <button
            onClick={onReset}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Сбросить всё</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Всего вопросов: {questions.length}
          </p>
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Добавить вопрос</span>
          </button>
        </div>
      </div>

      {/* Список вопросов */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            {editingId === question.id && editedQuestion ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Вопрос
                  </label>
                  <input
                    type="text"
                    value={editedQuestion.question}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Варианты ответов (по одному на строку)
                  </label>
                  <textarea
                    value={editedQuestion.options.join('\n')}
                    onChange={(e) => setEditedQuestion({
                      ...editedQuestion,
                      options: e.target.value.split('\n').filter(opt => opt.trim()),
                    })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Правильный ответ (индекс, начиная с 0)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editedQuestion.options.length - 1}
                    value={editedQuestion.correctAnswer}
                    onChange={(e) => setEditedQuestion({
                      ...editedQuestion,
                      correctAnswer: parseInt(e.target.value) || 0,
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Объяснение (необязательно)
                  </label>
                  <textarea
                    value={editedQuestion.explanation || ''}
                    onChange={(e) => setEditedQuestion({
                      ...editedQuestion,
                      explanation: e.target.value || undefined,
                    })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Сохранить</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Отмена</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      {question.id}. {question.question}
                    </p>
                    <div className="space-y-1 mb-2">
                      {question.options.map((opt, idx) => (
                        <p
                          key={idx}
                          className={`text-sm ${
                            idx === question.correctAnswer
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}) {opt}
                        </p>
                      ))}
                    </div>
                    {question.explanation && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                        Объяснение: {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(question)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Редактировать</span>
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Удалить</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

