import React, { useMemo } from 'react';
import type { Transaction } from '../types/transaction';

interface TransactionSummaryProps {
  transactions: Transaction[];
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions }) => {
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  const balance = totals.income - totals.expense;

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded border bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">סה"כ הכנסות</p>
        <p className="mt-2 text-2xl font-semibold text-green-600">{totals.income.toLocaleString('he-IL')} ₪</p>
      </div>
      <div className="rounded border bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">סה"כ הוצאות</p>
        <p className="mt-2 text-2xl font-semibold text-red-600">{totals.expense.toLocaleString('he-IL')} ₪</p>
      </div>
      <div className="rounded border bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">יתרה</p>
        <p className={`mt-2 text-2xl font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {balance.toLocaleString('he-IL')} ₪
        </p>
      </div>
    </section>
  );
};

export default TransactionSummary;
