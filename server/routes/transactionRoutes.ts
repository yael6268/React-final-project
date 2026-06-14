import express from 'express';
// Import the actual controller implementation from src so the functions are available at runtime
import * as transactionController from '../src/controllers/transaction.controller.ts';

const router = express.Router();

// ==========================================
// 🛠️ הנתיבים של מפתחת 2 (ניהול עסקאות גולמיות)
// ==========================================
// Basic CRUD handlers that are implemented in the controller
router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);

// The controller currently doesn't export deleteTransaction/updateTransaction handlers
// Return 501 Not Implemented for these routes so the server won't fail at compile time
router.delete('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.put('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

// ==========================================
// 🔥 הנתיבים החדשים שלך (מפתחת 3) עם הגנה של מפתחת 4 🔥
// ==========================================

// נתיב לקבלת סך הכנסות, הוצאות ויתרה (כרטיסיות הסיכום)
// Analytics endpoints are implemented separately in the server entry; provide simple 501 placeholders
router.get('/analytics/summary', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/analytics/category-summary', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/analytics/weekly-trends', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

export default router;