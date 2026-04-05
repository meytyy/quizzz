import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Question, QuizStats, QuizResult } from '../types';
import { saveProgress, loadProgress } from '../utils/storage';

interface QuizProps {
  questions: Question[];
  onComplete: (stats: QuizStats) => void;
  onQuestionsChange: (questions: Question[]) => void;
}

export default function Quiz({ questions, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(new Map());
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const questionTimesRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    // Загружаем сохраненный прогресс
    const saved = loadProgress();
    if (saved) {
      setCurrentIndex(saved.questionIndex);
      setSelectedAnswers(saved.selectedAnswers);
    }
  }, []);

  useEffect(() => {
    // Сохраняем прогресс при изменении
    saveProgress(currentIndex, selectedAnswers);
  }, [currentIndex, selectedAnswers]);

  useEffect(() => {
    // Обновляем время начала вопроса
    setQuestionStartTime(Date.now());
    setShowExplanation(false);
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = selectedAnswers.get(currentIndex);
  const isAnswered = selectedAnswer !== undefined;

  const handleSelectAnswer = (optionIndex: number) => {
    if (isAnswered) return; // Не позволяем менять ответ после выбора

    const newSelected = new Map(selectedAnswers);
    newSelected.set(currentIndex, optionIndex);
    setSelectedAnswers(newSelected);

    // Сохраняем время, потраченное на вопрос
    const timeSpent = Date.now() - questionStartTime;
    questionTimesRef.current.set(currentIndex, timeSpent);

    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    // Вычисляем статистику
    const results: QuizResult[] = [];
    let correct = 0;

    questions.forEach((question, index) => {
      const selected = selectedAnswers.get(index) ?? -1;
      const isCorrect = selected === question.correctAnswer;
      if (isCorrect) correct++;

      const timeSpent = questionTimesRef.current.get(index) || 0;
      results.push({
        questionId: question.id,
        selectedAnswer: selected,
        isCorrect,
        timeSpent,
      });
    });

    const totalTime = Date.now() - startTime;
    const averageTime = results.length > 0 
      ? results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length 
      : 0;

    const stats: QuizStats = {
      total: questions.length,
      correct,
      incorrect: questions.length - correct,
      percentage: Math.round((correct / questions.length) * 100),
      totalTime,
      averageTimePerQuestion: averageTime,
      results,
    };

    onComplete(stats);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = selectedAnswers.size;

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < currentQuestion.options.length && !isAnswered) {
          handleSelectAnswer(optionIndex);
        }
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        handleNext();
      } else if (e.key === 'Enter' && currentIndex === questions.length - 1 && answeredCount === questions.length) {
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isAnswered, currentQuestion.options.length, answeredCount, questions.length]);

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Прогресс-бар */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Вопрос {currentIndex + 1} из {questions.length}
          </span>
          <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">
            Отвечено: {answeredCount} / {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
          <motion.div
            className="bg-emerald-600 h-2 sm:h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Карточка вопроса */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            {currentQuestion.question}
          </h2>

          <div className="space-y-2 sm:space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === currentQuestion.correctAnswer;
              const showResult = isAnswered && (isSelected || isCorrectOption);

              let bgColor = 'bg-gray-50 dark:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600';
              let textColor = 'text-gray-900 dark:text-gray-100';
              if (showResult) {
                if (isCorrectOption) {
                  bgColor = 'bg-emerald-500 dark:bg-emerald-600 text-white';
                  textColor = 'text-white';
                } else if (isSelected && !isCorrectOption) {
                  bgColor = 'bg-red-500 dark:bg-red-600 text-white';
                  textColor = 'text-white';
                }
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={isAnswered}
                  whileHover={!isAnswered ? { scale: 1.01 } : {}}
                  whileTap={!isAnswered ? { scale: 0.99 } : {}}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all touch-manipulation min-h-[56px] sm:min-h-[64px] ${
                    showResult
                      ? `${bgColor} border-transparent`
                      : `border-gray-200 dark:border-gray-600 ${bgColor}`
                  } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                  aria-label={`Вариант ${index + 1}: ${option}`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <span className={`font-semibold text-base sm:text-lg flex-shrink-0 ${showResult ? 'text-white' : textColor}`}>
                        {String.fromCharCode(65 + index)})
                      </span>
                      <span className={`text-sm sm:text-base break-words ${showResult ? 'text-white' : textColor}`}>{option}</span>
                    </div>
                    {showResult && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="flex-shrink-0 ml-2"
                      >
                        {isCorrectOption ? (
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {showExplanation && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Объяснение:
              </p>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Навигация */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-3 sm:px-6 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium active:bg-gray-300 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation text-sm sm:text-base"
          aria-label="Предыдущий вопрос"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Предыдущий</span>
        </button>

        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Время: </span>
          <span>{Math.floor((Date.now() - startTime) / 1000)}с</span>
        </div>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleFinish}
            disabled={answeredCount < questions.length}
            className="px-3 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation text-sm sm:text-base"
            aria-label="Завершить тест"
          >
            <span className="hidden sm:inline">Завершить</span>
            <span className="sm:hidden">Готово</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-3 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation text-sm sm:text-base"
            aria-label="Следующий вопрос"
          >
            <span className="hidden sm:inline">Следующий</span>
            <span className="sm:hidden">Далее</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Подсказка по клавиатуре */}
      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-2">
        <p className="hidden sm:block">Подсказка: используйте цифры 1-{Math.min(9, currentQuestion.options.length)} для выбора ответа, стрелки ← → для навигации</p>
        <p className="sm:hidden">Используйте цифры 1-{Math.min(9, currentQuestion.options.length)} для выбора ответа</p>
      </div>
    </div>
  );
}

