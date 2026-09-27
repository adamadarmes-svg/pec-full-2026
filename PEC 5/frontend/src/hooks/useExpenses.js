import { useCallback, useEffect, useState } from 'react';
import { expensesApi } from '../api/expenses.js';

export function useExpenses({ category, month }) {
  const [expenses, setExpenses] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [isSlow, setIsSlow] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const slowTimer = setTimeout(() => setIsSlow(true), 3000);

    setStatus('loading');
    setError('');

    expensesApi
      .list({ category, month }, controller.signal)
      .then(({ data }) => {
        setExpenses(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setStatus('error');
      })
      .finally(() => {
        clearTimeout(slowTimer);
        setIsSlow(false);
      });

    return () => {
      controller.abort();
      clearTimeout(slowTimer);
    };
  }, [category, month, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const createExpense = useCallback(
    async (values) => {
      const result = await expensesApi.create(values);
      reload();
      return result;
    },
    [reload]
  );

  const updateExpense = useCallback(
    async (id, values) => {
      const result = await expensesApi.update(id, values);
      reload();
      return result;
    },
    [reload]
  );

  const deleteExpense = useCallback(async (id) => {
    const result = await expensesApi.remove(id);
    setExpenses((list) => list.filter((expense) => expense.id !== id));
    return result;
  }, []);

  return { expenses, status, error, isSlow, reload, createExpense, updateExpense, deleteExpense };
}
