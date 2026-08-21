export const useApplyUserPreferences = () => {
  const userPreferences = useUserPreferences();
  const appConfig = useAppConfig();

  watch(
    () => userPreferences.data.value?.color_theme,
    (theme) => {
      if (theme) appConfig.ui.colors.primary = theme;
    },
    { immediate: true },
  );
};