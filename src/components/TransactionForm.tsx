import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import type { Transaction } from '../types/transaction';

const formSchema = z.object({
  title: z.string().min(2, 'הכותרת חייבת להכיל לפחות 2 תווים'),
  amount: z.preprocess((val) => Number(val), z.number().positive('הסכום חייב להיות גדול מ-0')),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'חובה לבחור קטגוריה'),
  date: z.string().min(1, 'חובה לבחור תאריך'),
});

type FormData = z.infer<typeof formSchema>;

interface FormProps {
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
  onCancelEdit?: () => void;
}

const TransactionForm: React.FC<FormProps> = ({ onSuccess, transactionToEdit, onCancelEdit }) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<string[]>('/transactions/categories');
        if (mounted && Array.isArray(res.data)) setCategories(res.data);
      } catch (err) {
        // keep hardcoded fallback in case of error
      }
    })();
    return () => { mounted = false; };
  }, []);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema) as Resolver<FormData>,
    defaultValues: { type: 'expense', date: new Date().toISOString().split('T')[0] },
  });

  useEffect(() => {
    if (transactionToEdit) {
      reset({
        title: transactionToEdit.title,
        amount: transactionToEdit.amount,
        type: transactionToEdit.type,
        category: transactionToEdit.category,
        date: transactionToEdit.date.split('T')[0] || transactionToEdit.date,
      });
    } else {
      reset({ type: 'expense', date: new Date().toISOString().split('T')[0] });
    }
  }, [transactionToEdit, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      if (transactionToEdit) {
        await api.put(`/transactions/${transactionToEdit._id}`, data);
      } else {
        await api.post('/transactions', data);
      }

      reset({ type: 'expense', date: new Date().toISOString().split('T')[0] });
      onSuccess();
    } catch (err) {
      alert('שגיאה בשמירת התנועה. נסי שוב.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-tag">טופס תנועה</p>
          <h2 className="section-title">{transactionToEdit ? 'עריכת תנועה קיימת' : 'הוספת תנועה חדשה'}</h2>
        </div>
        {transactionToEdit && onCancelEdit && (
          <button type="button" className="button button-secondary" onClick={onCancelEdit}>
            ביטול עריכה
          </button>
        )}
      </div>

      <div className="form-grid">
        <label className="field-group">
          <span className="field-label">כותרת התנועה</span>
          <input type="text" {...register('title')} className="field-control" />
          <span className="field-note">{errors.title?.message}</span>
        </label>

        <label className="field-group">
          <span className="field-label">סכום</span>
          <input type="number" step="0.01" {...register('amount')} className="field-control" />
          <span className="field-note">{errors.amount?.message}</span>
        </label>

        <label className="field-group">
          <span className="field-label">סוג התנועה</span>
          <select {...register('type')} className="field-control">
            <option value="expense">הוצאה</option>
            <option value="income">הכנסה</option>
          </select>
        </label>

        <label className="field-group">
          <span className="field-label">קטגוריה</span>
          <select {...register('category')} className="field-control">
            <option value="">בחר קטגוריה</option>
            {categories.length ? (
              categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))
            ) : (
              <>
                <option value="מזון">מזון</option>
                <option value="מגורים">חשבונות ומגורים</option>
                <option value="תחבורה">תחבורה</option>
                <option value="פנאי">פנאי</option>
                <option value="בריאות">בריאות</option>
              </>
            )}
          </select>
          <span className="field-note">{errors.category?.message}</span>
        </label>

        <label className="field-group">
          <span className="field-label">תאריך</span>
          <input type="date" {...register('date')} className="field-control" />
          <span className="field-note">{errors.date?.message}</span>
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="button button-primary">
        {isSubmitting ? 'שומר...' : transactionToEdit ? 'עדכן תנועה' : 'הוסף תנועה'}
      </button>
    </form>
  );
};

export default TransactionForm;
