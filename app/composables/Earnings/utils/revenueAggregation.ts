export type EarningsGranularity = "DAY" | "MONTH" | "YEAR";

export type EarningsRow = {
  id: string;
  date: string;
  price: number | null;
};

export type EarningsBucket = {
  index: number;
  label: string;
  value: number;
  count: number;
  isCurrent: boolean;
};

export type EarningsPeriod = {
  year: number;
  month: number;
  day: number;
};

export type EarningsSummary = {
  total: number;
  count: number;
  avg: number;
};

export type EarningsHighlight = {
  index: number;
  value: number;
};

export type EarningsRange = {
  from: Date;
  to: Date;
};

export type EarningsYAxis = {
  top: number;
  ticks: number[];
};

const rowPrice = (row: EarningsRow) => row.price ?? 0;

const rowDate = (row: EarningsRow) => new Date(row.date);

export const getPeriodRange = (
  granularity: EarningsGranularity,
  period: EarningsPeriod,
): EarningsRange => {
  if (granularity === "YEAR") {
    return {
      from: new Date(period.year, 0, 1),
      to: new Date(period.year + 1, 0, 1),
    };
  }
  if (granularity === "MONTH") {
    return {
      from: new Date(period.year, period.month - 1, 1),
      to: new Date(period.year, period.month, 1),
    };
  }
  return {
    from: new Date(period.year, period.month - 1, period.day),
    to: new Date(period.year, period.month - 1, period.day + 1),
  };
};

export const getPreviousPeriod = (
  granularity: EarningsGranularity,
  period: EarningsPeriod,
): EarningsPeriod => {
  if (granularity === "YEAR") {
    return { ...period, year: period.year - 1 };
  }
  if (granularity === "MONTH") {
    if (period.month === 1) {
      return { ...period, year: period.year - 1, month: 12 };
    }
    return { ...period, month: period.month - 1 };
  }
  const previous = new Date(period.year, period.month - 1, period.day - 1);
  return {
    year: previous.getFullYear(),
    month: previous.getMonth() + 1,
    day: previous.getDate(),
  };
};

export const rowsInPeriod = (
  rows: EarningsRow[],
  range: EarningsRange,
): EarningsRow[] =>
  rows.filter((row) => {
    const date = rowDate(row);
    return date >= range.from && date < range.to;
  });

export const summarizeRows = (rows: EarningsRow[]): EarningsSummary => {
  const count = rows.length;
  const total = rows.reduce((sum, row) => sum + rowPrice(row), 0);
  return { total, count, avg: count > 0 ? total / count : 0 };
};

export const buildDailyBuckets = (
  rows: EarningsRow[],
  year: number,
  month: number,
  now = new Date(),
): EarningsBucket[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const sums = new Map<number, number>();
  const counts = new Map<number, number>();

  for (const row of rows) {
    const date = rowDate(row);
    if (date.getFullYear() === year && date.getMonth() + 1 === month) {
      const dayOfMonth = date.getDate();
      sums.set(dayOfMonth, (sums.get(dayOfMonth) ?? 0) + rowPrice(row));
      counts.set(dayOfMonth, (counts.get(dayOfMonth) ?? 0) + 1);
    }
  }

  return Array.from({ length: daysInMonth }, (_, i) => ({
    index: i + 1,
    label: String(i + 1),
    value: sums.get(i + 1) ?? 0,
    count: counts.get(i + 1) ?? 0,
    isCurrent:
      year === now.getFullYear() &&
      month === now.getMonth() + 1 &&
      i + 1 === now.getDate(),
  }));
};

export const buildMonthlyBuckets = (
  rows: EarningsRow[],
  year: number,
  now = new Date(),
): EarningsBucket[] => {
  const sums = new Map<number, number>();
  const counts = new Map<number, number>();

  for (const row of rows) {
    const date = rowDate(row);
    if (date.getFullYear() === year) {
      const monthOfYear = date.getMonth() + 1;
      sums.set(monthOfYear, (sums.get(monthOfYear) ?? 0) + rowPrice(row));
      counts.set(monthOfYear, (counts.get(monthOfYear) ?? 0) + 1);
    }
  }

  const currentYear = now.getFullYear() === year;

  return Array.from({ length: 12 }, (_, i) => ({
    index: i + 1,
    label: String(i + 1),
    value: sums.get(i + 1) ?? 0,
    count: counts.get(i + 1) ?? 0,
    isCurrent: currentYear && now.getMonth() === i,
  }));
};

export const bestDayInMonth = (
  rows: EarningsRow[],
  year: number,
  month: number,
): EarningsHighlight | null => {
  const buckets = buildDailyBuckets(rows, year, month);
  const best = buckets.reduce<EarningsBucket>(
    (top, bucket) => (bucket.value > top.value ? bucket : top),
    { index: 0, label: "", value: 0, count: 0, isCurrent: false },
  );
  return best.value > 0 ? { index: best.index, value: best.value } : null;
};

export const bestMonthInYear = (
  rows: EarningsRow[],
  year: number,
): EarningsHighlight | null => {
  const buckets = buildMonthlyBuckets(rows, year);
  const best = buckets.reduce<EarningsBucket>(
    (top, bucket) => (bucket.value > top.value ? bucket : top),
    { index: 0, label: "", value: 0, count: 0, isCurrent: false },
  );
  return best.value > 0 ? { index: best.index, value: best.value } : null;
};

const niceStep = (value: number): number => {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  const scaled = value / base;
  const nice =
    scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
  return nice * base;
};

export const buildYAxis = (max: number, intervals = 4): EarningsYAxis => {
  const step = niceStep(max / intervals);
  const top = step * intervals;
  const ticks = Array.from({ length: intervals + 1 }, (_, i) => i * step);
  return { top, ticks };
};
