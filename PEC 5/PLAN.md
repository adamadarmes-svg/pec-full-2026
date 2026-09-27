# PLAN.md — Cuentas Claras
[Historial](#historial-del-proyecto)).

## 1. Objetivo

Construir una mini aplicación fullstack para **apuntar gastos personales y ver en qué se va el dinero**, con un CRUD completo de extremo a extremo (React → API Express → MongoDB Atlas), desplegada en Vercel y Render, y usando IA de forma crítica y documentada.

## 2. Alcance

| Dentro del alcance | Fuera del alcance (posibles mejoras) |
| --- | --- |
| CRUD completo de gastos | Usuarios y login (cada persona sus gastos) |
| Filtros por categoría y por mes (en el servidor) | Ingresos y balance |
| Resumen: total y reparto por categoría | Gráficas históricas por meses |
| Validación en cliente y en servidor | Exportar a CSV |
| Diseño responsive (móvil → escritorio) | Paginación (no hace falta con pocos datos) |
| Despliegue: Vercel (front) + Render (API) + Atlas (BD) | Tests automáticos (Vitest / Supertest) |

## 3. Entidad principal: `Expense` (gasto)

| Campo | Tipo | Reglas | Por qué |
| --- | --- | --- | --- |
| `title` | String | obligatorio, 2–80 caracteres, `trim` | Concepto que se lee en la lista |
| `amount` | Number | obligatorio, > 0, ≤ 1 000 000, redondeo a 2 decimales | Evita importes negativos y errores de coma flotante |
| `category` | String (enum) | comida, transporte, vivienda, ocio, salud, educacion, otros | Permite filtrar y agrupar en el resumen |
| `date` | Date | obligatorio, por defecto hoy | Filtro por mes |
| `paymentMethod` | String (enum) | tarjeta, efectivo, transferencia, bizum | Dato útil y realista (Bizum en España) |
| `notes` | String | opcional, máx. 300 | Contexto libre |
| `createdAt` / `updatedAt` | Date | automáticos (`timestamps`) | Auditoría básica y desempate al ordenar |

## 4. API REST

| Método | Ruta | Descripción | Respuesta OK |
| --- | --- | --- | --- |
| GET | `/api/health` | Estado de la API y de la BD | 200 |
| GET | `/api/expenses?category=&month=AAAA-MM` | Listar (con filtros opcionales) | 200 `{ data, count }` |
| GET | `/api/expenses/meta` | Categorías y métodos válidos | 200 |
| GET | `/api/expenses/:id` | Obtener uno | 200 / 404 |
| POST | `/api/expenses` | Crear | 201 |
| PUT | `/api/expenses/:id` | Actualizar | 200 / 404 |
| DELETE | `/api/expenses/:id` | Eliminar | 200 / 404 |

Errores siempre en JSON: `{ "error": "mensaje", "details": { "campo": "motivo" } }` con 400 / 403 / 404 / 500.

## 5. Fases

1. **Planificación**: idea, entidad, campos, endpoints, estructura de carpetas, archivos de IA.
2. **Backend**: modelo, controladores, rutas, middlewares de error, variables de entorno.
3. **Pruebas de API**: `.http` y colección Postman, incluidos casos de error.
4. **Frontend**: capa API, hook `useExpenses`, componentes reutilizables, formulario crear/editar.
5. **Revisión**: pruebas del flujo en navegador, revisión responsive en 375 px y 1366 px, correcciones.
6. **Documentación**: README, PLAN, AGENTS, SKILLS, TASKS, reflexión.
7. **Despliegue**: atlas, render, vercel, actualizar cors, prueba en producción.

## 6. Decisiones principales

| # | Decisión | Alternativa descartada | Motivo |
| --- | --- | --- | --- |
| D1 | Monorepo con `backend/` y `frontend/` | Dos repositorios | Una sola entrega y los archivos de IA en la raíz |
| D2 | Vite + React en **JavaScript** | Next.js / TypeScript | Es lo visto en la asignatura y el código es más fácil de defender; Next añadiría un servidor que no necesitamos |
| D3 | Express 5 | Express 4 | Express 5 pasa solo los errores de funciones `async` al middleware de errores: no hace falta `try/catch` en cada controlador |
| D4 | Lista blanca de campos (`pickAllowed`) en POST/PUT | Pasar `req.body` tal cual | Evita que el cliente escriba `_id`, `createdAt`… |
| D5 | Filtros en el servidor (`?category`, `?month`) | Filtrar en React | Escala mejor y practica `req.query` |
| D6 | `toJSON` expone `id` en vez de `_id` | Usar `_id` en React | El frontend no depende de detalles de Mongo |
| D7 | Fechas guardadas a medianoche UTC y mostradas con `timeZone: 'UTC'` | Mostrar en hora local | Si no, en husos horarios negativos el gasto aparecería el día anterior |
| D8 | Tras crear/editar se **recarga** la lista; al borrar se quita en local | Actualizar siempre en local | Recargar respeta orden y filtros del servidor; borrar en local da respuesta inmediata |
| D9 | Validación duplicada (cliente + Mongoose) | Solo servidor | El cliente avisa rápido; el servidor es la fuente de verdad |
| D10 | Confirmación de borrado en línea (dentro de la fila) | `window.confirm()` | Accesible, con estilo propio y funciona igual en móvil |
| D11 | Tailwind v4 con tokens en `@theme` | CSS a mano | Rapidez y consistencia; los colores de categoría son tokens |
| D12 | Render (API) + Vercel (front) | Todo en Vercel con funciones serverless | Express tal cual, sin adaptar a serverless; es lo pedido en el enunciado |

## 7. Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Render gratuito "duerme" la API (arranque de ~50 s) | Aviso en la interfaz si la carga tarda > 3 s; `healthCheckPath` |
| Atlas bloquea la IP de Render | Network Access → `0.0.0.0/0` (documentado en el README) |
| CORS en producción | `CORS_ORIGIN` con la URL exacta de Vercel, sin barra final |
| Subir `.env` por error | `.gitignore` + solo se versiona `.env.example` |

---

## Historial del proyecto

Registro cronológico de todo lo hecho (quién: 🤖 IA / 👤 alumno).

| Fecha | Fase | Quién | Qué se hizo | Commit |
| --- | --- | --- | --- | --- |
| 2026-09-24 | 1 | 👤 | Lectura del enunciado de la PEC 5 y de la rúbrica; decisión de usar IA para todo el código y encargarme de la gestión, revisión, Git y despliegue | — |
| 2026-09-24 | 1 | 🤖 | Propuesta de idea (gestor de gastos), entidad `Expense`, endpoints y estructura de carpetas | `docs: plan inicial` |
| 2026-09-24 | 2 | 🤖 | Backend: `env.js`, `db.js`, modelo, controlador, rutas, middlewares (`errorHandler`, `notFound`, `validateObjectId`) | `feat(api): …` |
| 2026-09-24 | 2 | 🤖 | Al instalar se comprueba que la última versión es **Mongoose 9**: `new: true` está obsoleto → se usa `returnDocument: 'after'` | `fix(api): …` |
| 2026-09-24 | 3 | 🤖 | Pruebas de humo sin BD (rutas, 400/404, JSON mal formado, validaciones del modelo) | — |
| 2026-09-24 | 3 | 🤖 | Error detectado: un origen bloqueado por CORS devolvía **500**. Corregido a **403** | `fix(api): cors 403` |
| 2026-09-24 | 3 | 🤖 | Archivos `expenses.http` y `expenses.postman.json` (CRUD + casos de error, con tests en Postman) | `test(api): …` |
| 2026-09-24 | 4 | 🤖 | Frontend con Vite + React + Tailwind v4: capa API, hook `useExpenses`, componentes | `feat(web): …` |
| 2026-09-24 | 5 | 🤖 | Prueba del flujo completo en navegador (crear, validar, editar, borrar, filtrar) contra una API simulada, a 375 px y 1366 px: sin scroll horizontal | — |
| 2026-09-24 | 5 | 🤖 | Errores visuales detectados en las capturas: botón "Eliminar" gris (conflicto de clases Tailwind) y selects en negrita. Corregidos | `fix(web): …` |
| 2026-09-24 | 6 | 🤖 | README, PLAN, AGENTS, SKILLS, TASKS, `.ai/agents`, `.ai/skills`, `.gitignore`, `.gitattributes` | `docs: …` |
| 2026-09-25 | 5 | 👤 | Creé mi cluster en Atlas y mi `.env`. Al hacer `npm run dev` la API no conectaba por un problema de DNS con la dirección del cluster; lo arreglé en la conexión hasta que `/api/health` devolvió `"database": "conectada"`. Luego lancé el `.http` contra la BD real | — |
| 2026-09-25 | 5 | 👤 | Me leí el código archivo por archivo, también con ayuda de Claude Code. Borré el código que sobraba (cosas "por si acaso" que no se usaban) y corregí algunas rutas que no estaban como las necesitaba | — |
| 2026-09-26 | 4 | 👤 | Rehíce todo el diseño: tema oscuro con verde menta de acento, marcos con esquinas, un color por categoría y animaciones (entrada de paneles, barra del resumen, aviso) que se quitan con `prefers-reduced-motion` | — |
| 2026-09-27 | 1 | 👤 | Configuré Git y el editor: `.gitignore`, `.gitattributes`, `.prettierrc` y las extensiones recomendadas de VS Code | `chore(pec5): configuración de git y editor` |
| 2026-09-27 | 6 | 👤 | Repasé la documentación, escribí la reflexión con mi experiencia y completé en el README lo que me tocaba a mí (herramientas, prompt inicial, errores E6–E8 y decisiones propias) | — |
| 2026-09-27 | 7 | 👤 | Subir la API a Render y el front a Vercel, y poner en Render el `CORS_ORIGIN` con la URL de Vercel | |
| 2026-09-27 | 7 | 👤 | Probar la app ya desplegada desde mi móvil (crear, editar, borrar) y poner las URLs reales en el README | |
