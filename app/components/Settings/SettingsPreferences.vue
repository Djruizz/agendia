<template>
  <SettingsSection
    icon="i-lucide-user-cog"
    title="Preferencias"
    description="Ajusta tus preferencias de uso en la agenda."
  >
    <SettingsRow
      label="Formato de horario"
      description="Elige el formato de horario que prefieras (12 o 24 horas)."
    >
      <SettingsTimeFormat />
    </SettingsRow>
    <SettingsRow
      label="Semanas para recordar"
      description="Cantidad de semanas para marcar citas completadas como 'para recordar'."
    >
      <SettingsWeeksFollowUp />
    </SettingsRow>
  </SettingsSection>
</template>
