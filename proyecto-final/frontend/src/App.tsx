import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { router } from "@/router";
import { EstilosGlobales } from "@/styles/globales";
import { tema } from "@/styles/theme";

// puse el tema fuera porque lo usa todo y la sesión antes del router porque RutaProtegida la necesita
export function App() {
  return (
    <ThemeProvider theme={tema}>
      <EstilosGlobales />
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
