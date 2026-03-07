import { StyleSheet, Text, View } from "react-native";

// Écran temporaire P0 — valide que l'app démarre et qu'Expo Router fonctionne
// Les StyleSheet seront remplacés par className NativeWind une fois NativeWind installé
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>COOKED 🥗</Text>
      <Text style={styles.subtitle}>P0 — Setup OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080C10",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ADE80",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#94A3B8",
  },
});
