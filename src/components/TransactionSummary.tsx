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
    <section className="summary-cards">
      <div className="summary-card">
        <span className="summary-label">סה"כ הכנסות</span>
        <p className="summary-value summary-positive">{totals.income.toLocaleString('he-IL')} ₪</p>
      </div>

      <div className="summary-card">
        <span className="summary-label">סה"כ הוצאות</span>
        <p className="summary-value summary-negative">{totals.expense.toLocaleString('he-IL')} ₪</p>
      </div>

      <div className="summary-card">
        <span className="summary-label">יתרה</span>
        <p className={`summary-value ${balance >= 0 ? 'summary-positive' : 'summary-negative'}`}>{balance.toLocaleString('he-IL')} ₪</p>
      </div>
    </section>
  );
};

export default TransactionSummary;
