import { Pressable, Text, TextInput, View } from "react-native";

const PRESETS = [50, 100, 150, 200] as const;

interface Props {
  readonly value: number;
  readonly onChange: (grams: number) => void;
}

export default function CkdPortionSelector({ value, onChange }: Props) {
  function handlePreset(g: number) {
    onChange(g);
  }

  function handleTextChange(text: string) {
    const n = Number.parseFloat(text);
    if (!Number.isNaN(n) && n > 0 && n <= 2000) {
      onChange(Math.round(n));
    }
  }

  return (
    <View>
      <Text className="text-[#334155] text-xs tracking-[2px] mb-3">PORTION</Text>
      {/* Presets rapides */}
      <View className="flex-row gap-2 mb-3">
        {PRESETS.map((preset) => (
          <Pressable
            key={preset}
            className={`flex-1 py-2 items-center border ${
              value === preset ? "border-[#4ADE80] bg-[#4ADE8015]" : "border-[#1E293B] bg-[#0F172A]"
            }`}
            onPress={() => handlePreset(preset)}
          >
            <Text
              className={`text-xs font-bold ${
                value === preset ? "text-[#4ADE80]" : "text-[#475569]"
              }`}
            >
              {preset}g
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Saisie libre */}
      <View className="flex-row items-center bg-[#0F172A] border border-[#1E293B] px-4">
        <TextInput
          className="flex-1 text-[#F1F5F9] text-base py-3"
          value={String(value)}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          selectTextOnFocus
        />
        <Text className="text-[#475569] text-sm ml-2">grammes</Text>
      </View>
    </View>
  );
}
