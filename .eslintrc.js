module.exports = {
  root: true,
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-tsdoc",
    "eslint-comments"
  ],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    createDefaultProgram: true,
    project: [
      "./tsconfig.json",
    ],
    tsconfigRootDir: __dirname,
    sourceType: "module"
  },
  rules: {
    "computed-property-spacing": ["error", "never"],
    "array-bracket-spacing": ["error", "never"],
    "object-curly-spacing": ["error", "never"],
    "@typescript-eslint/type-annotation-spacing": ["error", {
      before: false,
      after: true
    }],
    "space-in-parens": ["error", "never"],
    "space-before-blocks": ["error", "always"],
    "space-before-function-paren": ["error", "never"],
    "semi": [2, "always"],
    "tsdoc/syntax": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "no-else-return": "error",
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": true,
        "ts-nocheck": true,
        "ts-check": false,
        minimumDescriptionLength: 5,
      },
    ],
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    //"@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-member-accessibility": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/unbound-method": "off",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_"
      },
    ],

    // TODO - enable these new recommended rules
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
				selector: "enum",
				format: ["UPPER_CASE"]
      },
      {
				selector: "enumMember",
				format: ["UPPER_CASE"],
				leadingUnderscore: "forbid",
				trailingUnderscore: "forbid"
      },
      {
        selector: "memberLike",
        modifiers: ["private"],
        format: ["camelCase"],
        leadingUnderscore: "require"
      },
      {
        selector: "interface",
        format: ["PascalCase"],
        prefix: ["I"],
      },
      {
        selector: "variable",
        types: ["boolean"],
        format: ["PascalCase"],
        prefix: ["do", "is", "should", "has", "can", "did", "will"],
      },
    ],
    curly: "off",
    "no-mixed-operators": "error",
    "no-console": "warn",
    "no-process-exit": "error",

    "eslint-comments/disable-enable-pair": [
      "error",
      {
        allowWholeFile: true,
      },
    ],
    // disallow a eslint-enable comment for multiple eslint-disable comments
    "eslint-comments/no-aggregating-enable": "error",
    // disallow duplicate eslint-disable comments
    "eslint-comments/no-duplicate-disable": "error",
    // disallow eslint-disable comments without rule names
    "eslint-comments/no-unlimited-disable": "error",
    // disallow unused eslint-disable comments
    "eslint-comments/no-unused-disable": "error",
    // disallow unused eslint-enable comments
    "eslint-comments/no-unused-enable": "error",
    // disallow ESLint directive-comments
    "eslint-comments/no-use": [
      "error",
      {
        allow: [
          "eslint-disable",
          "eslint-disable-line",
          "eslint-disable-next-line",
          "eslint-enable",
        ],
      },
    ],
  }
};