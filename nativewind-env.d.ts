/// <reference path="./node_modules/nativewind/types.d.ts" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_APP_NAME?: string;
  }
}
