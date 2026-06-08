import React, { useState, useEffect } from 'react';
import * as api from '../services/budgetApi';


interface Budget {
  _id: string;
  category: string;
  limit: number;
  month: number;
  year: number;
}

const BudgetManagementPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Fetch budgets on mount
  useEffect(() => {
    fetchBudgets();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await api.getAllBudgets();
      setBudgets(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category.trim() || !formData.limit) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update
        await api.updateBudget(editingId, {
          category: formData.category,
          limit: parseInt(formData.limit),
          month: formData.month,
          year: formData.year,
        });
        setSuccess('Budget updated successfully!');
      } else {
        // Create
        await api.createBudget({
          category: formData.category,
          limit: parseInt(formData.limit),
          month: formData.month,
          year: formData.year,
        });
        setSuccess('Budget created successfully!');
      }

      await fetchBudgets();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      month: budget.month,
      year: budget.year,
    });
    setEditingId(budget._id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setLoading(true);
      await api.deleteBudget(deleteConfirm.id);
      setSuccess('Budget deleted successfully!');
      await fetchBudgets();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      limit: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setEditingId(null);
    setShowForm(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({ num: i + 1, name: new Date(2000, i).toLocaleDateString('en', { month: 'long' }) }));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>
          Budget Management
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Create, edit, and manage your budgets</p>

        {/* Alerts */}
        {error && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#991b1b' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '0.5rem', color: '#166534' }}>
            {success}
          </div>
        )}

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Form Section */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                + Create Budget
              </button>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>
                  {editingId ? 'Edit Budget' : 'Create Budget'}
                </h3>

                {/* Category */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Food"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Limit */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Budget Limit (ILS)
                  </label>
                  <input
                    type="number"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    placeholder="e.g., 1500"
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Month */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      boxSizing: 'border-box',
                    }}
                  >
                    {months.map((m) => (
                      <option key={m.num} value={m.num}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      boxSizing: 'border-box',
                    }}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    style={{
                      backgroundColor: '#e5e7eb',
                      color: '#333',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Budgets List */}
          <div>
            {loading && !showForm ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
            ) : budgets.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No budgets yet. Create one!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {budgets.map((budget) => (
                  <div key={budget._id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111', margin: 0 }}>
                          {budget.category}
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                          {months.find((m) => m.num === budget.month)?.name} {budget.year}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(budget)}
                          disabled={loading}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#dbeafe',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            color: '#0284c7',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: budget._id, name: budget.category })}
                          disabled={loading}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#fee2e2',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            color: '#dc2626',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem' }}>
                      <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>Budget Limit</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', margin: '0.25rem 0 0 0' }}>
                        {budget.limit} ILS
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              maxWidth: '400px',
              width: '90%',
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>
                Delete Budget?
              </h3>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={loading}
                  style={{
                    backgroundColor: '#e5e7eb',
                    color: '#333',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManagementPage;