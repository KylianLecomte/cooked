import { Text, View } from "react-native";
import Card from "@/components/Card";

// Stub P1 — implémentation complète en P3 (Journal Alimentaire)
export default function JournalScreen() {
  return (
    <View className="flex-1 bg-bg items-center justify-center">
      <Text className="text-tm text-xl font-bold">Journal</Text>
      <Card title="Titre de la carte"></Card>
    </View>
  );
}
