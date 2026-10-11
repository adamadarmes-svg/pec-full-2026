import styled, { keyframes } from "styled-components";
import { translucido } from "@/styles/theme";

interface PropsCargando {
  texto?: string;
}

// animé el punto porque así se ve que algo está pasando
export function Cargando({ texto = "cargando" }: PropsCargando) {
  return (
    <Contenedor role="status">
      <Punto aria-hidden />
      {texto}
    </Contenedor>
  );
}

const latido = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
`;

const Contenedor = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaciado[3]};
  padding: ${({ theme }) => theme.espaciado[8]} 0;
  font-size: ${({ theme }) => theme.tamanos.apoyo};
  color: ${({ theme }) => theme.colores.tintaTenue};
`;

const Punto = styled.span`
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colores.acentoFuerte};
  animation: ${latido} 1.4s ease-in-out infinite;

  &::after {
    content: "";
    position: absolute;
    inset: -200%;
    border-radius: 50%;
    background: radial-gradient(circle, ${({ theme }) => translucido(theme.colores.acento, 40)}, transparent 65%);
    filter: blur(2px);
  }
`;
