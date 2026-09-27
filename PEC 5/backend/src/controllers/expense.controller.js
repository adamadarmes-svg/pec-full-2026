import { Expense, CATEGORIES, PAYMENT_METHODS } from '../models/Expense.js';
import { HttpError } from '../middleware/errorHandler.js';

const ALLOWED_FIELDS = ['title', 'amount', 'category', 'date', 'paymentMethod', 'notes'];

function pickAllowed(body = {}) {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
}

export async function listExpenses(req, res) {
  const { category, month } = req.query;
  const filter = {};

  if (category) {
    if (!CATEGORIES.includes(category)) {
      throw new HttpError(400, `Categoría no válida: ${category}`);
    }
    filter.category = category;
  }

  if (month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new HttpError(400, 'El mes debe tener el formato AAAA-MM');
    }
    const [year, monthNumber] = month.split('-').map(Number);
    filter.date = {
      $gte: new Date(Date.UTC(year, monthNumber - 1, 1)),
      $lt: new Date(Date.UTC(year, monthNumber, 1)),
    };
  }

  const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({ data: expenses, count: expenses.length });
}

export function getMeta(_req, res) {
  res.json({ data: { categories: CATEGORIES, paymentMethods: PAYMENT_METHODS } });
}

export async function getExpense(req, res) {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new HttpError(404, 'Gasto no encontrado');
  res.json({ data: expense });
}

export async function createExpense(req, res) {
  const expense = await Expense.create(pickAllowed(req.body));
  res.status(201).json({ data: expense, message: 'Gasto creado' });
}

export async function updateExpense(req, res) {
  const updates = pickAllowed(req.body);
  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No se ha enviado ningún campo para actualizar');
  }

  const expense = await Expense.findByIdAndUpdate(req.params.id, updates, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!expense) throw new HttpError(404, 'Gasto no encontrado');
  res.json({ data: expense, message: 'Gasto actualizado' });
}

export async function deleteExpense(req, res) {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) throw new HttpError(404, 'Gasto no encontrado');
  res.json({ data: { id: req.params.id }, message: 'Gasto eliminado' });
}
