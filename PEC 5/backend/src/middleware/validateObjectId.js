import mongoose from 'mongoose';
import { HttpError } from './errorHandler.js';

export function validateObjectId(req, _res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new HttpError(400, `ID no válido: ${req.params.id}`));
  }
  next();
}
