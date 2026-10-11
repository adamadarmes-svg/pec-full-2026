import type { ReactNode } from "react";
import styled from "styled-components";

export type VarianteAlerta = "error" | "exito" | "informacion";

interface PropsAlerta {
  variante?: VarianteAlerta;
  children: ReactNode;
}

// uso role alert para que el lector de pantalla lo anuncie al aparecer
export function Alerta({ variante = "informacion", children }: PropsAlerta) {
  return (
    <Mensaje role={variante === "error" ? "alert" : "status"} $variante={variante}>
      {children}
    </Mensaje>
  );
}

const Mensaje = styled.div<{ $variante: VarianteAlerta }>`
  max-width: 62ch;
  padding: ${({ theme }) => theme.espaciado[1]} 0 ${({ theme }) => theme.espaciado[1]} ${({ theme }) => theme.espaciado[4]};
  border-left: 1px solid
    ${({ theme, $variante }) =>
      $variante === "error" ? theme.colores.peligro : $variante === "exito" ? theme.colores.acento : theme.colores.lineaFuerte};
  font-size: ${({ theme }) => theme.tamanos.cuerpo};
  color: ${({ theme, $variante }) => ($variante === "error" ? theme.colores.peligro : theme.colores.tinta)};

  p {
    margin: 0;
  }

  p + p,
  p + * {
    margin-top: ${({ theme }) => theme.espaciado[3]};
  }
`;
