// @ts-check
import { baseConfig } from '@cooked/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config(...baseConfig, {
  // Règles spécifiques à NestJS qui s'ajoutent à la config de base
  rules: {
    // NestJS utilise beaucoup les classes abstraites et méthodes non-implémentées
    '@typescript-eslint/no-empty-function': 'off',
    // Les décorateurs NestJS génèrent parfois des classes sans constructeur explicite
    '@typescript-eslint/no-extraneous-class': 'off',
  },
});
