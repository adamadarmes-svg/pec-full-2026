import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, ROLES_USUARIO } from "../types";

const userSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: [true, "falta el nombre."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "falta el email."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "el email no es válido."],
    },
    password: {
      type: String,
      required: [true, "falta la contraseña."],
      minlength: [4, "la contraseña necesita al menos 4 caracteres."],
      // lo escondo por defecto para que nunca salga en una consulta normal
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

// solo hasheo si cambió para no hashear un hash al editar otros campos
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// necesita el documento cargado con select("+password") porque si no no hay hash que comparar
userSchema.methods.compararPassword = async function (
  this: IUser,
  passwordPlano: string
): Promise<boolean> {
  return bcrypt.compare(passwordPlano, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);

export default User;
