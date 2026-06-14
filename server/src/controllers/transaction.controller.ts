import type { Request, Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service.ts';
import Category from '../models/Category.ts';

export const getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    
    // שליפת פרמטרים לפגינציה וסינון
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const type = req.query.type as 'income' | 'expense';
    const fromDate = req.query.fromDate as string | undefined;
    const toDate = req.query.toDate as string | undefined;

    const data = await transactionService.fetchTransactions(userId, {
      page,
      limit,
      ...(category ? { category } : {}),
      ...(type ? { type } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {})
    });
    
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
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const transactionData = req.body;

    const newTransaction = await transactionService.addTransaction(userId, transactionData);
    res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cats = await Category.find().sort({ name: 1 }).select('name -_id');
    res.status(200).json(cats.map((c: any) => c.name));
  } catch (err) {
    next(err);
  }
};