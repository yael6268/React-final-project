import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'כותרת היא שדה חובה' }).min(2, 'כותרת קצרה מדי'),
    amount: z.number({ required_error: 'סכום הוא שדה חובה' }).positive('הסכום חייב להיות חיובי'),
    type: z.enum(['income', 'expense'], { required_error: 'סוג התנועה חייב להיות הכנסה או הוצאה' }),
    category: z.string({ required_error: 'קטגוריה היא שדה חובה' }),
    date: z.string().datetime({ message: 'תאריך לא תקין' }).optional(),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;