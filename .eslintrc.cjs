module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "env": {
        "node": true,
        "es6": true
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "allowImportExportEverywhere": true
    },
    "ignorePatterns": [
        "node_modules/"
    ],
    "rules": {
        "semi": ["error", "never"],
        "indent": ["error", 4, { "VariableDeclarator": 4, "flatTernaryExpressions": true }],
        "comma-dangle": ["error", "never"],
        "space-in-parens": ["error", "never"],

        "space-before-blocks": "error",
        "keyword-spacing": ["error", { "before": true }],
        "space-before-function-paren": ["error", "never"],
        "no-undef": "error",
        "no-unused-vars": "error",
        "no-unreachable": "error",
        "eqeqeq": "error",
        "no-empty": "error",
        "no-empty-function": "error",
        "no-const-assign": "error",
        "no-dupe-args": "error",
        "no-duplicate-imports": "error",
        "no-multi-spaces": "error",
        "arrow-spacing": "error",
        "block-spacing": "error"
    }
}