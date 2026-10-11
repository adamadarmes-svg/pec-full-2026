import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

export type TipoNotificacion = "exito" | "error";

interface Notificacion {
  mensaje: string;
  tipo: TipoNotificacion;
  // el id sirve para distinguir dos avisos iguales seguidos
  id: number;
}

type Notificar = (mensaje: string, tipo?: TipoNotificacion) => void;

const DURACION_MS = 4000;

const NotificationContext = createContext<Notificar | null>(null);

// le puse el color del fondo para que se lea encima del contenido
const ESTILOS_POR_TIPO: Record<TipoNotificacion, string> = {
  exito: "border-acento text-tinta",
  error: "border-peligro text-peligro",
};

function NotificationToast({ notificacion }: { notificacion: Notificacion | null }) {
  if (!notificacion) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-5 right-5 z-50 md:left-auto md:right-10 md:max-w-sm">
      {/* uso role status para que el lector de pantalla lo anuncie */}
      <p
        role="status"
        className={`pointer-events-auto m-0 border-l bg-fondo py-2 pl-4 pr-2 text-apoyo ${ESTILOS_POR_TIPO[notificacion.tipo]}`}
      >
        {notificacion.mensaje}
      </p>
    </div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  // solo una a la vez para que no se apilen
  const [notificacion, setNotificacion] = useState<Notificacion | null>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notificar = useCallback<Notificar>((mensaje, tipo = "exito") => {
    // cancelo el temporizador anterior para que no oculte el aviso nuevo antes de tiempo
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
    }

    setNotificacion({ mensaje, tipo, id: Date.now() });

    temporizadorRef.current = setTimeout(() => {
      setNotificacion(null);
      temporizadorRef.current = null;
    }, DURACION_MS);
  }, []);

  // limpio el temporizador al desmontar para no tocar un componente que ya no existe
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
