import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, ROLES_USUARIO } from "../types";

const userSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "El formato del email no es válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [4, "La contraseña debe tener al menos 4 caracteres"],
      // Nunca se devuelve en las consultas salvo que se pida con .select("+password")
      select: false,
    },
    institucion: {
      type: String,
      trim: true,
    },
    rol: {
      type: String,
      enum: ROLES_USUARIO,
      default: "investigador",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Hashea la contraseña antes de guardar. Solo si ha cambiado, para no
// volver a hashear un hash al actualizar otros campos del usuario.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compara una contraseña en texto plano con el hash guardado (para el login).
// Requiere que el documento se haya cargado con .select("+password").
userSchema.methods.compararPassword = async function (
  this: IUser,
  passwordPlano: string
): Promise<boolean> {
  return bcrypt.compare(passwordPlano, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);

export default User;
