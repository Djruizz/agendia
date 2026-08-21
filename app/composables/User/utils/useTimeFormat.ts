export const useTimeFormat = () => {
  const { data } = useUserPreferences();
  const hour12 = computed<boolean>(() => data.value?.time_format === "12h");
  return { hour12 };
};