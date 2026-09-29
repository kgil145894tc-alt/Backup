declare module "firebase/auth" {
  import type { FirebaseApp } from "firebase/app";

  export * from "@firebase/auth";

  export function initializeAuth(
    app: FirebaseApp,
    deps?: {
      persistence?: unknown;
    },
  ): import("@firebase/auth").Auth;

  export function getReactNativePersistence(storage: {
    getItem: (key: string) => Promise<string | null>;
    removeItem: (key: string) => Promise<void>;
    setItem: (key: string, value: string) => Promise<void>;
  }): unknown;
}
