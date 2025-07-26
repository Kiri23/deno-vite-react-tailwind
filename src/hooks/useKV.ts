import React, { useSyncExternalStore } from "react";
import { kvStore } from "../lib/kvStore.ts";

// Detectar si estamos en entorno Deno
const isDeno = typeof Deno !== "undefined";

/**
 * Hook para suscribirse a cambios en Deno KV usando useSyncExternalStore
 * @param key - Clave de KV a observar
 * @returns Valor actual de la clave o null si no existe
 */
export function useKV<T>(key: Deno.KvKey): T | null {
  // Si no estamos en Deno, retornar null y mostrar warning
  if (!isDeno) {
    React.useEffect(() => {
      console.warn(
        "useKV: Deno KV is only available in Deno runtime environment. Running in browser mode.",
      );
    }, []);
    return null;
  }

  const store = kvStore.getStore<T>(key);

  // Inicializar el store si es necesario
  React.useEffect(() => {
    store.initialize().catch(console.error);
  }, [store]);

  return useSyncExternalStore(
    // subscribe function
    (callback) => {
      return store.subscribe(callback);
    },
    // getSnapshot function
    () => store.getValue(),
    // getServerSnapshot function (para SSR)
    () => null,
  );
}
