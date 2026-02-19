# React + TypeScript + Vite

## 🚀 Instalación y uso

### Requisitos previos

- Node.js >= 18
- npm >= 9

### Instalar dependencias

```bash
npm install
```

### Iniciar en modo desarrollo

```bash
npm run dev
```

---

## 🧪 Tests

### Tests unitarios

```bash
npm run test
```

### Tests end-to-end (E2E)

```bash
npm run test:e2e
```

## Arquitectura

### Visión general de capas

```
domain/ → services/ → hooks/ → components/ → pages/
```

Cada capa tiene una única responsabilidad y solo conoce a la capa anterior.

---

### Domain (`src/features/zones/domain/`)

Es el núcleo de la aplicación. No depende de React ni de ningún servicio externo.

**`zone.ts`** define las entidades principales:

- `Zone`: representa una zona con `ambientTemp`, `setPoint` e `isOn`.
- `ZoneStatus`: unión de tipos `"OFF" | "COOLING" | "HEATING" | "COMFORT"`.
- `Group`: agrupa zonas bajo un nombre común.

**`zone-rules.ts`** contiene la lógica de negocio pura:

```ts
determineZoneStatus(zone: Zone): ZoneStatus
```

Compara `ambientTemp` vs `setPoint` para calcular el estado real de la zona.
Al ser una función pura, es trivial de testear sin mocks ni frameworks.

---

### Services (`src/features/zones/services/`)

**`InMemoryZoneRepository`** actúa como base de datos en memoria. Es un Singleton
que mantiene el estado global de zonas y grupos, e implementa un sistema
de pub/sub: los consumidores se suscriben con `subscribe(callback)` y reciben
notificaciones cada vez que el estado cambia.

También expone `simulateTempChange()`, que modifica aleatoriamente
`ambientTemp` en las zonas activas para simular variaciones ambientales en tiempo real.

**`ApiService`** simula una capa HTTP con delays artificiales (`setTimeout`).
Expone métodos como `fetchAllZones()`, `toggleZone(id)` y `toggleGroup(groupId, turnOn)`.
Internamente escribe en el repositorio, lo que dispara las notificaciones a los suscriptores.

---

### Hooks (`src/features/zones/hooks/`)

Los hooks son el **puente entre la infraestructura y la UI**. Orquestan servicios,
estado de React y lógica de dominio, y exponen hacia los componentes únicamente
lo que estos necesitan.

**`useZonesView`** es el adaptador principal de la feature. Esto es lo que hace internamente:

1. **Carga inicial optimista**: al montar, lee el estado del repositorio de forma
   sincrónica para evitar un flash de pantalla vacía, y luego lanza `fetchAllZones()`
   para confirmar los datos con el "servidor".

2. **Suscripción reactiva**: se suscribe al repositorio para recibir actualizaciones
   en tiempo real (cambios de temperatura, toggles) y actualiza el estado de React automáticamente.

3. **Enriquecimiento de zonas**: usa `determineZoneStatus` del dominio para calcular
   el estado de cada zona y expone `EnrichedZone` (`Zone & { calculatedStatus: ZoneStatus }`).

4. **Agrupación con `useMemo`**: construye un `Map<groupId, EnrichedZone[]>` para
   las zonas agrupadas y una lista separada de `orphanZones` para zonas sin grupo.

5. **Acciones estables con `useCallback`**: expone `handleToggleZone` y `handleToggleGroup`,
   que delegan en `ApiService` y cuya referencia no cambia entre renders.

**`useZoneDetail`** sigue el mismo patrón pero para una única zona identificada por `id`.
Además expone `handleSetPointUp` / `handleSetPointDown` que modifican el setpoint
directamente en el repositorio, y un flag `notFound` para el caso en que el id no exista.

---

### Components (`src/features/zones/components/`)

**`ZonesView`** es el componente UI principal. Llama a `useZonesView()` directamente
y distribuye los datos y callbacks hacia sus hijos (`ZoneGroup`, `ZoneCard`).
Gestiona los tres estados visuales de la pantalla: carga (`isLoading`),
contenido (`groups` + `orphanZones`) y estado vacío.

Los componentes hijos (`ZoneCard`, `ZoneGroup`) son **puramente presentacionales**:
reciben datos y callbacks por props, sin conocer nada de servicios ni hooks.

---

### Pages (`src/features/zones/pages/`)

**`ZonesPage`** es un wrapper ligero cuya única responsabilidad es conectar
`ZonesView` con React Router. Cuando el usuario selecciona una zona,
`ZonesView` llama a `onNavigateZone(id)` y `ZonesPage` traduce ese evento
en una navegación hacia la ruta correspondiente.

**`ZoneDetailPage`** hace lo mismo para el detalle: obtiene el `id` de los
params de la URL y se lo pasa a `useZoneDetail`.
