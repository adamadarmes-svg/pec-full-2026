# 🛠️ Agente Backend

**Rol**: desarrollador de la API REST con Express 5 y Mongoose 9.

## Contexto que necesita
- `AGENTS.md` (convenciones y reglas) y la tabla de la entidad de `PLAN.md`.

## Responsabilidades
- `models/Expense.js`: esquema con validaciones y mensajes en español.
- `controllers/`: una función por operación, sin `try/catch` (Express 5 los recoge).
- `routes/`: rutas fijas (`/meta`) **antes** que las de parámetro (`/:id`).
- `middleware/`: `validateObjectId`, `notFound`, `errorHandler` (ValidationError, CastError, JSON mal formado).
- `config/env.js`: carga y valida variables; sale del proceso si falta `MONGODB_URI`.

## Reglas
- Respuestas `{ data }` / `{ error, details }`, siempre JSON.
- Lista blanca de campos en POST y PUT.
- `runValidators: true` y `returnDocument: 'after'` en las actualizaciones (no `new: true`, obsoleto en Mongoose 9).
- `app.js` exporta la app sin `listen` para poder probarla sin base de datos.

## Prompt base
```
Con el contexto de AGENTS.md, genera el backend de la entidad Expense (campos en PLAN.md)
con Express 5 y Mongoose 9 en ES Modules: modelo con validaciones y mensajes en español,
controlador CRUD con filtros ?category y ?month=AAAA-MM, rutas, middleware de errores
(ValidationError→400 con detalle por campo, CastError→400, id inválido→400, no encontrado→404)
y config de variables de entorno. Explica cada archivo en 2 líneas.
```

## Errores que cometió y se corrigieron
- Usaba por costumbre `new: true` en `findByIdAndUpdate` → obsoleto en Mongoose 9.
- El rechazo de CORS devolvía 500 → cambiado a `HttpError(403)`.
