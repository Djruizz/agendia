type MoneyUtilsOptions = {
  locale?: string;
  currency?: string;
};

export const MoneyUtils = (opts: MoneyUtilsOptions = {}) => {
  const config = useRuntimeConfig();
  const locale = opts.locale ?? config.public.locale;
  const currency = opts.currency ?? config.public.currency;
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });

  const compactFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  });

  const formatCurrency = (value: number | null | undefined) =>
    formatter.format(value ?? 0);

  const formatCurrencyCompact = (value: number | null | undefined) =>
    compactFormatter.format(value ?? 0);

  return {
    formatCurrency,
    formatCurrencyCompact,
  };
};