import React from 'react';
import type { Transaction } from '../types/transaction';

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, loading, onEdit, onDelete }) => {
  if (loading) {
    return <div className="empty-state">טוען תנועות...</div>;
  }

  if (!transactions.length) {
    return <div className="empty-state">לא נמצאו תנועות.</div>;
  }

  return (
    <div className="table-card">
      <div className="table-body">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>תאריך</th>
              <th>קטגוריה</th>
              <th>סוג</th>
              <th>תיאור</th>
              <th>סכום</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{new Date(transaction.date).toLocaleDateString('he-IL')}</td>
                <td>{transaction.category}</td>
                <td>
                  <span className={`transaction-badge ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                    {transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}
                  </span>
                </td>
                <td>{transaction.title}</td>
                <td className={transaction.type === 'income' ? 'summary-positive' : 'summary-negative'}>
                  {transaction.amount.toLocaleString('he-IL')} ₪
                </td>
                <td>
                  <div className="table-actions">
                    {onEdit && (
                      <button type="button" className="action-button edit" onClick={() => onEdit(transaction)}>
                        ערוך
                      </button>
                    )}
                    {onDelete && (
                      <button type="button" className="action-button delete" onClick={() => onDelete(transaction._id)}>
                        מחק
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
