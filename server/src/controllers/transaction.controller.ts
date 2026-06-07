import type { Request, Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service.ts';

export const getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id; // מגיע מהמידלוור של מפתחת 1
    
    // שליפת פרמטרים לפגינציה וסינון
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const type = req.query.type as 'income' | 'expense';

    const data = await transactionService.fetchTransactions(userId, { page, limit, category, type });
    
    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error); // מעביר ל-Error Handler המרכזי
  }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const transactionData = req.body;

    const newTransaction = await transactionService.addTransaction(userId, transactionData);
    res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    next(error);
  }
};