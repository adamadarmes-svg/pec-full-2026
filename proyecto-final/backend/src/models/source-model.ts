import mongoose, { Schema } from "mongoose";
import { ISource } from "../types";

const sourceSchema = new Schema<ISource>(
  {
    titulo: {
      type: String,
      required: [true, "falta el título."],
      trim: true,
    },
    autores: {
      type: String,
      required: [true, "faltan los autores."],
      trim: true,
    },
    publicacion: {
      type: String,
      trim: true,
    },
    anio: {
      type: Number,
      min: [1500, "el año mínimo es 1500."],
      max: [new Date().getFullYear() + 1, "el año no puede ser futuro."],
    },
    // puse sparse para que puedan existir muchas fuentes sin doi
    doi: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    revisadoPorPares: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "sources",
  }
);

export const Source = mongoose.model<ISource>("Source", sourceSchema);

export default Source;
