import { createContext, useCallback, useContext, useRef, useState } from "react";

const NotificationContext = createContext(null);

const ESTILOS_POR_TIPO = {
  exito: "border-accent/40 bg-accent-dim text-accent-strong",
  error: "border-peligro/40 bg-peligro-dim text-peligro",
};

function NotificationToast({ notificacion }) {
  if (!notificacion) return null;

  const estilos = ESTILOS_POR_TIPO[notificacion.tipo] ?? ESTILOS_POR_TIPO.exito;

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50 flex justify-end">
      <div
        role="status"
        className={`frame pointer-events-auto border px-5 py-3 text-sm shadow-lg backdrop-blur-xl ${estilos}`}
      >
        {notificacion.mensaje}
      </div>
    </div>
  );
}

export function NotificationProvider({ children }) {
  const [notificacion, setNotificacion] = useState(null);
  const timeoutRef = useRef(null);

  const notificar = useCallback((mensaje, tipo = "exito") => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotificacion({ mensaje, tipo, id: Date.now() });

    timeoutRef.current = setTimeout(() => {
      setNotificacion(null);
      timeoutRef.current = null;
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={notificar}>
      {children}
      <NotificationToast notificacion={notificacion} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const notificar = useContext(NotificationContext);
  if (!notificar) {
    throw new Error("useNotification debe usarse dentro de un NotificationProvider");
  }
  return notificar;
}
