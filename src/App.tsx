import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Question, QuizMode, QuizStats } from './types';
import { parseCSV, exportToCSV } from './utils/csvParser';
import { loadQuestions, saveQuestions, clearStorage, clearProgress } from './utils/storage';
import Quiz from './components/Quiz';
import Results from './components/Results';
import Admin from './components/Admin';
import Header from './components/Header';
import Welcome from './components/Welcome';

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<QuizMode>('quiz');
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? saved === 'true' : false;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Применяем тему
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  useEffect(() => {
    // Пытаемся загрузить вопросы из localStorage
    const saved = loadQuestions();
    if (saved && saved.length > 0) {
      setQuestions(saved);
    }
  }, []);

  const handleLoadCSV = async (csvContent: string, fromFile?: boolean) => {
    setError(null);
    try {
      const parsed = parseCSV(csvContent);
      setQuestions(parsed);
      saveQuestions(parsed);
      if (!fromFile) {
        setMode('quiz');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(message);
      console.error('Ошибка загрузки CSV:', err);
    }
  };

  const handleQuizComplete = (newStats: QuizStats) => {
    setStats(newStats);
    setMode('results');
  };

  const handleExportCSV = () => {
    if (questions.length === 0) return;
    const csv = exportToCSV(questions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quiz_questions.csv';
    link.click();
  };

  const handleReset = () => {
    clearStorage();
    setQuestions([]);
    setStats(null);
    setMode('quiz');
  };

  const handleHomeClick = () => {
    // Возврат на главный экран (сброс вопросов и результатов)
    setStats(null);
    setMode('quiz');
    // Очищаем вопросы, чтобы показать Welcome экран
    setQuestions([]);
    clearStorage();
  };

  if (questions.length === 0 && mode !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header 
          isDark={isDark} 
          onToggleDark={() => setIsDark(!isDark)}
          onHomeClick={handleHomeClick}
        />
        <Welcome
          onLoadCSV={handleLoadCSV}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header 
        isDark={isDark} 
        onToggleDark={() => setIsDark(!isDark)}
        mode={mode}
        onModeChange={setMode}
        onExportCSV={handleExportCSV}
        questionsCount={questions.length}
        onHomeClick={handleHomeClick}
      />
      
      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            <p className="font-semibold">Ошибка:</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {mode === 'quiz' && questions.length > 0 && (
        <Quiz
          questions={questions}
          onComplete={handleQuizComplete}
          onQuestionsChange={setQuestions}
        />
      )}

      {mode === 'results' && stats && (
        <Results
          stats={stats}
          questions={questions}
          onRestart={() => {
            clearProgress();
            setStats(null);
            setMode('quiz');
          }}
          onExportResults={() => {
            // Экспорт результатов в CSV
            const rows = stats.results.map((result, idx) => {
              const question = questions[idx];
              return {
                'Question': question.question,
                'Selected Answer': question.options[result.selectedAnswer] || 'N/A',
                'Correct Answer': question.options[question.correctAnswer],
                'Is Correct': result.isCorrect ? 'Yes' : 'No',
                'Time Spent (ms)': result.timeSpent,
              };
            });
            const csv = Papa.unparse(rows);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
          }}
        />
      )}

      {mode === 'admin' && (
        <Admin
          questions={questions}
          onQuestionsChange={setQuestions}
          onLoadCSV={handleLoadCSV}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;

