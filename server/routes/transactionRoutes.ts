import express from 'express';
// ייבוא כל הפונקציות מהקונטרולר תחת אובייקט אחד שנקרא transactionController
import * as transactionController from '../controllers/transactionController.ts';

const router = express.Router();

// ==========================================
// 🛠️ הנתיבים של מפתחת 2 (ניהול עסקאות גולמיות)
// ==========================================
router.get('/', transactionController.getTransactions);
router.get('/categories', transactionController.getCategories);
router.post('/', transactionController.createTransaction);
router.delete('/:id',  transactionController.deleteTransaction);
router.put('/:id', transactionController.updateTransaction);

// ==========================================
// 🔥 הנתיבים החדשים שלך (מפתחת 3) עם הגנה של מפתחת 4 🔥
// ==========================================

// נתיב לקבלת סך הכנסות, הוצאות ויתרה (כרטיסיות הסיכום)
router.get('/analytics/summary', transactionController.getAnalyticsSummary);

// נתיב לקבלת סיכום לפי קטגוריות (גרף עוגה)
router.get('/analytics/category-summary', transactionController.getCategorySummary);

// נתיב לקבלת מגמות הוצאות (גרף קווי)
router.get('/analytics/weekly-trends', transactionController.getWeeklyTrends);

export default router;