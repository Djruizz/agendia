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

  const formatCurrency = (value: number | null | undefined) =>
    formatter.format(value ?? 0);

  return {
    formatCurrency,
  };
};