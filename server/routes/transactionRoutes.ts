import express from 'express';
// Import the actual controller implementation from src so the functions are available at runtime
import * as transactionController from '../src/controllers/transaction.controller.ts';

const router = express.Router();

// ==========================================
// 🛠️ הנתיבים של מפתחת 2 (ניהול עסקאות גולמיות)
// ==========================================
// Basic CRUD handlers that are implemented in the controller
router.get('/', transactionController.getTransactions);
router.get('/categories', transactionController.getCategories);
router.post('/', transactionController.createTransaction);

// If controller provides delete/update, use them; otherwise fallback to 501
if (typeof (transactionController as any).deleteTransaction === 'function') {
	router.delete('/:id', transactionController.deleteTransaction as any);
} else {
	router.delete('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
}

if (typeof (transactionController as any).updateTransaction === 'function') {
	router.put('/:id', transactionController.updateTransaction as any);
} else {
	router.put('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
}

// ==========================================
// 🔥 הנתיבים החדשים שלך (מפתחת 3) עם הגנה של מפתחת 4 🔥
// ==========================================

// נתיב לקבלת סך הכנסות, הוצאות ויתרה (כרטיסיות הסיכום)
// Analytics endpoints are implemented separately in the server entry; provide simple 501 placeholders
router.get('/analytics/summary', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/analytics/category-summary', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/analytics/weekly-trends', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

export default router;