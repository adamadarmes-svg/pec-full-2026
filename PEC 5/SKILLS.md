# SKILLS.md — Habilidades, prompts reutilizables y ajustes del proyecto

> Qué se le ha pedido a la IA y **cómo**, en forma de "skills" reutilizables para próximos proyectos,
> más la lista de **ajustes** que hay que hacer (o se han hecho) sobre lo que genera la IA.
> Cada skill tiene su archivo detallado en [`.ai/skills/`](.ai/skills/).

## Índice de skills

| Skill | Archivo | Para qué | Usada en |
| --- | --- | --- | --- |
| CRUD Express + Mongoose | [`crud-express-mongoose.md`](.ai/skills/crud-express-mongoose.md) | Generar modelo, controlador y rutas de una entidad | Backend |
| Gestión de errores de API | [`api-error-handling.md`](.ai/skills/api-error-handling.md) | Middleware de errores con códigos y JSON coherentes | Backend |
| Formulario CRUD en React | [`react-crud-form.md`](.ai/skills/react-crud-form.md) | Un formulario para crear y editar, con validación | Frontend |
| Revisión responsive | [`responsive-review.md`](.ai/skills/responsive-review.md) | Checklist de fallos típicos de responsive | Revisión |
| Despliegue Render + Vercel | [`deploy-render-vercel.md`](.ai/skills/deploy-render-vercel.md) | Pasos y errores típicos del despliegue | Despliegue |

## Técnicas de prompting que han funcionado

1. **Contexto primero**: pegar `AGENTS.md` + la tabla de la entidad antes de pedir código. Sin eso, la IA inventa nombres de campos distintos en cada respuesta.
2. **Pedir versiones concretas**: "Express 5 y Mongoose 9". Si no, genera código de versiones antiguas (p. ej. `new: true`).
3. **Pedir los casos de error explícitamente**: si no se piden, la IA solo genera el "camino feliz".
4. **Un objetivo por prompt**: "solo el modelo", luego "solo el controlador". Las respuestas largas mezclan errores difíciles de ver.
5. **Pedir explicación**: terminar con "explica cada archivo en 2 líneas". Obliga a revisar y sirve para la defensa.
6. **Pedir revisión como otro rol**: "actúa como revisor exigente…" sobre el código que acaba de generar encuentra fallos que no ve al generarlo.
7. **Verificar con la realidad**: pruebas `.http`, capturas en 375 px y lectura de `node_modules` antes de aceptar nada.

## Prompts principales usados

| # | Fase | Prompt (resumido) |
| --- | --- | --- |
| P1 | Todo | "Necesito hacer un proyecto completo hecho por ti [enunciado de la PEC 5 + rúbrica]. Aplicación fullstack con React (JS o TS, Next o Vite). Yo hago la gestión general, tú todo el código. Dime cómo subirla a Render y Vercel y qué instalar." |
| P2 | Plan | Prompt base del [agente planificador](.ai/agents/planner.md) |
| P3 | Backend | Prompt de la skill [crud-express-mongoose](.ai/skills/crud-express-mongoose.md) |
| P4 | Errores | Prompt de la skill [api-error-handling](.ai/skills/api-error-handling.md) |
| P5 | Frontend | Prompt base del [agente frontend](.ai/agents/frontend.md) + skill [react-crud-form](.ai/skills/react-crud-form.md) |
| P6 | Revisión | Prompt del [agente revisor](.ai/agents/reviewer.md) + skill [responsive-review](.ai/skills/responsive-review.md) |
| P7 | Deploy | Prompt de la skill [deploy-render-vercel](.ai/skills/deploy-render-vercel.md) |

## Ajustes del proyecto

Ajustes que hay que aplicar sobre el código generado por IA (✅ hecho · ⏳ pendiente).

| # | Ajuste | Archivo | Motivo | Estado |
| --- | --- | --- | --- | --- |
| A1 | `new: true` → `returnDocument: 'after'` | `backend/src/controllers/expense.controller.js` | Opción obsoleta en Mongoose 9 | ✅ |
| A2 | Rechazo de CORS: `Error` → `HttpError(403)` | `backend/src/app.js` | Devolvía 500 y ensuciaba el log | ✅ |
| A3 | Variante `dangerGhost` en `Button` | `frontend/src/components/Button.jsx` | `text-danger` no ganaba a `text-muted` | ✅ |
| A4 | `font-normal` en `inputClass` | `frontend/src/components/Field.jsx` | Los selects heredaban la negrita de la etiqueta | ✅ |
| A5 | `dotenv.config({ quiet: true })` | `backend/src/config/env.js` | dotenv 17+ imprime un mensaje en cada arranque | ✅ |
| A6 | Fechas mostradas con `timeZone: 'UTC'` | `frontend/src/utils/format.js` | Evitar que el gasto salga el día anterior | ✅ |
| A7 | Poner las URLs reales en `@baseUrl` del `.http` y en `baseUrl` de Postman | `backend/requests/` | Probar producción | ⏳ |
| A8 | `CORS_ORIGIN` = URL de Vercel en Render | Panel de Render | Si no, el navegador bloquea las peticiones | ⏳ |
| A9 | Sustituir capturas por las de producción (con las fuentes cargadas) | `docs/screenshots/` | Las actuales son de la prueba local | ⏳ |
