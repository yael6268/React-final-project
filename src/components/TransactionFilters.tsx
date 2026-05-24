import React from 'react';
import type { TransactionFilters } from '../types/transaction';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

const categories = ['', 'מזון', 'מגורים', 'תחבורה', 'פנאי', 'קניות', 'בריאות'];

const TransactionFiltersComponent: React.FC<TransactionFiltersProps> = ({ filters, onChange }) => {
  const handleFieldChange = (field: keyof TransactionFilters, value?: string) => {
    onChange({
      ...filters,
      [field]: value,
      page: 1,
    });
  };

  const resetFilters = () => {
    onChange({
      page: 1,
      limit: filters.limit,
    });
  };

  return (
    <section className="space-y-4 p-4 rounded border bg-white shadow-sm">
      <h2 className="text-lg font-semibold">סינון תנועות</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          קטגוריה
          <select
            className="mt-1 w-full rounded border p-2"
            value={filters.category ?? ''}
            onChange={(event) => handleFieldChange('category', event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category || 'כל הקטגוריות'}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          סוג
          <select
            className="mt-1 w-full rounded border p-2"
            value={filters.type ?? ''}
            onChange={(event) => handleFieldChange('type', event.target.value || undefined)}
          >
            <option value="">כל סוגי הפעולות</option>
            <option value="income">הכנסה</option>
            <option value="expense">הוצאה</option>
          </select>
        </label>

        <label className="block">
          מתאריך
          <input
            type="date"
            className="mt-1 w-full rounded border p-2"
            value={filters.fromDate ?? ''}
            onChange={(event) => handleFieldChange('fromDate', event.target.value || undefined)}
          />
        </label>

        <label className="block">
          עד תאריך
          <input
            type="date"
            className="mt-1 w-full rounded border p-2"
            value={filters.toDate ?? ''}
            onChange={(event) => handleFieldChange('toDate', event.target.value || undefined)}
          />
        </label>
      </div>

      <button
        type="button"
        className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
        onClick={resetFilters}
      >
        אפס סינון
      </button>
    </section>
  );
};

export default TransactionFiltersComponent;
