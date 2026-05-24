# Developer 2 Scope (Transactions Engine)

## מה רלוונטי לך

את מפתחת 2, ולכן התחום שלך הוא:
- Backend: CRUD של תנועות (יצירה, קריאה, סינון, פגינציה).
- Frontend: טופס הזנת תנועה, סינון לפי קטגוריה, הצגת רשימת תנועות, טבלה או דשבורד תנועות.
- לוודא שהנתונים של המשתמש המחובר מועברים לשרת כדי להחזיר רק את התנועות שלו.

## מה קיים בפרויקט

### Frontend
- `src/components/TransactionForm.tsx` - טופס הזנת תנועה ב-React + React Hook Form
- `src/views/TransactionsPage.tsx` - עמוד תנועות עם סינון לפי קטגוריה ופגינציה
- `src/hooks/useTransactions.ts` - Hook שמבצע קריאת API ל-`/api/transactions` עם פרמטרי סינון

### Backend
- `server/src/controllers/transaction.controller.ts` - קונטרולר לקריאה ויצירה של תנועות
- `server/src/services/transaction.service.ts` - שירות שמיישם פגינציה וסינון ב-MongoDB
- `server/src/schemas/transaction.schema.ts` - סכמת Zod ליצירת תנועה

## מה לא רלוונטי כרגע למפתחת 2

אל תתמקדי ב:
- Auth / JWT / ניהול משתמשים (זה תחום של מפתחת 1)
- ניתוב מוגן / Protected Routes / Sidebar/Navbar
- Dashboard גרפי / גרפים / אנליטיקה מתקדמת (מפתחת 3)
- תקציבים / יעדים / התראות על חריגה (מפתחת 4)
- אינטגרציה עם OpenAI / AI Insights (מפתחת 5)

## נקודות חשובות

- כרגע אין כל מערכת Auth/JWT פעילה בשרת. יש קוד שרומז על `req.user.id`, אבל לא קיים מבנה מלא של התחברות.
- יש קבצי `client/` ו-`server/src/` שנראים כמו חלקים נוספים או ניסויים. `client/` מיותר כרגע כי ה-frontend הפעיל הוא `src/` בשורש. התיקייה ריקה וננעלת על ידי מערכת, לכן הפתרון הוא לסגור תוכניות/קבצים שמסתכלים עליה ואז למחוק אותה.
- אם תעבדי על Backend, רצוי להתחיל מהקובץ `server/src/index.ts` ולא מהקובץ הישן `server/index.ts`.

## המלצה לעבודות הבאות

1. ודאי ש-`/api/transactions` בחיבור לשרת פעילה ומוחזרת בפועל.
2. תוסיפי אפשרות לסינון לפי `type` ו-`date` ב-frontend וב-backend.
3. תוודאי שיש פגינציה ושהעמוד בפועל משתמש בטווחים הנכונים.
4. תעדכני את ה-frontend כך שכל זימון הקטגוריות והתנועה יהיו תואמות לסכמת ה-API.
