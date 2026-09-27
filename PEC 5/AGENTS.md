# AGENTS.md — Instrucciones para agentes de IA

## Proyecto

**Cuentas Claras**: gestor de gastos personales. CRUD de la entidad `Expense` con filtros por categoría y mes y un resumen por categoría. Proyecto de la PEC 5 (Desarrollo Web Fullstack, CEI).

## Stack

| Capa | Tecnología | Versión |
| --- | --- | --- |
| Frontend | React + Vite (JavaScript, JSX) | React 19, Vite 8 |
| Estilos | Tailwind CSS (plugin `@tailwindcss/vite`, tokens en `@theme`) | 4.x |
| Backend | Node.js + Express (ES Modules) | Node ≥ 20, Express 5 |
| Base de datos | MongoDB Atlas + Mongoose | Mongoose 9 |
| Despliegue | Vercel (frontend) · Render (API) | — |

## Estructura

```
PEC 5/
├── backend/
│   ├── src/
│   │   ├── config/        env.js (variables) · db.js (conexión)
│   │   ├── models/        Expense.js
│   │   ├── controllers/   expense.controller.js
│   │   ├── routes/        expense.routes.js
│   │   ├── middleware/    errorHandler.js · validateObjectId.js
│   │   ├── app.js         Express (sin listen, para poder probarlo)
│   │   └── server.js      conecta BD + listen
│   └── requests/          expenses.http · expenses.postman.json
├── frontend/
│   └── src/
│       ├── api/           expenses.js (único sitio con fetch)
│       ├── hooks/         useExpenses.js
│       ├── components/    Button, Field, ExpenseForm, ExpenseList, ExpenseItem, FilterBar, SummaryPanel, StatusMessage
│       ├── constants/     options.js (categorías y métodos de pago)
│       └── utils/         format.js (moneda y fechas)
├── .ai/agents/            definición de cada agente
├── .ai/skills/            skills (técnicas + prompts reutilizables)
└── PLAN.md · AGENTS.md · SKILLS.md · TASKS.md · README.md
```

## Comandos

```bash
cd backend && npm install
npm run dev       
npm start         

cd frontend && npm install
npm run dev       
npm run build      
```

## Convenciones

- **Idioma**: código (variables, funciones) en inglés; textos de interfaz, mensajes de error y comentarios en español.
- **Módulos**: ES Modules (`import`/`export`) en ambos lados; extensiones `.js`/`.jsx` explícitas en los imports.
- **Nombres**: componentes en PascalCase (`ExpenseForm.jsx`), hooks con `use` (`useExpenses.js`), el resto en camelCase.
- **Respuestas de la API**: éxito → `{ data, message? }`; error → `{ error, details? }`. Nunca HTML.
- **Códigos HTTP**: 200 leer/editar/borrar · 201 crear · 400 datos mal · 403 CORS · 404 no existe · 500 fallo del servidor.
- **Estilos**: solo clases de Tailwind y tokens de `index.css` (`bg-paper`, `text-ink`, `bg-cat-*`…). Nada de colores hex sueltos en los componentes.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `style:`, `refactor:`) con ámbito (`feat(api):`, `fix(web):`).

## Reglas para la IA (obligatorias)

1. **Lee este archivo y `PLAN.md` antes de proponer cambios.** Si una petición contradice el plan, avisa antes de escribir código.
2. **No inventes versiones ni APIs.** Si no estás seguro de cómo funciona una librería en la versión instalada, dilo y consulta `node_modules/<lib>` o la documentación oficial.
3. **Nunca escribas secretos** en el código ni en ejemplos reales. Solo `process.env.X` / `import.meta.env.VITE_X` y valores de ejemplo en `.env.example`.
4. **El modelo es la fuente de verdad**: si cambias un campo en `Expense.js`, actualiza también `constants/options.js`, `ExpenseForm.jsx`, `.http`, `.postman.json` y la tabla de `PLAN.md`.
5. **Todo `fetch` pasa por `src/api/expenses.js`**. Los componentes no llaman a `fetch` directamente.
6. **No pases `req.body` directamente a Mongoose**: usa la lista blanca `ALLOWED_FIELDS`.
7. **Cada cambio de interfaz se revisa en 375 px y en ≥ 1280 px** (ver skill `responsive-review`).
8. **Explica lo que cambias**: al terminar, resume qué archivos tocaste y por qué, para poder registrarlo en `PLAN.md` (historial) y `TASKS.md`.
9. **Cambios pequeños**: un objetivo por petición; nada de reescribir archivos enteros si basta con editar una función.

## Agentes que han trabajado en el proyecto

Cada "agente" es un rol con su propio contexto y reglas. En la práctica se ha usado **una misma herramienta (Claude)** cambiando de rol según la fase.

| Agente | Archivo | Responsabilidad | Fases |
| --- | --- | --- | --- |
| 🧭 Planificador | [`.ai/agents/planner.md`](.ai/agents/planner.md) | Idea, entidad, endpoints, fases | 1 |
| 🛠️ Backend | [`.ai/agents/backend.md`](.ai/agents/backend.md) | Modelo, rutas, controladores, errores | 2–3 |
| 🎨 Frontend | [`.ai/agents/frontend.md`](.ai/agents/frontend.md) | Componentes, hook, formulario, estilos | 4 |
| 🔍 Revisor / QA | [`.ai/agents/reviewer.md`](.ai/agents/reviewer.md) | Pruebas, revisión de código y responsive | 3, 5 |
| 🚀 Despliegue | [`.ai/agents/devops.md`](.ai/agents/devops.md) | Atlas, Render, Vercel, variables, CORS | 7 |
| 👤 Alumno (humano) | — | Gestión, decisiones finales, Git, despliegue, revisión | Todas |
