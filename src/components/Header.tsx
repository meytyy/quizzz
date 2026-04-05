import { Moon, Sun, Home, BarChart3, Settings } from 'lucide-react';
import { QuizMode } from '../types';

interface HeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  mode?: QuizMode;
  onModeChange?: (mode: QuizMode) => void;
  onExportCSV?: () => void;
  questionsCount?: number;
  onHomeClick?: () => void;
}

export default function Header({ 
  isDark, 
  onToggleDark, 
  mode, 
  onModeChange,
  onExportCSV,
  questionsCount,
  onHomeClick
}: HeaderProps) {
  const handleLogoClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 sm:space-x-4 min-w-0 hover:opacity-80 transition-opacity touch-manipulation"
            aria-label="Вернуться на главный экран"
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">Q</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                <span className="hidden sm:inline">Quiz Flashcards</span>
                <span className="sm:hidden">Quiz</span>
              </h1>
            </div>
            {questionsCount !== undefined && questionsCount > 0 && (
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline ml-2">
                {questionsCount} вопросов
              </span>
            )}
          </button>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {mode && onModeChange && (
              <>
                <button
                  onClick={() => onModeChange('quiz')}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                    mode === 'quiz'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Режим теста"
                >
                  <Home className="w-4 h-4 inline sm:mr-1" />
                  <span className="hidden sm:inline">Тест</span>
                </button>
                <button
                  onClick={() => onModeChange('results')}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                    mode === 'results'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Результаты"
                  disabled={mode !== 'results'}
                >
                  <BarChart3 className="w-4 h-4 inline sm:mr-1" />
                  <span className="hidden sm:inline">Результаты</span>
                </button>
                <button
                  onClick={() => onModeChange('admin')}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                    mode === 'admin'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Админ панель"
                >
                  <Settings className="w-4 h-4 inline sm:mr-1" />
                  <span className="hidden sm:inline">Админ</span>
                </button>
              </>
            )}
            
            {onExportCSV && questionsCount && questionsCount > 0 && (
              <button
                onClick={onExportCSV}
                className="px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation hidden sm:inline-flex items-center"
                aria-label="Экспорт CSV"
              >
                <span className="hidden md:inline">Экспорт CSV</span>
                <span className="md:hidden">CSV</span>
              </button>
            )}

            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

