import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface WelcomeProps {
  onLoadCSV: (content: string) => void;
  error: string | null;
}

export default function Welcome({ onLoadCSV, error }: WelcomeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onLoadCSV(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.csv')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onLoadCSV(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
      <div className="text-center mb-6 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-2">
          Добро пожаловать в Quiz Flashcards!
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 px-2">
          Загрузите CSV файл с вопросами, чтобы начать тест
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Загрузка файла */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-3 sm:mb-4">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
              Загрузить файл
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Выберите CSV файл с вашего компьютера
          </p>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors cursor-pointer touch-manipulation ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
              Перетащите CSV файл сюда или нажмите для выбора
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Поддерживаемые форматы: CSV
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 sm:mt-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 sm:px-6 py-3 sm:py-4 rounded-lg">
          <p className="font-semibold mb-2 text-sm sm:text-base">Ошибка загрузки:</p>
          <p className="text-xs sm:text-sm">{error}</p>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm">
            <p className="font-semibold mb-1">Пример правильного формата CSV:</p>
            <pre className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded overflow-x-auto text-xs">
{`Question,Options,Correct_Letter,Correct_Answer
Вопрос 1?,"A) Вариант 1 | B) Вариант 2 | C) Вариант 3 | D) Вариант 4",B,Вариант 2`}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2 sm:mb-3">
          Поддерживаемые форматы CSV:
        </h3>
        <ul className="space-y-1.5 sm:space-y-2 text-blue-800 dark:text-blue-300 text-xs sm:text-sm">
          <li>• <strong>Стандартный:</strong> question, option1, option2, option3, option4, answer</li>
          <li>• <strong>Альтернативный:</strong> question, correct, wrong1, wrong2, wrong3</li>
          <li>• <strong>С Options:</strong> Question, Options, Correct_Letter, Correct_Answer</li>
          <li>• <strong>Простой:</strong> question, answer (автоматическая генерация вариантов)</li>
        </ul>
      </div>
    </div>
  );
}

