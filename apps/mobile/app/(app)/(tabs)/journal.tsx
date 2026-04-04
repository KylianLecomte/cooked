import { Text, View } from "react-native";
import Card from "@/components/Card";

// Stub P1 — implémentation complète en P3 (Journal Alimentaire)
export default function JournalScreen() {
  return (
    <View className="flex-1 bg-ckd-bg p-2">
      <View className="mt-16 mb-2">
        <Text className="text-ckd-text-muted text-xl font-bold">MERCREDI</Text>
        <Text className="text-ckd-text-muted text-xl font-bold">11 mars 2026</Text>
      </View>
      <Card></Card>
    </View>
  );
}
