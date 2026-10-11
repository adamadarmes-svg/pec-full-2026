import { type SelectHTMLAttributes, useId } from "react";
import styled from "styled-components";
import { Descripcion, Envoltorio, Etiqueta, estiloLinea } from "@/components/ui/Campo";
import type { Opcion } from "@/types";

interface PropsSelector<T extends string> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  etiqueta: string;
  opciones: Opcion<T>[];
  // si no la paso no hay opción vacía
  opcionVacia?: string;
  error?: string;
}

// usé el select nativo porque funciona mejor en móvil y es accesible
export function Selector<T extends string>({ etiqueta, opciones, opcionVacia, error, id, ...resto }: PropsSelector<T>) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const idError = error ? `${idCampo}-error` : undefined;

  return (
    <Envoltorio>
      <Etiqueta htmlFor={idCampo}>{etiqueta}</Etiqueta>
      <Seleccion id={idCampo} aria-invalid={Boolean(error)} aria-describedby={idError} {...resto}>
        {opcionVacia !== undefined && <option value="">{opcionVacia}</option>}
        {opciones.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Seleccion>
      {error && (
        <Descripcion id={idError} $error>
          {error}
        </Descripcion>
      )}
    </Envoltorio>
  );
}

const Seleccion = styled.select`
  ${estiloLinea}
  appearance: none;
  padding-right: ${({ theme }) => theme.espaciado[6]};
  cursor: pointer;
  /* dibujé la flecha con degradados para no cargar una imagen */
  background-image:
    linear-gradient(45deg, transparent 50%, ${({ theme }) => theme.colores.tintaTenue} 50%),
    linear-gradient(135deg, ${({ theme }) => theme.colores.tintaTenue} 50%, transparent 50%);
  background-position:
    calc(100% - 9px) 55%,
    calc(100% - 5px) 55%;
  background-size: 4px 4px;
  background-repeat: no-repeat;

  /* les pongo fondo oscuro porque si no salen en blanco */
  option {
    background-color: ${({ theme }) => theme.colores.fondo};
    color: ${({ theme }) => theme.colores.tinta};
  }
`;
