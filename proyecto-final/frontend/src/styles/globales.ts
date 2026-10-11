import { createGlobalStyle } from "styled-components";
import { translucido } from "@/styles/theme";

export const EstilosGlobales = createGlobalStyle`
  /* tabular-nums alinea las cifras sin usar monoespaciada */
  body {
    font-variant-numeric: tabular-nums;
  }

  /* fondo estrellado muy tenue para que no compita con los planetas */
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    opacity: 0.22;
    background-image:
      radial-gradient(1px 1px at 8% 12%, ${({ theme }) => theme.colores.tinta}, transparent),
      radial-gradient(1px 1px at 32% 68%, ${({ theme }) => translucido(theme.colores.tinta, 70)}, transparent),
      radial-gradient(1px 1px at 58% 22%, ${({ theme }) => theme.colores.tinta}, transparent),
      radial-gradient(1px 1px at 74% 82%, ${({ theme }) => translucido(theme.colores.tinta, 60)}, transparent),
      radial-gradient(1px 1px at 88% 34%, ${({ theme }) => translucido(theme.colores.tinta, 80)}, transparent),
      radial-gradient(1px 1px at 14% 90%, ${({ theme }) => translucido(theme.colores.tinta, 50)}, transparent);
    background-size: 380px 380px;
  }

  ::selection {
    background: ${({ theme }) => translucido(theme.colores.acento, 28)};
    color: ${({ theme }) => theme.colores.tinta};
  }

  /* foco de teclado siempre visible */
  :focus-visible {
    outline: 1px solid ${({ theme }) => theme.colores.acento};
    outline-offset: 4px;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colores.linea};
  }

  /* quien pide menos movimiento no ve transiciones */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
