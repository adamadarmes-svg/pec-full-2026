import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

export type TipoNotificacion = "exito" | "error";

interface Notificacion {
  mensaje: string;
  tipo: TipoNotificacion;
  // Distingue dos notificaciones seguidas con el mismo texto
  id: number;
}

type Notificar = (mensaje: string, tipo?: TipoNotificacion) => void;

const DURACION_MS = 4000;

const NotificationContext = createContext<Notificar | null>(null);

const ESTILOS_POR_TIPO: Record<TipoNotificacion, string> = {
  exito: "border-accent/40 bg-accent-dim text-accent-strong",
  error: "border-peligro/40 bg-peligro-dim text-peligro",
};

function NotificationToast({ notificacion }: { notificacion: Notificacion | null }) {
  if (!notificacion) return null;

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50 flex justify-end">
      {/* role="status" hace que los lectores de pantalla anuncien el mensaje */}
      <div
        role="status"
        className={`frame pointer-events-auto border px-5 py-3 text-sm shadow-lg backdrop-blur-xl ${ESTILOS_POR_TIPO[notificacion.tipo]}`}
      >
        {notificacion.mensaje}
      </div>
    </div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Una sola notificación a la vez: la nueva sustituye a la anterior
  const [notificacion, setNotificacion] = useState<Notificacion | null>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notificar = useCallback<Notificar>((mensaje, tipo = "exito") => {
    // Se cancela el temporizador anterior para que no oculte antes de tiempo
    // la notificación nueva
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
    }

    setNotificacion({ mensaje, tipo, id: Date.now() });

    temporizadorRef.current = setTimeout(() => {
      setNotificacion(null);
      temporizadorRef.current = null;
    }, DURACION_MS);
  }, []);

  // Al desmontar se limpia el temporizador pendiente
  useEffect(() => {
    return () => {
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    };
  }, []);

  return (
    <NotificationContext.Provider value={notificar}>
      {children}
      <NotificationToast notificacion={notificacion} />
    </NotificationContext.Provider>
  );
}

export function useNotification(): Notificar {
  const notificar = useContext(NotificationContext);
  if (!notificar) {
    throw new Error("useNotification debe usarse dentro de un NotificationProvider");
  }
  return notificar;
}
