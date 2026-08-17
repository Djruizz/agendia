const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

const buildIntl = (
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat =>
  new Intl.DateTimeFormat(locale, options);

export const useDateUtils = (locale = "es-AR") => {
  const formatDate = (
    value: string | number | Date,
    options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ) => buildIntl(locale, options).format(new Date(value));

  const formatTime = (
    value: string | number | Date,
    options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    },
  ) => buildIntl(locale, options).format(new Date(value));

  const weeksSince = (value: string | number | Date) => {
    const then = new Date(value).getTime();
    const now = Date.now();
    return Math.floor((now - then) / MS_PER_WEEK);
  };

  const isWeeksOrMoreAgo = (
    value: string | number | Date,
    weeks: number,
  ) => weeksSince(value) >= weeks;

  return {
    formatDate,
    formatTime,
    weeksSince,
    isWeeksOrMoreAgo,
  };
};
