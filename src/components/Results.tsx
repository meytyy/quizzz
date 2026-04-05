import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, RotateCcw, Download, Trophy } from 'lucide-react';
import { QuizStats, Question } from '../types';
import { formatTime, formatAverageTime } from '../utils/time';

interface ResultsProps {
  stats: QuizStats;
  questions: Question[];
  onRestart: () => void;
  onExportResults: () => void;
}

export default function Results({ stats, questions, onRestart, onExportResults }: ResultsProps) {
  const percentageColor = stats.percentage >= 80 
    ? 'text-emerald-600 dark:text-emerald-400' 
    : stats.percentage >= 60 
    ? 'text-yellow-600 dark:text-yellow-400' 
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Статистика */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8 border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center mb-4 sm:mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-block mb-3 sm:mb-4"
          >
            <Trophy className={`w-12 h-12 sm:w-16 sm:h-16 ${percentageColor}`} />
          </motion.div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Тест завершен!
          </h2>
          <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${percentageColor} mb-2`}>
            {stats.percentage}%
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Правильных ответов: {stats.correct} из {stats.total}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 sm:p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                Правильно
              </span>
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.correct}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 sm:p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-semibold">
                Неправильно
              </span>
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-300">
              {stats.incorrect}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-semibold">
                Время
              </span>
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-300">
              {formatTime(stats.totalTime)}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
              Среднее: {formatAverageTime(stats.averageTimePerQuestion)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            onClick={onRestart}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 touch-manipulation text-sm sm:text-base"
            aria-label="Попробовать снова"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Попробовать снова</span>
          </button>
          <button
            onClick={onExportResults}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium active:bg-gray-300 dark:active:bg-gray-600 transition-colors flex items-center space-x-2 touch-manipulation text-sm sm:text-base"
            aria-label="Экспортировать результаты"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Экспорт результатов</span>
          </button>
        </div>
      </motion.div>

      {/* Детализация по вопросам */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Детализация ответов
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {questions.map((question, index) => {
            const result = stats.results[index];
            const isCorrect = result.isCorrect;
            const selectedText = question.options[result.selectedAnswer] || 'Не отвечено';
            const correctText = question.options[question.correctAnswer];

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2 break-words">
                      {index + 1}. {question.question}
                    </p>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p>
                        <span className="font-medium">Выбранный ответ:</span>{' '}
                        <span className={`${isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'} break-words`}>
                          {selectedText}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p>
                          <span className="font-medium">Правильный ответ:</span>{' '}
                          <span className="text-emerald-700 dark:text-emerald-300 break-words">
                            {correctText}
                          </span>
                        </p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400">
                        Время: {formatAverageTime(result.timeSpent)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

