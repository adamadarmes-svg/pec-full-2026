# Skill: revisión responsive a detalle

Checklist de lo que **suele fallar** en responsive y cómo está resuelto en este proyecto.

| # | Fallo típico | Cómo comprobarlo | Solución aplicada |
| --- | --- | --- | --- |
| R1 | Scroll horizontal en móvil | DevTools 375 px: `document.documentElement.scrollWidth === innerWidth` | `min-w-0` en hijos de grid/flex, `break-words` en títulos |
| R2 | Textos largos que rompen la fila | Gasto con título de 60+ caracteres | `min-w-0 flex-1` + `break-words`; importe con `whitespace-nowrap` |
| R3 | iOS hace zoom al tocar un input | Inputs con fuente < 16 px | `text-base` (16 px) en todos los inputs |
| R4 | Botones pequeños para el dedo | Altura < 44 px | `min-h-11` (44 px) en botones e inputs |
| R5 | Formulario de edición fuera de la vista en móvil | Pulsar "Editar" en un gasto del final | `scrollIntoView` + `scroll-mt-4` |
| R6 | Columnas apretadas en pantallas pequeñas | 320–420 px | Grid de 1 columna hasta 420 px, 2 columnas después |
| R7 | Panel pegajoso que tapa contenido en móvil | Scroll en móvil | `lg:sticky` solo en escritorio |
| R8 | Cifras grandes desbordando | Total de 6 cifras a 320 px | `text-5xl` en móvil, `sm:text-7xl`, `break-words` |
| R9 | Números que "bailan" al cambiar | Lista de importes | `font-variant-numeric: tabular-nums` (`.tabular`) |
| R10 | Altura 100vh con la barra del navegador móvil | Safari iOS | `min-h-dvh` |
| R11 | Foco invisible con teclado | Tabulador | `:focus-visible` con contorno |
| R12 | Animaciones molestas | "Reducir movimiento" del sistema | `prefers-reduced-motion` |

## Prompt reutilizable
```
Revisa este componente para responsive entre 320 px y 1440 px con esta checklist: [pegar tabla].
Para cada punto: ¿cumple? Si no, la clase de Tailwind mínima que lo arregla.
```
