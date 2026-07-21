const mongoose = require("mongoose");

const exoplanetSchema = new mongoose.Schema(
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
        values: [
          "Terrestre",
          "Supertierra",
          "Tipo-Neptuno",
          "Gigante gaseoso",
          "Desconocido",
        ],
        message: "{VALUE} no es un tipo de planeta válido",
      },
      default: "Desconocido",
    },
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
        values: [
          "Tránsito",
          "Velocidad radial",
          "Imagen directa",
          "Microlente",
          "Astrometría",
          "Otro",
        ],
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
    imagen: {
      type: String,
      trim: true,
    },
    fuentePrincipal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Source",
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "exoplanets",
  }
);

exoplanetSchema.index({ tipoPlaneta: 1 });
exoplanetSchema.index({ zonaHabitable: 1 });

module.exports = mongoose.model("Exoplanet", exoplanetSchema);
