import express from 'express';
// ייבוא כל הפונקציות מהקונטרולר תחת אובייקט אחד שנקרא transactionController
import * as transactionController from '../controller/transactionController';
// ייבוא ה-Middleware של מפתחת 4
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// ==========================================
// 🛠️ הנתיבים של מפתחת 2 (ניהול עסקאות גולמיות)
// ==========================================
router.get('/', authMiddleware, transactionController.getTransactions);
router.post('/', authMiddleware, transactionController.createTransaction);
router.delete('/:id', authMiddleware, transactionController.deleteTransaction);
router.put('/:id', authMiddleware, transactionController.updateTransaction);

// ==========================================
// 🔥 הנתיבים החדשים שלך (מפתחת 3) עם הגנה של מפתחת 4 🔥
// ==========================================

// נתיב לקבלת סך הכנסות, הוצאות ויתרה (כרטיסיות הסיכום)
router.get('/analytics/summary', authMiddleware, transactionController.getAnalyticsSummary);

// נתיב לקבלת סיכום לפי קטגוריות (גרף עוגה)
router.get('/analytics/category-summary', authMiddleware, transactionController.getCategorySummary);

// נתיב לקבלת מגמות הוצאות (גרף קווי)
router.get('/analytics/weekly-trends', authMiddleware, transactionController.getWeeklyTrends);

export default router;