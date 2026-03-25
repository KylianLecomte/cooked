import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useFoodSearch } from "../../../hooks/useFoodSearch";
import type { FoodSummary } from "../../../types/food";

// ── Debounce ──────────────────────────────────────────────────────────────────

function useSearchDebounce(delay: number) {
  const [raw, setRaw] = useState("");
  const [debounced, setDebounced] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChange = useCallback(
    (text: string) => {
      setRaw(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDebounced(text), delay);
    },
    [delay],
  );

  return { raw, debounced, onChange };
}

// ── Composant ligne aliment ───────────────────────────────────────────────────

function FoodRow({ item }: { readonly item: FoodSummary }) {
  const macroStr = `${Math.round(item.kcalPer100g)} kcal · P ${Math.round(item.proteinPer100g)}g · G ${Math.round(item.carbsPer100g)}g · L ${Math.round(item.fatPer100g)}g`;

  function handlePress() {
    router.push({ pathname: "/(app)/food/[id]", params: { id: item.id } });
  }

  return (
    <Pressable
      className="bg-[#0D1117] border border-[#1E293B] px-4 py-3 mb-2 active:border-[#4ADE8044]"
      onPress={handlePress}
    >
      <Text className="text-[#F1F5F9] text-sm font-semibold mb-1" numberOfLines={1}>
        {item.name}
      </Text>
      {Boolean(item.brand) && (
        <Text className="text-[#475569] text-xs mb-1" numberOfLines={1}>
          {item.brand}
        </Text>
      )}
      <Text className="text-[#334155] text-xs">{macroStr} / 100g</Text>
    </Pressable>
  );
}

// ── Contenu selon l'état de la recherche ─────────────────────────────────────

function SearchContent({
  debounced,
  data,
  isFetching,
  isError,
}: {
  readonly debounced: string;
  readonly data: FoodSummary[] | undefined;
  readonly isFetching: boolean;
  readonly isError: boolean;
}) {
  const showResults = debounced.trim().length >= 2;

  if (!showResults) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[#1E293B] text-5xl mb-4">⌕</Text>
        <Text className="text-[#475569] text-sm text-center">
          Tape au moins 2 caractères pour rechercher un aliment
        </Text>
        <Text className="text-[#334155] text-xs text-center mt-2">
          Sources : USDA FoodData Central + Open Food Facts
        </Text>
      </View>
    );
  }

  if (isFetching) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color="#4ADE80" />
        <Text className="text-[#334155] text-xs mt-3">Recherche en cours…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-red-400 text-sm text-center">
          Impossible de contacter le serveur. Vérifie ta connexion.
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[#475569] text-sm text-center">
          Aucun résultat pour «{debounced}»
        </Text>
        <Text className="text-[#334155] text-xs text-center mt-2">
          Essaie un autre terme ou utilise le scanner ▦
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FoodRow item={item} />}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={
        <Text className="text-[#334155] text-xs mb-3">
          {data.length} résultat{data.length > 1 ? "s" : ""}
        </Text>
      }
    />
  );
}

// ── Écran principal ───────────────────────────────────────────────────────────

export default function SearchScreen() {
  const { raw, debounced, onChange } = useSearchDebounce(300);
  const { data, isFetching, isError } = useFoodSearch(debounced);

  return (
    <View className="flex-1 bg-[#080C10]">
      {/* En-tête + SearchBar */}
      <View className="px-6 pt-14 pb-4">
        <Text className="text-[#334155] text-xs tracking-[3px] mb-4">RECHERCHE</Text>

        <View className="flex-row items-center bg-[#0F172A] border border-[#1E293B] px-4">
          <Text className="text-[#334155] mr-3 text-base">⌕</Text>
          <TextInput
            className="flex-1 text-[#F1F5F9] text-sm py-4"
            placeholder="Poulet, riz, Nutella…"
            placeholderTextColor="#334155"
            value={raw}
            onChangeText={onChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {/* Scan — P4 */}
          <Pressable className="ml-3 p-1">
            <Text className="text-[#334155] text-lg">▦</Text>
          </Pressable>
          {raw.length > 0 && (
            <Pressable className="ml-2 p-1" onPress={() => onChange("")}>
              <Text className="text-[#475569] text-sm">✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      <SearchContent debounced={debounced} data={data} isFetching={isFetching} isError={isError} />
    </View>
  );
}
