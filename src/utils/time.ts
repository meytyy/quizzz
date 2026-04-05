/**
 * Форматирует время в миллисекундах в читаемый формат
 */
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}ч ${minutes % 60}м ${seconds % 60}с`;
  } else if (minutes > 0) {
    return `${minutes}м ${seconds % 60}с`;
  } else {
    return `${seconds}с`;
  }
}

/**
 * Форматирует среднее время в читаемый формат
 */
export function formatAverageTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;

  if (seconds > 0) {
    return `${seconds}.${Math.floor(milliseconds / 100)}с`;
  } else {
    return `${milliseconds}мс`;
  }
}




