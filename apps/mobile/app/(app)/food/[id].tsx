import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFoodDetail } from "../../../hooks/useFoodDetail";
import PortionSelector from "../../../components/PortionSelector";
import type { FoodDetail } from "../../../types/food";
import { CATEGORY_LABELS } from "../../../types/food";

// ── Onglet Macros ─────────────────────────────────────────────────────────────

function MacrosTab({
  food,
  quantityG,
}: {
  readonly food: FoodDetail;
  readonly quantityG: number;
}) {
  const factor = quantityG / 100;
  const kcal = Math.round(food.kcalPer100g * factor);
  const protein = (food.proteinPer100g * factor).toFixed(1);
  const carbs = (food.carbsPer100g * factor).toFixed(1);
  const fat = (food.fatPer100g * factor).toFixed(1);
  const fiber = food.fiberPer100g != null ? (food.fiberPer100g * factor).toFixed(1) : null;

  return (
    <View className="mt-4">
      {/* Calories */}
      <View className="bg-[#0F172A] border border-[#4ADE8033] p-4 mb-3 items-center">
        <Text className="text-[#334155] text-xs tracking-[2px] mb-1">CALORIES</Text>
        <Text className="text-[#4ADE80] text-5xl font-black">{kcal}</Text>
        <Text className="text-[#475569] text-sm mt-1">kcal pour {quantityG}g</Text>
      </View>

      {/* Macros */}
      <View className="bg-[#0F172A] border border-[#1E293B] p-4 mb-3">
        <Text className="text-[#334155] text-xs tracking-[2px] mb-4">MACRONUTRIMENTS</Text>
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <Text className="text-[#61DAFB] text-2xl font-black">{protein}g</Text>
            <Text className="text-[#475569] text-xs mt-1">Protéines</Text>
          </View>
          <View className="w-px bg-[#1E293B]" />
          <View className="items-center flex-1">
            <Text className="text-[#FB923C] text-2xl font-black">{carbs}g</Text>
            <Text className="text-[#475569] text-xs mt-1">Glucides</Text>
          </View>
          <View className="w-px bg-[#1E293B]" />
          <View className="items-center flex-1">
            <Text className="text-[#FACC15] text-2xl font-black">{fat}g</Text>
            <Text className="text-[#475569] text-xs mt-1">Lipides</Text>
          </View>
        </View>
        {fiber != null && (
          <View className="border-t border-[#1E293B] mt-4 pt-3 flex-row justify-between">
            <Text className="text-[#475569] text-sm">Fibres</Text>
            <Text className="text-[#CBD5E1] text-sm font-semibold">{fiber}g</Text>
          </View>
        )}
      </View>

      {/* Per 100g */}
      <View className="bg-[#0F172A] border border-[#1E293B] p-4">
        <Text className="text-[#334155] text-xs tracking-[2px] mb-3">POUR 100g</Text>
        {[
          { label: "Calories", value: `${Math.round(food.kcalPer100g)} kcal` },
          { label: "Protéines", value: `${food.proteinPer100g.toFixed(1)}g` },
          { label: "Glucides", value: `${food.carbsPer100g.toFixed(1)}g` },
          { label: "Lipides", value: `${food.fatPer100g.toFixed(1)}g` },
          ...(food.fiberPer100g != null
            ? [{ label: "Fibres", value: `${food.fiberPer100g.toFixed(1)}g` }]
            : []),
        ].map((row) => (
          <View key={row.label} className="flex-row justify-between mb-2">
            <Text className="text-[#475569] text-sm">{row.label}</Text>
            <Text className="text-[#CBD5E1] text-sm font-semibold">{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Ligne micro ───────────────────────────────────────────────────────────────

function MicroRow({ label, value, unit }: { readonly label: string; readonly value: number | null; readonly unit: string }) {
  if (value == null) return null;
  return (
    <View className="flex-row justify-between mb-2">
      <Text className="text-[#475569] text-sm">{label}</Text>
      <Text className="text-[#CBD5E1] text-sm font-semibold">
        {value < 1 ? value.toFixed(2) : value.toFixed(1)} {unit}
      </Text>
    </View>
  );
}

// ── Onglet Micronutriments ────────────────────────────────────────────────────

function MicrosTab({ food }: { readonly food: FoodDetail }) {
  return (
    <View className="mt-4">
      {!food.microDataComplete && (
        <View className="bg-[#FACC1510] border border-[#FACC1530] p-3 mb-4">
          <Text className="text-[#FACC15] text-xs">
            ⚠ Données micronutriments partielles — Open Food Facts ne fournit pas toujours les micros complets pour les produits transformés.
          </Text>
        </View>
      )}

      {/* Vitamines */}
      <View className="bg-[#0F172A] border border-[#1E293B] p-4 mb-3">
        <Text className="text-[#334155] text-xs tracking-[2px] mb-4">VITAMINES / 100g</Text>
        <MicroRow label="Vitamine A" value={food.vitA} unit="µg" />
        <MicroRow label="Vitamine B1 (thiamine)" value={food.vitB1} unit="mg" />
        <MicroRow label="Vitamine B2 (riboflavine)" value={food.vitB2} unit="mg" />
        <MicroRow label="Vitamine B3 (niacine)" value={food.vitB3} unit="mg" />
        <MicroRow label="Vitamine B5" value={food.vitB5} unit="mg" />
        <MicroRow label="Vitamine B6" value={food.vitB6} unit="mg" />
        <MicroRow label="Vitamine B9 (folate)" value={food.vitB9} unit="µg" />
        <MicroRow label="Vitamine B12" value={food.vitB12} unit="µg" />
        <MicroRow label="Vitamine C" value={food.vitC} unit="mg" />
        <MicroRow label="Vitamine D" value={food.vitD} unit="µg" />
        <MicroRow label="Vitamine E" value={food.vitE} unit="mg" />
        <MicroRow label="Vitamine K" value={food.vitK} unit="µg" />
      </View>

      {/* Minéraux */}
      <View className="bg-[#0F172A] border border-[#1E293B] p-4">
        <Text className="text-[#334155] text-xs tracking-[2px] mb-4">MINÉRAUX / 100g</Text>
        <MicroRow label="Calcium" value={food.calcium} unit="mg" />
        <MicroRow label="Fer" value={food.iron} unit="mg" />
        <MicroRow label="Magnésium" value={food.magnesium} unit="mg" />
        <MicroRow label="Potassium" value={food.potassium} unit="mg" />
        <MicroRow label="Zinc" value={food.zinc} unit="mg" />
        <MicroRow label="Phosphore" value={food.phosphorus} unit="mg" />
        <MicroRow label="Sélénium" value={food.selenium} unit="µg" />
        <MicroRow label="Sodium" value={food.sodium} unit="mg" />
        <MicroRow label="Cuivre" value={food.copper} unit="mg" />
        <MicroRow label="Manganèse" value={food.manganese} unit="mg" />
      </View>
    </View>
  );
}

// ── Écran principal ───────────────────────────────────────────────────────────

type Tab = "macros" | "micros";

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: food, isLoading, isError } = useFoodDetail(id ?? null);
  const [activeTab, setActiveTab] = useState<Tab>("macros");
  const [quantityG, setQuantityG] = useState(100);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#080C10] items-center justify-center">
        <ActivityIndicator size="small" color="#4ADE80" />
      </View>
    );
  }

  if (isError || !food) {
    return (
      <View className="flex-1 bg-[#080C10] items-center justify-center px-6">
        <Text className="text-red-400 text-sm text-center mb-4">
          Aliment introuvable.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-[#4ADE80] text-sm">← Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#080C10]" contentContainerStyle={{ padding: 24 }}>
      {/* Navigation */}
      <Pressable onPress={() => router.back()} className="mb-4 mt-4">
        <Text className="text-[#475569] text-sm">← Retour</Text>
      </Pressable>

      {/* Titre */}
      <Text className="text-[#F1F5F9] text-2xl font-black mb-1" numberOfLines={3}>
        {food.name}
      </Text>
      {food.brand && (
        <Text className="text-[#475569] text-sm mb-1">{food.brand}</Text>
      )}
      <Text className="text-[#334155] text-xs mb-6">
        {CATEGORY_LABELS[food.category]} · {food.source}
      </Text>

      {/* Sélecteur de portion */}
      <PortionSelector value={quantityG} onChange={setQuantityG} />

      {/* Onglets */}
      <View className="flex-row border-b border-[#1E293B] mb-0 mt-6">
        {(["macros", "micros"] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            className="flex-1 py-3 items-center"
            onPress={() => setActiveTab(tab)}
          >
            <Text
              className={`text-xs font-bold tracking-wider ${
                activeTab === tab ? "text-[#4ADE80]" : "text-[#334155]"
              }`}
            >
              {tab === "macros" ? "MACROS" : "MICRONUTRIMENTS"}
            </Text>
            {activeTab === tab && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4ADE80]" />
            )}
          </Pressable>
        ))}
      </View>

      {activeTab === "macros" ? (
        <MacrosTab food={food} quantityG={quantityG} />
      ) : (
        <MicrosTab food={food} />
      )}

      {/* Bouton Ajouter au journal — P3 */}
      <Pressable className="bg-[#4ADE80] py-4 items-center mt-6 mb-4">
        <Text className="text-[#080C10] font-bold text-base tracking-wider">
          AJOUTER AU JOURNAL →
        </Text>
      </Pressable>
    </ScrollView>
  );
}
