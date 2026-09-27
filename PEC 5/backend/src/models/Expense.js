import mongoose from 'mongoose';

export const CATEGORIES = ['comida', 'transporte', 'vivienda', 'ocio', 'salud', 'educacion', 'otros'];
export const PAYMENT_METHODS = ['tarjeta', 'efectivo', 'transferencia', 'bizum'];

const toCents = (value) => Math.round(value * 100) / 100;

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El concepto es obligatorio'],
      trim: true,
      minlength: [2, 'El concepto debe tener al menos 2 caracteres'],
      maxlength: [80, 'El concepto no puede superar los 80 caracteres'],
    },
    amount: {
      type: Number,
      required: [true, 'El importe es obligatorio'],
      min: [0.01, 'El importe debe ser mayor que 0'],
      max: [1000000, 'El importe es demasiado alto'],
      set: toCents,
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: 'Categoría no válida: {VALUE}' },
      default: 'otros',
    },
    date: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: { values: PAYMENT_METHODS, message: 'Método de pago no válido: {VALUE}' },
      default: 'tarjeta',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Las notas no pueden superar los 300 caracteres'],
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1, date: -1 });

export const Expense = mongoose.model('Expense', expenseSchema);
