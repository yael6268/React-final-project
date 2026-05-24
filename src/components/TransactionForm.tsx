import React from 'react';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';

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
}

const TransactionForm: React.FC<FormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema) as Resolver<FormData>,
    defaultValues: { type: 'expense', date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await api.post('/transactions', data);
      reset();
      onSuccess();
    } catch (err) {
      alert('שגיאה בהוספת התנועה');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded border bg-white p-4 shadow-sm">
      <div>
        <label className="block text-sm font-medium">תיאור התנועה</label>
        <input {...register('title')} className="mt-1 block w-full rounded border p-2" />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="block text-sm font-medium">סכום</span>
          <input type="number" step="0.01" {...register('amount')} className="mt-1 w-full rounded border p-2" />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
        </label>

        <label className="block">
          <span className="block text-sm font-medium">סוג פעולה</span>
          <select {...register('type')} className="mt-1 w-full rounded border p-2">
            <option value="expense">הוצאה</option>
            <option value="income">הכנסה</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="block text-sm font-medium">קטגוריה</span>
          <select {...register('category')} className="mt-1 w-full rounded border p-2">
            <option value="">בחר קטגוריה</option>
            <option value="מזון">מזון</option>
            <option value="מגורים">חשבונות ומגורים</option>
            <option value="תחבורה">תחבורה</option>
            <option value="פנאי">פנאי</option>
            <option value="בריאות">בריאות</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
        </label>

        <label className="block">
          <span className="block text-sm font-medium">תאריך</span>
          <input type="date" {...register('date')} className="mt-1 w-full rounded border p-2" />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
        {isSubmitting ? 'שומר...' : 'הוסף תנועה'}
      </button>
    </form>
  );
};

export default TransactionForm;
