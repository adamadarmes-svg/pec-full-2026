import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alerta } from "@/components/ui/Alerta";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { LIMITES } from "@/const/catalogo";
import { MENSAJES } from "@/const/config";
import { RUTAS } from "@/const/rutas";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { type ErroresFormulario, useFormulario } from "@/hooks/useFormulario";
import { mensajeDeError } from "@/services/api";
import { rutaDeOrigen } from "@/utils/navegacion";

export type ModoAuth = "login" | "registro";

interface ValoresAuth {
  nombre: string;
  email: string;
  password: string;
  institucion: string;
}

const VALORES_INICIALES: ValoresAuth = { nombre: "", email: "", password: "", institucion: "" };

// solo compruebo lo básico porque la validación de verdad la hace el backend
const PATRON_EMAIL = /^\S+@\S+\.\S+$/;

// valido antes de llamar a la api para no gastar una petición en un error obvio
function crearValidador(modo: ModoAuth) {
  return (valores: ValoresAuth): ErroresFormulario<ValoresAuth> => {
    const errores: ErroresFormulario<ValoresAuth> = {};
    if (modo === "registro" && !valores.nombre.trim()) errores.nombre = "escribe tu nombre.";
    if (!PATRON_EMAIL.test(valores.email.trim())) errores.email = "email no válido.";
    if (!valores.password) {
      errores.password = "escribe tu contraseña.";
    } else if (modo === "registro" && valores.password.length < LIMITES.PASSWORD_MIN) {
      errores.password = `la contraseña necesita al menos ${LIMITES.PASSWORD_MIN} caracteres.`;
    }
    return errores;
  };
}

export function FormularioAuth({ modo }: { modo: ModoAuth }) {
  const { iniciarSesion, registrar } = useAuth();
  const notificar = useNotification();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const esRegistro = modo === "registro";

  const { valores, errores, manejarCambio, validar } = useFormulario(VALORES_INICIALES, crearValidador(modo));
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrorEnvio(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      if (esRegistro) {
        await registrar({
          nombre: valores.nombre.trim(),
          email: valores.email.trim(),
          password: valores.password,
          institucion: valores.institucion.trim() || undefined,
        });
        notificar(MENSAJES.REGISTRO_COMPLETADO);
      } else {
        await iniciarSesion({ email: valores.email.trim(), password: valores.password });
        notificar(MENSAJES.SESION_INICIADA);
      }
      // uso replace para que atrás no vuelva al formulario ya enviado
      navegar(rutaDeOrigen(ubicacion.state), { replace: true });
    } catch (error) {
      setErrorEnvio(mensajeDeError(error));
      setEnviando(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-sm pt-12 md:pt-20">
      <h1 className="text-center font-serif text-titulo text-tinta">{esRegistro ? "crear cuenta" : "entrar"}</h1>

      <form onSubmit={enviar} noValidate className="mt-14 grid gap-y-8">
        {esRegistro && (
          <Campo etiqueta="nombre" name="nombre" value={valores.nombre} onChange={manejarCambio} error={errores.nombre} autoComplete="name" />
        )}
        <Campo
          etiqueta="email"
          name="email"
          type="email"
          value={valores.email}
          onChange={manejarCambio}
          error={errores.email}
          autoComplete="email"
        />
        <Campo
          etiqueta="contraseña"
          name="password"
          type="password"
          value={valores.password}
          onChange={manejarCambio}
          error={errores.password}
          ayuda={esRegistro ? `al menos ${LIMITES.PASSWORD_MIN} caracteres` : undefined}
          autoComplete={esRegistro ? "new-password" : "current-password"}
        />
        {esRegistro && (
          <Campo
            etiqueta="institución (opcional)"
            name="institucion"
            value={valores.institucion}
            onChange={manejarCambio}
            autoComplete="organization"
          />
        )}

        {errorEnvio && <Alerta variante="error">{errorEnvio}</Alerta>}

        <div className="flex justify-center pt-2">
          <Boton type="submit" variante="primario" cargando={enviando} textoCargando={esRegistro ? "creando cuenta" : "entrando"}>
            {esRegistro ? "crear cuenta" : "entrar"}
          </Boton>
        </div>
      </form>

      {/* paso el state para no perder a dónde quería ir al cambiar de modo */}
      <p className="mt-12 text-center text-apoyo text-tinta-tenue">
        {esRegistro ? "¿ya tienes cuenta? " : "¿no tienes cuenta? "}
        <Link
          to={esRegistro ? RUTAS.LOGIN : RUTAS.REGISTRO}
          state={ubicacion.state}
          className="text-tinta underline decoration-linea-fuerte underline-offset-[0.4em] hover:decoration-tinta"
        >
          {esRegistro ? "entrar" : "crear una cuenta"}
        </Link>
      </p>
    </section>
  );
}
