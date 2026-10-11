import mongoose, { Schema } from "mongoose";
import { FORMATOS_IMAGEN, IImage, ORIGENES_IMAGEN } from "../types";

const imageSchema = new Schema<IImage>(
  {
    titulo: {
      type: String,
      required: [true, "El título de la imagen es obligatorio"],
      trim: true,
      maxlength: [120, "El título no puede superar los 120 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede superar los 500 caracteres"],
      default: "",
    },
    origen: {
      type: String,
      enum: {
        values: ORIGENES_IMAGEN,
        message: "{VALUE} no es un origen de imagen válido",
      },
      required: [true, "El origen de la imagen es obligatorio"],
    },
    // datos y url no son required aquí: cuál de los dos es obligatorio
    // depende de origen, y eso se comprueba en el pre("validate") de abajo
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
        message: "{VALUE} no es un formato de imagen válido",
      },
    },
    tamanoKb: {
      type: Number,
      min: [0, "El tamaño no puede ser negativo"],
    },
    // Índice porque las imágenes siempre se consultan por exoplaneta
    exoplaneta: {
      type: Schema.Types.ObjectId,
      ref: "Exoplanet",
      required: [true, "La imagen debe estar asociada a un exoplaneta"],
      index: true,
    },
    subidaPor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Hay que indicar qué usuario sube la imagen"],
    },
    creditoAutor: {
      type: String,
      trim: true,
      default: "Desconocido",
    },
    // Empieza en false porque las imágenes de los usuarios no se muestran
    // hasta que un administrador las revisa y aprueba
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

// Validación cruzada entre campos: un validador de campo solo ve su propio
// valor, así que la coherencia origen/datos/url se comprueba a nivel de
// documento. invalidate() la convierte en un ValidationError normal, que el
// errorHandler ya traduce a 400.
imageSchema.pre("validate", async function () {
  if (this.origen === "subida" && !this.datos?.trim()) {
    this.invalidate("datos", "Si el origen es 'subida', hay que enviar la imagen en Base64 en el campo datos");
  }
  if (this.origen === "enlace" && !this.url?.trim()) {
    this.invalidate("url", "Si el origen es 'enlace', hay que indicar la url de la imagen");
  }
});

export const Image = mongoose.model<IImage>("Image", imageSchema);

export default Image;
