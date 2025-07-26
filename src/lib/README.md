# Deno KV + React Headless System

Un sistema headless y reactivo para integrar Deno KV con React usando los principios más modernos de React 18+.

## 🚀 Características

- **Hook `useKV<T>`** - Suscripción reactiva a cambios en Deno KV
- **Store Singleton** - Evita múltiples `watch()` duplicados por clave
- **useSyncExternalStore** - Usa la API más moderna de React para sincronización externa
- **TypeScript** - Tipado completo y seguro
- **Headless** - Lógica desacoplada del renderizado
- **Real-time** - Actualizaciones en tiempo real usando `kv.watch()`

## 📁 Estructura

```
src/
├── lib/
│   ├── kvClient.ts      # Cliente singleton de Deno KV
│   ├── kvStore.ts       # Store reactivo con suscripciones
│   ├── kv.ts           # Exportaciones principales
│   └── README.md       # Esta documentación
├── hooks/
│   └── useKV.ts        # Hook principal useKV
└── components/
    └── KVDemo.tsx      # Ejemplo de uso
```

## 🎯 Uso Básico

### 1. Hook useKV

```tsx
import { useKV } from '../lib/kv.ts';

function MyComponent() {
  // Suscripción reactiva a una clave
  const user = useKV<User>(["user", "123"]);
  const counter = useKV<number>(["counter"]);
  
  return (
    <div>
      <p>User: {user?.name}</p>
      <p>Counter: {counter ?? 0}</p>
    </div>
  );
}
```

### 2. Escritura Directa

```tsx
import { setKV } from '../lib/kv.ts';

const handleUpdate = async () => {
  await setKV(["user", "123"], { name: "John", email: "john@example.com" });
};
```

### 3. Cliente KV Directo

```tsx
import { getKV, getKVValue } from '../lib/kv.ts';

const kv = await getKV();
const value = await getKVValue<User>(["user", "123"]);
```

## 🔧 API Reference

### useKV<T>(key: Deno.KvKey): T | null

Hook que suscribe un componente a cambios en una clave específica de Deno KV.

**Parámetros:**
- `key`: Clave de KV (puede ser string, number, array, etc.)

**Retorna:**
- Valor actual de la clave o `null` si no existe

### setKV<T>(key: Deno.KvKey, value: T): Promise<void>

Función helper para escribir valores en Deno KV.

### getKVValue<T>(key: Deno.KvKey): Promise<T | null>

Función helper para leer valores de Deno KV.

### getKV(): Promise<Deno.Kv>

Obtiene la instancia singleton del cliente KV.

## 🏗️ Arquitectura

### Store Singleton

El sistema usa un patrón de store singleton que:

1. **Maneja una suscripción por clave** - Evita múltiples `watch()` duplicados
2. **Limpia automáticamente** - Cuando no hay más listeners, limpia el watcher
3. **Inicialización lazy** - Solo inicializa cuando se necesita
4. **Manejo de errores** - Captura y maneja errores de forma segura

### useSyncExternalStore

El hook `useKV` usa `useSyncExternalStore` que es la API recomendada de React para:

- Sincronización con stores externos
- Manejo correcto de SSR
- Optimizaciones de rendimiento automáticas
- Compatibilidad con React 18+ features

## 🔄 Flujo de Datos

1. **Componente usa `useKV`** → Se suscribe al store para una clave
2. **Store inicializa** → Abre conexión KV y comienza `watch()`
3. **Cambios en KV** → `watch()` detecta cambios y notifica listeners
4. **React re-renderiza** → `useSyncExternalStore` actualiza el componente
5. **Cleanup automático** → Cuando no hay listeners, limpia recursos

## 🛡️ Manejo de Errores

- Errores de conexión KV se capturan y loggean
- Errores en listeners no rompen el sistema
- Fallbacks para valores nulos
- Cleanup robusto de recursos

## 🚀 Ejemplo Completo

```tsx
import React, { useState } from "react";
import { useKV, setKV } from "../lib/kv.ts";

interface User {
  id: string;
  name: string;
  email: string;
}

export function UserProfile() {
  const [inputName, setInputName] = useState("");
  
  // Suscripción reactiva
  const user = useKV<User>(["user", "123"]);
  
  const handleUpdate = async () => {
    if (!inputName) return;
    
    await setKV(["user", "123"], {
      id: "123",
      name: inputName,
      email: user?.email || ""
    });
    
    setInputName("");
  };
  
  return (
    <div>
      {user ? (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      ) : (
        <p>No user found</p>
      )}
      
      <input
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
        placeholder="Enter name"
      />
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
```

## 🔧 Configuración

El sistema requiere la API inestable de Deno KV. Asegúrate de tener:

```json
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

Y en los archivos que usen KV:

```typescript
/// <reference lib="deno.unstable" />
```

## 🎯 Ventajas

- **Reactivo**: Actualizaciones automáticas en tiempo real
- **Eficiente**: Una suscripción por clave, cleanup automático
- **Type-safe**: TypeScript completo
- **Moderno**: Usa las APIs más recientes de React
- **Headless**: Lógica desacoplada del UI
- **Escalable**: Fácil de extender y mantener 