import styled from "styled-components";

// lo hice solo con tipografía porque cambiar de estilo dentro de la palabra ya basta
export function Logo() {
  return (
    <Marca>
      exo<Cursiva>archive</Cursiva>
    </Marca>
  );
}

const Marca = styled.span`
  font-family: ${({ theme }) => theme.fuentes.serif};
  font-size: 1.75rem;
  line-height: 1;
  letter-spacing: ${({ theme }) => theme.tracking.titular};
  color: ${({ theme }) => theme.colores.tinta};
`;

const Cursiva = styled.em`
  font-style: italic;
  color: ${({ theme }) => theme.colores.acentoFuerte};
`;
