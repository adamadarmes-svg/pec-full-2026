import mongoose, { Schema } from "mongoose";
import { IExoplanet, METODOS_DESCUBRIMIENTO, TIPOS_PLANETA } from "../types";

const exoplanetSchema = new Schema<IExoplanet>(
  {
    nombre: {
      type: String,
      required: [true, "falta el nombre."],
      unique: true,
      trim: true,
    },
    estrellaAnfitriona: {
      type: String,
      required: [true, "falta la estrella anfitriona."],
      trim: true,
    },
    tipoEspectral: {
      type: String,
      trim: true,
    },
    tipoPlaneta: {
      type: String,
      enum: {
        values: TIPOS_PLANETA,
        message: "{VALUE} no es un tipo de planeta válido.",
      },
      default: "Desconocido",
    },
    // solo valido que no sean negativas porque los rangos reales son enormes
    masa: {
      type: Number,
      min: [0, "la masa no puede ser negativa."],
    },
    radio: {
      type: Number,
      min: [0, "el radio no puede ser negativo."],
    },
    periodoOrbital: {
      type: Number,
      min: [0, "el periodo orbital no puede ser negativo."],
    },
    temperaturaEquilibrio: {
      type: Number,
      min: [0, "la temperatura no puede ser negativa."],
    },
    distancia: {
      type: Number,
      min: [0, "la distancia no puede ser negativa."],
    },
    metodoDescubrimiento: {
      type: String,
      enum: {
        values: METODOS_DESCUBRIMIENTO,
        message: "{VALUE} no es un método de descubrimiento válido.",
      },
    },
    anioDescubrimiento: {
      type: Number,
      min: [1988, "el año mínimo es 1988."],
      max: [new Date().getFullYear() + 1, "el año no puede ser futuro."],
    },
    zonaHabitable: {
      type: Boolean,
      default: false,
    },
    confirmado: {
      type: Boolean,
      default: false,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    imagenPrincipal: {
      type: Schema.Types.ObjectId,
      ref: "Image",
    },
    fuentePrincipal: {
      type: Schema.Types.ObjectId,
      ref: "Source",
    },
    creadoPor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "exoplanets",
  }
);

// puse índices en los campos por los que más se filtra
exoplanetSchema.index({ tipoPlaneta: 1 });
exoplanetSchema.index({ zonaHabitable: 1 });

export const Exoplanet = mongoose.model<IExoplanet>("Exoplanet", exoplanetSchema);

export default Exoplanet;
