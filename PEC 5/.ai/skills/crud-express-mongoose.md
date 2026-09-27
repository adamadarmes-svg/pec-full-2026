# Skill: CRUD con Express 5 + Mongoose 9

## Cuándo usarla
Al crear una entidad nueva con sus 5 operaciones (listar, obtener, crear, actualizar, eliminar).

## Prompt reutilizable
```
Contexto: [pegar AGENTS.md]
Entidad: [nombre] con campos: [tabla campo | tipo | reglas].
Genera, en archivos separados y con ES Modules:
1. models/[Entidad].js con validaciones y mensajes en español, timestamps, versionKey:false
   y toJSON que exponga "id" en lugar de "_id".
2. controllers/[entidad].controller.js: list (con filtros por query), getById, create,
   update, remove. Lista blanca de campos permitidos. Sin try/catch (Express 5).
   update con { returnDocument: 'after', runValidators: true }.
3. routes/[entidad].routes.js: rutas fijas antes que /:id y validateObjectId en las de :id.
Respuestas: éxito { data, message? }, error lanzando HttpError(status, mensaje).
Al final, explica cada archivo en 2 líneas y dime qué casos de error cubre.
```

## Checklist de revisión
- [ ] `required`, `min`/`max`, `enum` con mensajes legibles.
- [ ] `pickAllowed()` en create y update.
- [ ] `runValidators: true` en update (sin esto, un PUT puede guardar datos inválidos).
- [ ] 404 cuando `findById*` devuelve `null`.
- [ ] `/meta` declarada antes de `/:id`.
