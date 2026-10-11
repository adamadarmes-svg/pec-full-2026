import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import styled, { css } from "styled-components";
import { translucido } from "@/styles/theme";

export type VarianteBoton = "primario" | "secundario" | "peligro";

// no animé el hover porque solo animo lo que cambia por una acción
const estiloBoton = css<{ $variante: VarianteBoton }>`
  display: inline-flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.espaciado[2]};
  padding: ${({ theme }) => theme.espaciado[1]} 0;
  border: 0;
  border-radius: 0;
  background: none;
  font-family: ${({ theme }) => theme.fuentes.sans};
  font-size: ${({ theme, $variante }) => ($variante === "primario" ? theme.tamanos.cuerpo : theme.tamanos.apoyo)};
  font-weight: ${({ $variante }) => ($variante === "primario" ? 500 : 400)};
  line-height: 1.4;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.4em;
  cursor: pointer;
  color: ${({ theme, $variante }) =>
    $variante === "primario"
      ? theme.colores.acentoFuerte
      : $variante === "peligro"
        ? theme.colores.peligro
        : theme.colores.tintaTenue};
  text-decoration-color: ${({ theme, $variante }) =>
    translucido(
      $variante === "primario" ? theme.colores.acento : $variante === "peligro" ? theme.colores.peligro : theme.colores.tinta,
      35
    )};

  &:hover:not(:disabled) {
    color: ${({ theme, $variante }) => ($variante === "secundario" ? theme.colores.tinta : undefined)};
    text-decoration-color: currentColor;
  }

  &:disabled {
    cursor: not-allowed;
    color: ${({ theme }) => theme.colores.tintaApagada};
    text-decoration-style: dotted;
  }
`;

const BotonBase = styled.button<{ $variante: VarianteBoton }>`
  ${estiloBoton}
`;

const EnlaceBase = styled(Link)<{ $variante: VarianteBoton }>`
  ${estiloBoton}
`;

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  cargando?: boolean;
  textoCargando?: string;
  children: ReactNode;
}

export function Boton({
  variante = "secundario",
  cargando = false,
  textoCargando,
  disabled,
  type = "button",
  children,
  ...resto
}: PropsBoton) {
  return (
    // lo deshabilito mientras carga para evitar envíos dobles
    <BotonBase $variante={variante} type={type} disabled={disabled || cargando} aria-busy={cargando} {...resto}>
      {cargando && textoCargando ? textoCargando : children}
    </BotonBase>
  );
}

interface PropsEnlaceBoton extends LinkProps {
  variante?: VarianteBoton;
}

// hice un enlace con el mismo aspecto porque navegar tiene que ser un a y no un button
export function EnlaceBoton({ variante = "secundario", ...resto }: PropsEnlaceBoton) {
  return <EnlaceBase $variante={variante} {...resto} />;
}
