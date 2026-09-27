# Skill: gestión de errores de la API

## Prompt reutilizable
```
Crea un middleware de errores para Express 5 que devuelva siempre JSON { error, details? }:
- ValidationError de Mongoose → 400 con details { campo: mensaje }
- CastError → 400 indicando el campo
- JSON mal formado (err.type === 'entity.parse.failed') → 400
- HttpError propio con status → ese status
- resto → 500; en producción sin exponer el mensaje interno
Añade también notFound (404 para rutas inexistentes) y validateObjectId (400).
```

## Tabla de códigos del proyecto
| Situación | Código |
| --- | --- |
| Datos no válidos / id mal formado / JSON roto / filtro mal | 400 |
| Origen no permitido por CORS | 403 |
| Recurso o ruta que no existe | 404 |
| Fallo inesperado | 500 |

## Cómo probarla
Sección "Casos de error" de `backend/requests/expenses.http` y carpeta "Errores" de la colección Postman.
