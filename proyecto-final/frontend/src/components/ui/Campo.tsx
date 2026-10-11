import { type InputHTMLAttributes, type TextareaHTMLAttributes, useId } from "react";
import styled, { css } from "styled-components";

interface PropsComunes {
  etiqueta: string;
  ayuda?: string;
  error?: string;
}


export function Campo({ etiqueta, ayuda, error, id, ...resto }: PropsComunes & InputHTMLAttributes<HTMLInputElement>) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const { idDescripcion, descripcion } = crearDescripcion(idCampo, ayuda, error);

  return (
    <Envoltorio>
      <Etiqueta htmlFor={idCampo}>{etiqueta}</Etiqueta>
      <Entrada id={idCampo} aria-invalid={Boolean(error)} aria-describedby={idDescripcion} {...resto} />
      {descripcion}
    </Envoltorio>
  );
}

export function CampoTexto({
  etiqueta,
  ayuda,
  error,
  id,
  ...resto
}: PropsComunes & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const { idDescripcion, descripcion } = crearDescripcion(idCampo, ayuda, error);

  return (
    <Envoltorio>
      <Etiqueta htmlFor={idCampo}>{etiqueta}</Etiqueta>
      <AreaTexto id={idCampo} aria-invalid={Boolean(error)} aria-describedby={idDescripcion} {...resto} />
      {descripcion}
    </Envoltorio>
  );
}

// el error sustituye a la ayuda para no distraer con dos mensajes
function crearDescripcion(idCampo: string, ayuda?: string, error?: string) {
  const texto = error ?? ayuda;
  const idDescripcion = texto ? `${idCampo}-descripcion` : undefined;
  const descripcion = texto ? (
    <Descripcion id={idDescripcion} $error={Boolean(error)}>
      {texto}
    </Descripcion>
  ) : null;
  return { idDescripcion, descripcion };
}

export const Envoltorio = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaciado[2]};
  min-width: 0;
`;

export const Etiqueta = styled.label`
  font-size: ${({ theme }) => theme.tamanos.apoyo};
  color: ${({ theme }) => theme.colores.tintaTenue};
`;

export const Descripcion = styled.p<{ $error: boolean }>`
  margin: 0;
  font-size: ${({ theme }) => theme.tamanos.apoyo};
  color: ${({ theme, $error }) => ($error ? theme.colores.peligro : theme.colores.tintaApagada)};
`;

// lo comparto con Selector para que todos los campos se vean iguales
export const estiloLinea = css`
  width: 100%;
  padding: ${({ theme }) => theme.espaciado[2]} 0;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colores.linea};
  border-radius: 0;
  background: transparent;
  font-family: ${({ theme }) => theme.fuentes.sans};
  font-size: ${({ theme }) => theme.tamanos.cuerpo};
  color: ${({ theme }) => theme.colores.tinta};

  &::placeholder {
    color: ${({ theme }) => theme.colores.tintaApagada};
  }

  /* la línea iluminada sustituye al contorno de foco */
  &:focus,
  &:focus-visible {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colores.acentoFuerte};
  }

  &[aria-invalid="true"] {
    border-bottom-color: ${({ theme }) => theme.colores.peligro};
  }

  &:disabled {
    color: ${({ theme }) => theme.colores.tintaApagada};
  }
`;

const Entrada = styled.input`
  ${estiloLinea}

  /* quité las flechas porque no encajaban con la línea */
  &[type="number"] {
    appearance: textfield;
  }
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }
`;

const AreaTexto = styled.textarea`
  ${estiloLinea}
  min-height: 7rem;
  /* quité el tirador porque rompía la línea y el ritmo del formulario */
  resize: none;
  line-height: 1.6;
`;
