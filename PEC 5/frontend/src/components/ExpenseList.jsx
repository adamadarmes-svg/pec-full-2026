import ExpenseItem from './ExpenseItem.jsx';

export default function ExpenseList({ expenses, editingId, onEdit, onDelete }) {
  return (
    <ul className="flex flex-col border-t border-line">
      {expenses.map((expense, index) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          index={index}
          isEditing={expense.id === editingId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
