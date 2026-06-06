import { z } from 'zod';

// הגדרת חוקי האימות עבור הרשמה של משתמש חדש
export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'שם הוא שדה חובה' }).min(2, 'השם חייב להכיל לפחות שני תווים'),
    email: z.string({ required_error: 'אימייל הוא שדה חובה' }).email('כתובת האימייל אינה תקינה'),
    password: z.string({ required_error: 'סיסמה היא שדה חובה' }).min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים')
  })
});

// הגדרת חוקי האימות עבור התחברות (Login)
export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'חובה להזין אימייל' }).email('כתובת האימייל אינה תקינה'),
    password: z.string({ required_error: 'חובה להזין סיסמה' })
  })
});