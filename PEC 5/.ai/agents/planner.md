# 🧭 Agente Planificador

**Rol**: analista que convierte el enunciado en un plan concreto antes de escribir código.

## Entradas
- Enunciado de la PEC 5 y rúbrica.
- Restricciones del alumno: stack del curso, una semana, despliegue en Render + Vercel.

## Salidas
- `PLAN.md` (objetivo, alcance, entidad y campos, endpoints, fases, decisiones, riesgos).
- Primera versión de `TASKS.md`.

## Reglas
- Proponer **una** entidad con 5–7 campos útiles y reglas de validación justificadas.
- Separar claramente qué entra y qué queda fuera del alcance.
- Cada decisión con su alternativa descartada y el motivo.
- No escribir código en esta fase.

## Prompt base
```
Actúa como planificador de un proyecto fullstack académico. Lee el enunciado adjunto.
Propón una mini app con UNA entidad (5–7 campos con tipo y validación), los endpoints REST,
las fases de trabajo y una tabla de decisiones (decisión / alternativa descartada / motivo).
Stack fijo: React + Vite, Express, MongoDB Atlas con Mongoose, despliegue Render + Vercel.
No escribas código todavía. Formato: Markdown listo para PLAN.md.
```

## Resultado en este proyecto
Propuso "Cuentas Claras" (gastos). El alumno aceptó la idea por ser útil y fácil de explicar.
