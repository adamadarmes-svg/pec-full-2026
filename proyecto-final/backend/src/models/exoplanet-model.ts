import mongoose, { Schema } from "mongoose";
import { IExoplanet, METODOS_DESCUBRIMIENTO, TIPOS_PLANETA } from "../types";

const exoplanetSchema = new Schema<IExoplanet>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del exoplaneta es obligatorio"],
      unique: true,
      trim: true,
    },
    estrellaAnfitriona: {
      type: String,
      required: [true, "La estrella anfitriona es obligatoria"],
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
        message: "{VALUE} no es un tipo de planeta válido",
      },
      default: "Desconocido",
    },
    // Magnitudes físicas: solo se valida que no sean negativas
    masa: {
      type: Number,
      min: [0, "La masa no puede ser negativa"],
    },
    radio: {
      type: Number,
      min: [0, "El radio no puede ser negativo"],
    },
    periodoOrbital: {
      type: Number,
      min: [0, "El periodo orbital no puede ser negativo"],
    },
    temperaturaEquilibrio: {
      type: Number,
      min: [0, "La temperatura en kelvin no puede ser negativa"],
    },
    distancia: {
      type: Number,
      min: [0, "La distancia no puede ser negativa"],
    },
    metodoDescubrimiento: {
      type: String,
      enum: {
        values: METODOS_DESCUBRIMIENTO,
        message: "{VALUE} no es un método de descubrimiento válido",
      },
    },
    anioDescubrimiento: {
      type: Number,
      min: [1988, "El primer exoplaneta se detectó en 1988"],
      max: [new Date().getFullYear() + 1, "El año no puede ser futuro"],
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
    // Referencias a otras colecciones, resueltas con populate en el controlador
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

// Índices en los campos por los que más se filtra el catálogo
exoplanetSchema.index({ tipoPlaneta: 1 });
exoplanetSchema.index({ zonaHabitable: 1 });

export const Exoplanet = mongoose.model<IExoplanet>("Exoplanet", exoplanetSchema);

export default Exoplanet;
