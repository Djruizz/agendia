import { WEEKS_FOR_REMEMBER } from "~/composables/Appointment/utils/AppointmentStatus";

export const useWeeksToFollowUp = () => {
  const { data } = useUserPreferences();
  const weeksToFollowUp = computed<number>(
    () => data.value?.weeks_to_follow_up ?? WEEKS_FOR_REMEMBER,
  );
  return { weeksToFollowUp };
};