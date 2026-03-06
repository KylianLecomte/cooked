module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Nouvelle fonctionnalité
        "fix", // Correction de bug
        "chore", // Tâche de maintenance (deps, config...)
        "docs", // Documentation
        "style", // Formatting, pas de changement de logique
        "refactor", // Refactoring sans ajout de feature ni fix
        "test", // Ajout ou modification de tests
        "perf", // Amélioration de performance
        "ci", // Changes CI/CD
        "build", // Changes du système de build
        "revert", // Revert d'un commit précédent
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 100],
  },
};
