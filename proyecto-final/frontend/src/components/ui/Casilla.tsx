import { type InputHTMLAttributes, useId } from "react";
import styled from "styled-components";

interface PropsCasilla extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  etiqueta: string;
}

// dejé el input nativo sin apariencia para no perder teclado ni accesibilidad
export function Casilla({ etiqueta, id, ...resto }: PropsCasilla) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;

  return (
    <Fila htmlFor={idCampo}>
      <Cuadro id={idCampo} type="checkbox" {...resto} />
      {etiqueta}
    </Fila>
  );
}

const Fila = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaciado[3]};
  font-size: ${({ theme }) => theme.tamanos.apoyo};
  color: ${({ theme }) => theme.colores.tintaTenue};
  cursor: pointer;
`;

const Cuadro = styled.input`
  appearance: none;
  flex: none;
  width: 0.875rem;
  height: 0.875rem;
  margin: 0;
  border: 1px solid ${({ theme }) => theme.colores.lineaFuerte};
  border-radius: ${({ theme }) => theme.radios.fino};
  background: transparent;
  cursor: pointer;

  &:checked {
    border-color: ${({ theme }) => theme.colores.acento};
    background: ${({ theme }) => theme.colores.acento};
  }
`;
