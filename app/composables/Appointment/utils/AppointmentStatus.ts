import type { AppointmentWithRelations } from "~/types/appointments";

type StatusColor =
  | "warning"
  | "info"
  | "success"
  | "error"
  | "neutral"
  | "primary";

const STATUS_META: Record<
  AppointmentWithRelations["status"],
  { label: string; color: StatusColor; icon: string }
> = {
  PENDING: {
    label: "Pendiente",
    color: "warning",
    icon: "i-lucide-clock",
  },
  CONFIRMED: {
    label: "Confirmada",
    color: "info",
    icon: "i-lucide-check",
  },
  COMPLETED: {
    label: "Completada",
    color: "success",
    icon: "i-lucide-check-check",
  },
  CANCELED: {
    label: "Cancelada",
    color: "error",
    icon: "i-lucide-x",
  },
};

export type AppointmentStatusFilter =
  | "ALL"
  | AppointmentWithRelations["status"]
  | "REAGENDADA"
  | "REMEMBER";

export const isPseudoStatus = (
  value: AppointmentStatusFilter,
): value is "REAGENDADA" | "REMEMBER" =>
  value === "REAGENDADA" || value === "REMEMBER";

export const WEEKS_FOR_REMEMBER = 3;

export const AppointmentStatus = () => {
  const { weeksSince } = DateUtils();

  const getStatusLabel = (status: AppointmentWithRelations["status"]) =>
    STATUS_META[status].label;

  const getStatusColor = (
    status: AppointmentWithRelations["status"],
  ): StatusColor => STATUS_META[status].color;

  const getStatusIcon = (status: AppointmentWithRelations["status"]) =>
    STATUS_META[status].icon;

  const canCancel = (status: AppointmentWithRelations["status"]) =>
    status === "PENDING" || status === "CONFIRMED";

  const canConfirm = (status: AppointmentWithRelations["status"]) =>
    status === "PENDING";

  const canRestore = (status: AppointmentWithRelations["status"]) =>
    status === "CANCELED";

  const isReagendada = (
    appt: Pick<AppointmentWithRelations, "status" | "followed_up">,
  ) => appt.status === "COMPLETED" && appt.followed_up === true;

  const needsFollowUp = (
    appt: Pick<AppointmentWithRelations, "status" | "followed_up" | "date">,
    weeksToFollowUp: number,
  ) =>
    appt.status === "COMPLETED" &&
    appt.followed_up === false &&
    weeksSince(appt.date) >= weeksToFollowUp;

  const matchesStatus = (
    appt: AppointmentWithRelations,
    filter: AppointmentStatusFilter,
    weeksToFollowUp: number,
  ): boolean => {
    if (filter === "ALL") return true;
    if (filter === "REAGENDADA") return isReagendada(appt);
    if (filter === "REMEMBER") return needsFollowUp(appt, weeksToFollowUp);
    return appt.status === filter;
  };

  return {
    getStatusLabel,
    getStatusColor,
    getStatusIcon,
    canCancel,
    canConfirm,
    canRestore,
    isReagendada,
    needsFollowUp,
    matchesStatus,
    isPseudoStatus,
  };
};
