import js from '@eslint/js';
import stylisticEslint from '@stylistic/eslint-plugin';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals'

export default [
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    pluginChaiFriendly.configs.recommendedFlat,
    importPlugin.flatConfigs.recommended,
    ...pluginVueA11y.configs['flat/recommended'],
    {
        files: ['addons/**/*.{js,vue}'],
        plugins: {
            '@stylistic': stylisticEslint,
            '@stylistic/js': stylisticEslint,
            'chai-friendly': pluginChaiFriendly
        },
        rules: {
            'no-debugger': 'error',
            'no-console': 'warn',
            'vue/no-unused-vars': 'error',
            'vue/multi-word-component-names': 'warn',
            'vuejs-accessibility/alt-text': 'error',
            '@stylistic/js/object-curly-spacing': ['warn', 'always'],
            '@stylistic/js/array-bracket-spacing': ['warn', 'always'],
            'quotes': ['warn', 'single', { avoidEscape: true }],
            'import/no-unresolved': 'off',
            'import/named': 'warn',
            'import/order': ['warn', {
                groups: [
                    'builtin',
                    'external',
                    'parent',
                    'sibling',
                    'index',
                    'object'
                ],
                'newlines-between': 'always-and-inside-groups',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true
                }
            }]
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                '$': true,
                '_': true,
                'Config': true,
                'Cesium': true,
                'i18next': true,
                'mapCollection': true,
                'moduleCollection': true
            }
        }
    }
]
