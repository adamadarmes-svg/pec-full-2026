import mongoose, { Schema } from "mongoose";
import { IObservation, TIPOS_OBSERVACION } from "../types";

const observationSchema = new Schema<IObservation>(
  {
    // puse mínimo 10 caracteres para evitar respuestas vacías tipo "ok"
    contenido: {
      type: String,
      required: [true, "falta el contenido."],
      trim: true,
      minlength: [10, "la observación necesita al menos 10 caracteres."],
      maxlength: [1000, "la observación admite 1000 caracteres como máximo."],
    },
    // puse índice porque las observaciones se listan por exoplaneta
    exoplaneta: {
      type: Schema.Types.ObjectId,
      ref: "Exoplanet",
      required: [true, "falta el exoplaneta."],
      index: true,
    },
    autor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "falta el autor."],
    },
    tipo: {
      type: String,
      enum: {
        values: TIPOS_OBSERVACION,
        message: "{VALUE} no es un tipo de observación válido.",
      },
      default: "Observación",
    },
    // usé el mismo rango que en los exoplanetas porque antes de 1988 no hay observaciones
    anioObservacion: {
      type: Number,
      min: [1988, "el año mínimo es 1988."],
      max: [new Date().getFullYear() + 1, "el año no puede ser futuro."],
    },
    instrumento: {
      type: String,
      trim: true,
    },
    // añadí visible para poder ocultar sin borrar
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
