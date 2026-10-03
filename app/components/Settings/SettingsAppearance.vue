<template>
  <SettingsSection
    icon="i-lucide-palette"
    title="Apariencia"
    description="Mejora la experiencia de uso de la aplicación."
  >
    <SettingsRow
      label="Color de la aplicación"
      description="Personaliza la aplicación con tu color favorito."
    >
      <SettingsColorSelect />
    </SettingsRow>
    <SettingsRow
      label="Modo de color"
      description="Claro, oscuro o del sistema."
    >
      <UColorModeSelect />
    </SettingsRow>
  </SettingsSection>
</template>
