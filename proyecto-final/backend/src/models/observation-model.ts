import mongoose, { Schema } from "mongoose";
import { IObservation, TIPOS_OBSERVACION } from "../types";

const observationSchema = new Schema<IObservation>(
  {
    // Mínimo de 10 caracteres para evitar aportaciones vacías tipo "ok"
    contenido: {
      type: String,
      required: [true, "El contenido de la observación es obligatorio"],
      trim: true,
      minlength: [10, "La observación debe tener al menos 10 caracteres"],
      maxlength: [1000, "La observación no puede superar los 1000 caracteres"],
    },
    // Índice porque las observaciones se listan por exoplaneta
    exoplaneta: {
      type: Schema.Types.ObjectId,
      ref: "Exoplanet",
      required: [true, "La observación debe estar asociada a un exoplaneta"],
      index: true,
    },
    autor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La observación debe tener un autor"],
    },
    tipo: {
      type: String,
      enum: {
        values: TIPOS_OBSERVACION,
        message: "{VALUE} no es un tipo de observación válido",
      },
      default: "Observación",
    },
    // Mismo rango que anioDescubrimiento en los exoplanetas
    anioObservacion: {
      type: Number,
      min: [1988, "El primer exoplaneta se detectó en 1988"],
      max: [new Date().getFullYear() + 1, "El año no puede ser futuro"],
    },
    instrumento: {
      type: String,
      trim: true,
    },
    // Permite ocultar una observación (moderación) sin borrarla
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "observations",
  }
);

export const Observation = mongoose.model<IObservation>("Observation", observationSchema);

export default Observation;
