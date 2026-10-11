import mongoose, { Schema } from "mongoose";
import { FORMATOS_IMAGEN, IImage, ORIGENES_IMAGEN } from "../types";

const imageSchema = new Schema<IImage>(
  {
    titulo: {
      type: String,
      required: [true, "falta el título."],
      trim: true,
      maxlength: [120, "el título admite 120 caracteres como máximo."],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, "la descripción admite 500 caracteres como máximo."],
      default: "",
    },
    origen: {
      type: String,
      enum: {
        values: ORIGENES_IMAGEN,
        message: "{VALUE} no es un origen de imagen válido.",
      },
      required: [true, "falta el origen de la imagen."],
    },
    // no los marqué como required porque depende del origen y lo valido abajo
    datos: {
      type: String,
    },
    url: {
      type: String,
      trim: true,
    },
    formato: {
      type: String,
      enum: {
        values: FORMATOS_IMAGEN,
        message: "{VALUE} no es un formato de imagen válido.",
      },
    },
    tamanoKb: {
      type: Number,
      min: [0, "el tamaño no puede ser negativo."],
    },
    // puse índice porque las imágenes siempre se buscan por exoplaneta
    exoplaneta: {
      type: Schema.Types.ObjectId,
      ref: "Exoplanet",
      required: [true, "falta el exoplaneta."],
      index: true,
    },
    subidaPor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "falta el usuario que la sube."],
    },
    creditoAutor: {
      type: String,
      trim: true,
      default: "Desconocido",
    },
    // empieza en false para que un admin la revise antes de mostrarla
    publicada: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "images",
  }
);

// lo valido a nivel de documento porque un validador de campo no ve los demás campos
imageSchema.pre("validate", async function () {
  if (this.origen === "subida" && !this.datos?.trim()) {
    this.invalidate("datos", "con origen subida hay que enviar la imagen en datos.");
  }
  if (this.origen === "enlace" && !this.url?.trim()) {
    this.invalidate("url", "con origen enlace hay que indicar la url.");
  }
});

export const Image = mongoose.model<IImage>("Image", imageSchema);

export default Image;
