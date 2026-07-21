const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título de la publicación es obligatorio"],
      trim: true,
    },
    autores: {
      type: String,
      required: [true, "Los autores son obligatorios"],
      trim: true,
    },
    publicacion: {
      type: String,
      trim: true,
    },
    anio: {
      type: Number,
      min: [1500, "El año no puede ser anterior a 1500"],
      max: [new Date().getFullYear() + 1, "El año no puede ser futuro"],
    },
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

module.exports = mongoose.model("Source", sourceSchema);
