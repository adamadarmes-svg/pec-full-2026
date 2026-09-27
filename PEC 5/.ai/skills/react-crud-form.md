# Skill: formulario CRUD reutilizable en React

## Idea
Un único `ExpenseForm` sirve para crear y para editar: si recibe `expense`, rellena los campos y cambia textos y acción.

## Prompt reutilizable
```
Crea un componente React [Entidad]Form que sirva para crear y editar:
- props: expense (opcional), onSubmit(values) async, onCancel
- estado controlado con useState; valores iniciales desde expense o vacíos
- validación en cliente igual que el modelo (reglas: [...]) antes de enviar
- si onSubmit lanza un error con .details, mostrar cada mensaje bajo su campo
- estado isSubmitting para desactivar el botón
- usa un componente Field reutilizable (label + control + error con aria-describedby)
- en el padre, usa key={editing?.id ?? 'new'} para reiniciar el formulario
```

## Trucos aprendidos
- `key` distinto = React monta un componente nuevo → estado reiniciado sin `useEffect`.
- `inputMode="decimal"` en vez de `type="number"`: permite escribir "12,50" con coma en móviles españoles; se convierte con `replace(',', '.')`.
- Tras crear, vaciar el formulario; tras editar, salir del modo edición.
