/// <reference lib="deno.unstable" />

// Detectar si estamos en entorno Deno
const isDeno = typeof Deno !== "undefined";

// KV Client singleton para manejar la conexión a Deno KV
let kvInstance: Deno.Kv | null = null;

export async function getKV(): Promise<Deno.Kv> {
  if (!isDeno) {
    throw new Error("Deno KV is only available in Deno runtime environment");
  }

  if (!kvInstance) {
    kvInstance = await Deno.openKv();
  }
  return kvInstance;
}

export async function closeKV(): Promise<void> {
  if (kvInstance) {
    await kvInstance.close();
    kvInstance = null;
  }
}

// Función helper para escritura directa
export async function setKV<T>(key: Deno.KvKey, value: T): Promise<void> {
  if (!isDeno) {
    console.warn(
      "setKV: Deno KV is only available in Deno runtime environment",
    );
    return;
  }

  const kv = await getKV();
  await kv.set(key, value);
}

// Función helper para lectura directa
export async function getKVValue<T>(key: Deno.KvKey): Promise<T | null> {
  if (!isDeno) {
    console.warn(
      "getKVValue: Deno KV is only available in Deno runtime environment",
    );
    return null;
  }

  const kv = await getKV();
  const result = await kv.get<T>(key);
  return result.value;
}
