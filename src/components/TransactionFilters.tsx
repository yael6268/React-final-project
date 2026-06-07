import React, { useEffect, useState } from 'react';
import type { TransactionFilters } from '../types/transaction';
import api from '../services/api';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

// categories will be fetched from server; include empty option at runtime

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ filters, onChange }) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<string[]>('/transactions/categories');
        if (mounted && Array.isArray(res.data)) setCategories(res.data);
      } catch (err) {
        // fallback — keep empty list
      }
    })();
    return () => { mounted = false; };
  }, []);
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
    <section className="panel panel-muted">
      <div className="panel-header">
        <div>
          <p className="panel-tag">פילוח חכם</p>
          <h2 className="section-title">סינון תנועות</h2>
        </div>
        <button type="button" className="button button-secondary" onClick={resetFilters}>
          אפס סינון
        </button>
      </div>

      <div className="form-grid">
        <label className="field-group">
          <span className="field-label">קטגוריה</span>
          <select
            className="field-control"
            value={filters.category ?? ''}
            onChange={(event) => handleFieldChange('category', event.target.value || undefined)}
          >
            <option value="">כל הקטגוריות</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>

        <label className="field-group">
          <span className="field-label">סוג תנועה</span>
          <select
            className="field-control"
            value={filters.type ?? ''}
            onChange={(event) => handleFieldChange('type', event.target.value || undefined)}
          >
            <option value="">כל סוגי הפעולות</option>
            <option value="income">הכנסה</option>
            <option value="expense">הוצאה</option>
          </select>
        </label>

        <label className="field-group">
          <span className="field-label">מתאריך</span>
          <input
            type="date"
            className="field-control"
            value={filters.fromDate ?? ''}
            onChange={(event) => handleFieldChange('fromDate', event.target.value || undefined)}
          />
        </label>

        <label className="field-group">
          <span className="field-label">עד תאריך</span>
          <input
            type="date"
            className="field-control"
            value={filters.toDate ?? ''}
            onChange={(event) => handleFieldChange('toDate', event.target.value || undefined)}
          />
        </label>
      </div>
    </section>
  );
};

export default TransactionFilters;
