import type { Request, Response } from 'express';
import Transaction from '../src/models/Transaction.ts';
import { z } from 'zod';

// מקור אמת לקטגוריות - ישמש גם להצגה בצד הלקוח וגם לולידציה בצד השרת
const CATEGORIES = ['מזון', 'מגורים', 'תחבורה', 'פנאי', 'בריאות', 'חשבונות'];

// הגדרת ממשק (Interface) לתנועה בודדת - תואם ל-Schema
interface ITransaction {
    category: string;
    amount: number;
    type: 'income' | 'expense';
    date: Date;
    userId: string;
    description?: string;
}

// סכמת ולידציה באמצעות Zod (התאמה של מפתחת 2)
const transactionSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    category: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional()
});

// ==========================================
// 🔥 פונקציות ויזואליזציה וגרפים (מפתחת 3) 🔥
// ==========================================

// 1. פונקציה לחישוב סך הכנסות, הוצאות ויתרה (עבור ה-Summary Cards)
export const getAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const transactions = await Transaction.find({ userId: req.user.id }) as ITransaction[];

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        res.json({
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses
        });
    } catch (err) {
        res.status(500).json({ message: "שגיאה בעיבוד נתוני הסיכום" });
    }
};

// 2. פונקציה לסיכום הוצאות לפי קטגוריות (עבור גרף העוגה)
export const getCategorySummary = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const expenses = await Transaction.find({ userId: req.user.id, type: 'expense' }) as ITransaction[];

        const categoriesMap: Record<string, number> = {};

        expenses.forEach(t => {
            categoriesMap[t.category] = (categoriesMap[t.category] ?? 0) + t.amount;
        });

        const formattedData = Object.keys(categoriesMap).map(cat => ({
            category: cat,
            amount: categoriesMap[cat]
        }));

        res.json(formattedData);
    } catch (err) {
        res.status(500).json({ message: "שגיאה בעיבוד נתוני הקטגוריות" });
    }
};

// 3. פונקציה לקבלת מגמות הוצאות לאורך זמן (עבור הגרף הקווי)
export const getWeeklyTrends = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const expenses = await Transaction.find({ userId: req.user.id, type: 'expense' }).sort({ date: 1 }) as ITransaction[];

        const trendsMap: Record<string, number> = {};

        expenses.forEach(t => {
            const dateObj = new Date(t.date);
            const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

            if (!trendsMap[formattedDate]) {
                trendsMap[formattedDate] = 0;
            }
            trendsMap[formattedDate] += t.amount;
        });

        const formattedTrends = Object.keys(trendsMap).map(dateKey => ({
            date: dateKey,
            amount: trendsMap[dateKey]
        }));

        res.json(formattedTrends);
    } catch (err) {
        res.status(500).json({ message: "שגיאה בעיבוד נתוני מגמות ההוצאה" });
    }
};

// ==========================================
// 🛠️ פונקציות ניהול תנועות גולמיות (מפתחת 2) 🛠️
// ==========================================

// פונקציה לקבלת רשימת עסקאות גולמית ומסוננת
export const getTransactions = async (req: Request, res: Response): Promise<any> => {
    try {
        const { startDate, endDate, fromDate, toDate, category, page = '1', limit = '10' } = req.query;
        const queryStart = (startDate as string) || (fromDate as string);
        const queryEnd = (endDate as string) || (toDate as string);
        
        // ביצוע הולידציה של Zod
        transactionSchema.parse({ startDate: queryStart, endDate: queryEnd, category, page, limit });

        // @ts-ignore
        let query: any = { userId: req.user.id };
        
        if (queryStart && queryEnd) {
            query.date = { $gte: new Date(queryStart), $lte: new Date(queryEnd) };
        } else if (queryStart) {
            query.date = { $gte: new Date(queryStart) };
        } else if (queryEnd) {
            query.date = { $lte: new Date(queryEnd) };
        }
        
        if (category) {
            query.category = category;
        }

        const limitNum = Number(limit);
        const pageNum = Number(page);

        const transactions = await Transaction.find(query).sort({ date: -1 }).limit(limitNum).skip((pageNum - 1) * limitNum);
        const total = await Transaction.countDocuments(query);
        
        res.json({
            transactions,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            totalTransactions: total
        });
    } catch (err) {
        res.status(500).json({ message: "שגיאה בקבלת העסקאות או נתונים לא תקינים" });
    }
};

// פונקציה ליצירת עסקה חדשה
export const createTransaction = async (req: Request, res: Response): Promise<any> => {
    try {
        const { title, amount, type, category, date } = req.body;
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ message: "נא להזין כותרת תקינה לתנועה" });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "נא להזין סכום חיובי ותקין" });
        }
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ message: "סוג התנועה חייב להיות הכנסה או הוצאה" });
        }
        if (category && !CATEGORIES.includes(category)) {
            return res.status(400).json({ message: "קטגוריה לא תקינה" });
        }
        const transaction = new Transaction({
            // @ts-ignore
            userId: req.user.id,
            title,
            amount,
            type,
            category,
            date,
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }   
};

// פונקציה למחיקת עסקה
export const deleteTransaction = async (req: Request, res: Response): Promise<any> => {
    try {
        // @ts-ignore
        const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
        if (!transaction) {
            return res.status(404).json({ message: "העסקה לא נמצאה או שאינה שייכת לך" });
        }
        // שימוש ב-deleteOne במקום remove הישן שלא נתמך ב-TS/Mongoose החדש
        await transaction.deleteOne();
        res.json({ message: "העסקה נמחקה בהצלחה" });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// פונקציה לעדכון עסקה
export const updateTransaction = async (req: Request, res: Response): Promise<any> => {
    try {
        const { title, amount, type, category, date } = req.body;
        if (amount && amount <= 0) {
            return res.status(400).json({ message: "נא להזין סכום חיובי ותקין" });
        }
        if (type && !['income', 'expense'].includes(type)) {
            return res.status(400).json({ message: "סוג התנועה חייב להיות הכנסה או הוצאה" });
        }
        if (category && !CATEGORIES.includes(category)) {
            return res.status(400).json({ message: "קטגוריה לא תקינה" });
        }
        
        // @ts-ignore
        const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
        if (!transaction) {
            return res.status(404).json({ message: "העסקה לא נמצאה או שאינה שייכת לך" });
        }   
        
        transaction.title = title || transaction.title;
        transaction.amount = amount || transaction.amount;
        transaction.type = type || transaction.type;
        transaction.category = category || transaction.category;
        transaction.date = date || transaction.date;
        
        await transaction.save();
        res.json(transaction);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// החזרת רשימת הקטגוריות לשימוש בלקוח
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.json(CATEGORIES);
    } catch (err) {
        res.status(500).json({ message: 'שגיאה בטעינת קטגוריות' });
    }
};