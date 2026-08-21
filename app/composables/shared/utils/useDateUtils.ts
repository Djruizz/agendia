export const useDateUtils = () => {
  const { hour12 } = useTimeFormat();
  const { formatDate, formatTime, weeksSince, isWeeksOrMoreAgo, localDayKey } =
    DateUtils();

  const reactiveFormatTime = (
    value: string | number | Date,
    options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" },
  ) => formatTime(value, { hour12: hour12.value, ...options });

  return {
    formatDate,
    formatTime: reactiveFormatTime,
    weeksSince,
    isWeeksOrMoreAgo,
    localDayKey,
  };
};