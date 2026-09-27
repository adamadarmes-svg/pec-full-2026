import { Router } from 'express';
import {
  listExpenses,
  getMeta,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.get('/', listExpenses);
router.post('/', createExpense);
router.get('/meta', getMeta);
router.get('/:id', validateObjectId, getExpense);
router.put('/:id', validateObjectId, updateExpense);
router.delete('/:id', validateObjectId, deleteExpense);

export default router;
