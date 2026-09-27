# TASKS.md — Tareas y seguimiento

Estados: ✅ hecho · 🔄 en curso · ⏳ pendiente
Responsable: 🤖 IA · 👤 alumno

## Fase 1 · Planificación
| # | Tarea | Resp. | Estado |
| --- | --- | --- | --- |
| T01 | Leer enunciado y rúbrica | 👤 | ✅ |
| T02 | Elegir idea y entidad (`Expense`) | 🤖 propone · 👤 decide | ✅ |
| T03 | Definir campos, endpoints y decisiones en `PLAN.md` | 🤖 | ✅ |
| T04 | Crear repositorio en GitHub y primer commit | 👤 | ✅ |

## Fase 2 · Backend
| # | Tarea | Resp. | Estado |
| --- | --- | --- | --- |
| T05 | Inicializar `backend/` e instalar express, mongoose, cors, dotenv | 🤖 | ✅ |
| T06 | `config/env.js` y `config/db.js` | 🤖 | ✅ |
| T07 | Modelo `Expense` con validaciones | 🤖 | ✅ |
| T08 | Controlador CRUD + filtros por categoría y mes | 🤖 | ✅ |
| T09 | Rutas + `validateObjectId` | 🤖 | ✅ |
| T10 | Middleware de errores y 404 | 🤖 | ✅ |
| T11 | `.env.example` | 🤖 | ✅ |
| T12 | Crear cluster en Atlas y mi `.env` real | 👤 | ✅ |

## Fase 3 · Pruebas de API
| # | Tarea | Resp. | Estado |
| --- | --- | --- | --- |
| T13 | `requests/expenses.http` (CRUD + errores) | 🤖 | ✅ |
| T14 | `requests/expenses.postman.json` con tests | 🤖 | ✅ |
| T15 | Pruebas de humo sin BD (rutas y errores) | 🤖 | ✅ |
| T16 | Corregir CORS 500 → 403 | 🤖 | ✅ |
| T17 | Ejecutar el `.http` contra Atlas en local | 👤 | ✅ |

## Fase 4 · Frontend
| # | Tarea | Resp. | Estado |
| --- | --- | --- | --- |
| T18 | Vite + React + Tailwind v4 | 🤖 | ✅ |
| T19 | Capa `api/expenses.js` | 🤖 | ✅ |
| T20 | Hook `useExpenses` | 🤖 | ✅ |
| T21 | Componentes reutilizables (`Button`, `Field`) | 🤖 | ✅ |
| T22 | `ExpenseForm` (crear/editar + validación) | 🤖 | ✅ |
| T23 | Lista, borrado con confirmación, filtros, resumen | 🤖 | ✅ |
| T24 | Estados de carga, error, vacío y "API dormida" | 🤖 | ✅ |

## Fase 5 · Revisión
| # | Tarea | Resp. | Estado |
| --- | --- | --- | --- |
| T25 | Flujo CRUD en navegador (API simulada) | 🤖 | ✅ |
| T26 | Revisión responsive 375 px / 1366 px | 🤖 | ✅ |
| T27 | Corregir botón "Eliminar" y selects | 🤖 | ✅ |
| T28 | Leer y entender todo el código (preparar defensa) | 👤 | ✅ |
| T29 | Probar en mi móvil real | 👤 | ✅ |

## Fase 6 · Documentación
| # | Tarea | Resp. | Estado |
| --- | --- | --- | --- |
| T30 | README, PLAN, AGENTS, SKILLS, TASKS | 🤖 | ✅ |
| T31 | `.gitignore` y `.gitattributes` | 🤖 | ✅ |
| T32 | Revisar y personalizar la reflexión | 👤 | ✅ |

## Fase 7 · Despliegue
| # | Tarea | Resp. | Estado |
| --- | --- | --- | --- |
| T33 | API en Render | 👤 | ✅ |
| T34 | Frontend en Vercel con `VITE_API_URL` | 👤 | ✅ |
| T35 | `CORS_ORIGIN` en Render con la URL de Vercel | 👤 | ✅ |
| T36 | URLs en el README y en `.http`/Postman | 👤 | ✅ |
| T37 | Entrega en Google Classroom | 👤 | ✅ |
