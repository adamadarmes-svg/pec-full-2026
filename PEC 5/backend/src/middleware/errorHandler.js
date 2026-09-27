import { isProduction } from '../config/env.js';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, _res, next) {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.name === 'ValidationError') {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message])
    );
    return res.status(400).json({ error: 'Datos no válidos', details });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Valor no válido para "${err.path}"`,
      details: { [err.path]: `No se puede convertir "${err.value}"` },
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }

  const status = err.status ?? 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: status >= 500 && isProduction ? 'Error interno del servidor' : err.message,
    ...(err.details && { details: err.details }),
  });
}
