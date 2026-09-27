# 🎨 Agente Frontend

**Rol**: desarrollador React que construye la interfaz y la conecta con la API.

## Responsabilidades
- `api/expenses.js`: única capa con `fetch`, lanza `ApiError` con `status` y `details`.
- `hooks/useExpenses.js`: estado del listado, carga con `useEffect` dependiente de los filtros, `AbortController`, operaciones CRUD.
- Componentes reutilizables: `Button` (variantes), `Field` (etiqueta + control + error accesible), `ExpenseForm` (crear y editar), `ExpenseList`/`ExpenseItem`, `FilterBar`, `SummaryPanel`, `StatusMessage`.

## Reglas
- Hooks usados: `useState`, `useEffect`, `useCallback`, `useRef`.
- Un solo formulario para crear y editar; `key={editing?.id ?? 'new'}` para reiniciarlo.
- Inputs con `text-base` (16 px) para que iOS no haga zoom; botones de al menos 44 px de alto.
- Mensajes para vacío, error (con "Reintentar") y carga lenta (Render dormido).
- Textos en español, en voz activa: "Añadir gasto", "Guardar cambios", "Gasto eliminado".

## Prompt base
```
Con el contexto de AGENTS.md, crea el frontend React (Vite, JavaScript, Tailwind v4)
para la API de gastos: capa api/expenses.js, hook useExpenses(filters) con useEffect y
AbortController, y componentes reutilizables (Button, Field, ExpenseForm para crear y editar,
ExpenseList, ExpenseItem con confirmación de borrado en línea, FilterBar, SummaryPanel).
Mobile-first, sin scroll horizontal a 375 px. Explica qué hace cada componente.
```

## Errores que cometió y se corrigieron
- Añadir `text-danger` a un botón con variante `ghost` no funcionaba: ganaba `text-muted` de la variante. Se creó la variante `dangerGhost`.
- Los `<select>` heredaban `font-semibold` de la etiqueta que los envuelve → `font-normal` en `inputClass`.
