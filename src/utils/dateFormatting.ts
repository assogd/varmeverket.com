/**
 * Utility functions for formatting dates and times
 */

/**
 * Format event date range for display
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Formatted date string
 */
export const formatEventDate = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = start.getDate();
  const startMonth = start.toLocaleDateString('sv-SE', { month: 'long' });
  const startYear = start.getFullYear();

  const endDay = end.getDate();
  const endMonth = end.toLocaleDateString('sv-SE', { month: 'long' });
  const endYear = end.getFullYear();

  // Same day
  if (start.toDateString() === end.toDateString()) {
    return `${startDay} ${startMonth} ${startYear}`;
  }

  // Same month
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${startDay}-${endDay} ${startMonth} ${startYear}`;
  }

  // Same year
  if (start.getFullYear() === end.getFullYear()) {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
  }

  // Different years
  return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
};

/**
 * Format event time range for display
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Formatted time string in 24-hour format
 */
export const formatEventTime = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startTime = start.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const endTime = end.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${startTime}–${endTime}`;
};

/**
 * Format a single date for display
 * @param date - Date string
 * @returns Formatted date string
 */
export const formatSingleDate = (date: string): string => {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('sv-SE', { month: 'short' });
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format a single time for display
 * @param date - Date string
 * @returns Formatted time string in 24-hour format
 */
export const formatSingleTime = (date: string): string => {
  const dateObj = new Date(date);

  return dateObj.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};
