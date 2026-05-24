import React from 'react';
import type { Transaction } from '../types/transaction';

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, loading }) => {
  if (loading) {
    return <div className="p-4 text-center text-gray-600">טוען תנועות...</div>;
  }

  if (transactions.length === 0) {
    return <div className="p-4 text-center text-gray-600">לא נמצאו תנועות לעדכון.</div>;
  }

  return (
    <div className="overflow-x-auto rounded border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-right">
          <tr>
            <th className="px-4 py-3 text-gray-600">תאריך</th>
            <th className="px-4 py-3 text-gray-600">קטגוריה</th>
            <th className="px-4 py-3 text-gray-600">סוג</th>
            <th className="px-4 py-3 text-gray-600">תיאור</th>
            <th className="px-4 py-3 text-gray-600">סכום</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td className="px-4 py-3">{new Date(transaction.date).toLocaleDateString('he-IL')}</td>
              <td className="px-4 py-3">{transaction.category}</td>
              <td className="px-4 py-3">{transaction.type === 'income' ? 'הכנסה' : 'הוצאה'}</td>
              <td className="px-4 py-3">{transaction.title}</td>
              <td className={`px-4 py-3 font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.amount.toLocaleString('he-IL')} ₪
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
