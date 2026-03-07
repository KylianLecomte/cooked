module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: [
      // Reanimated v4 inclut worklets en interne — NE PAS ajouter react-native-worklets/plugin séparément
      "react-native-reanimated/plugin",
    ],
  };
};
