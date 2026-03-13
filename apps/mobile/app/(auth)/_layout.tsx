import { Stack } from "expo-router";

// Layout du groupe (auth) — écrans publics (login, register).
// Pas de header, fond sombre, animation slide standard.

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#080C10" },
      }}
    />
  );
}
