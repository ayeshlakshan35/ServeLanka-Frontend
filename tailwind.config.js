{
  "extends": "expo/tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "types": ["nativewind/types"],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}

