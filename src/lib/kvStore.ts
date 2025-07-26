/// <reference lib="deno.unstable" />

import { getKV } from "./kvClient.ts";

// Tipo para los listeners de cambios
type Listener<T> = (value: T | null) => void;

// Store para cada clave individual
class KVKeyStore<T> {
  private listeners = new Set<Listener<T>>();
  private currentValue: T | null = null;
  private watcher: ReadableStream<[Deno.KvEntryMaybe<unknown>]> | null = null;
  private isInitialized = false;

  constructor(private key: Deno.KvKey) {}

  // Inicializa el store y comienza a escuchar cambios
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const kv = await getKV();

    // Obtener valor inicial
    const result = await kv.get<T>(this.key);
    this.currentValue = result.value;

    // Comenzar a escuchar cambios
    this.watcher = kv.watch([this.key]);

    // Procesar cambios en background
    this.processChanges();

    this.isInitialized = true;
  }

  private async processChanges(): Promise<void> {
    if (!this.watcher) return;

    try {
      const reader = this.watcher.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const [entry] = value;
        // Solo procesar cambios para nuestra clave específica
        if (entry.key.length === 1 && this.keyEquals(entry.key[0], this.key)) {
          this.currentValue = entry.value as T;
          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error("Error en KV watch:", error);
    }
  }

  private keyEquals(a: unknown, b: unknown): boolean {
    if (Array.isArray(a) && Array.isArray(b)) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return a === b;
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentValue);
      } catch (error) {
        console.error("Error en listener:", error);
      }
    });
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);

    // Notificar valor actual inmediatamente
    listener(this.currentValue);

    // Retornar función de cleanup
    return () => {
      this.listeners.delete(listener);

      // Si no hay más listeners, limpiar el watcher
      if (this.listeners.size === 0) {
        this.cleanup();
      }
    };
  }

  cleanup(): void {
    if (this.watcher) {
      this.watcher = null;
    }
    this.isInitialized = false;
  }

  getValue(): T | null {
    return this.currentValue;
  }
}

// Store global que maneja múltiples claves
class KVStore {
  private stores = new Map<string, KVKeyStore<unknown>>();

  getStore<T>(key: Deno.KvKey): KVKeyStore<T> {
    const keyString = this.serializeKey(key);

    if (!this.stores.has(keyString)) {
      const store = new KVKeyStore<T>(key);
      this.stores.set(keyString, store as KVKeyStore<unknown>);
    }

    return this.stores.get(keyString) as KVKeyStore<T>;
  }

  private serializeKey(key: Deno.KvKey): string {
    return JSON.stringify(key);
  }

  // Cleanup global
  cleanup(): void {
    this.stores.forEach((store) => store.cleanup());
    this.stores.clear();
  }
}

// Instancia singleton del store global
export const kvStore = new KVStore();
