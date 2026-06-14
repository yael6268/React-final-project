import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTransactions, createTransaction, getCategories } from './controllers/transaction.controller.ts';
import { seedCategories } from './seed/seedCategories.ts';
// 🔥 הוספנו: ייבוא של פונקציית אימות JWT אמיתית
import { authenticateToken } from './middlewares/auth.middleware.ts';
// 🔥 הוספנו: ייבוא של פונקציות ההרשמה וההתחברות שלך
import { register, login } from './controllers/auth.controller.ts';
import budgetRoutes from '../routes/budgetRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug: show which .env path is loaded and whether MONGODB_URI is present (masked)
const envPath = path.resolve(__dirname, '../../.env');
try {
  const uri = process.env.MONGODB_URI;
  const masked = uri ? uri.replace(/:(?:[^:@]+)@/, ':****@') : undefined;
  console.log('Loaded .env from:', envPath);
  console.log('MONGODB_URI present:', !!uri, masked ? `${masked.slice(0, 80)}...` : '');
} catch (e) {
  console.warn('Failed to read MONGODB_URI from env', e);
}

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

app.use(cors());
app.use(express.json());

// 🔥 הוספנו: הנתיבים האמיתיים של ההרשמה וההתחברות למערכת
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.use('/api/budgets', budgetRoutes);

app.use('/api/transactions', authenticateToken);
app.get('/api/transactions', getTransactions);
app.post('/api/transactions', createTransaction);
app.get('/api/transactions/categories', getCategories);

app.get('/api/analytics/category-summary', (_req: Request, res: Response) => {
  res.json([
    { category: 'מזון', amount: 1500 },
    { category: 'חשבונות', amount: 900 },
    { category: 'רכב', amount: 600 },
    { category: 'פנאי', amount: 400 },
  ]);
});

app.get('/api/analytics/weekly-trends', (_req: Request, res: Response) => {
  res.json([
    { date: 'א׳', amount: 500 },
    { date: 'ב׳', amount: 650 },
    { date: 'ג׳', amount: 450 },
    { date: 'ד׳', amount: 780 },
    { date: 'ה׳', amount: 920 },
    { date: 'ו׳', amount: 1100 },
    { date: 'ש׳', amount: 800 },
  ]);
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const startServer = async () => {
  try {
    const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/transactions';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    // seed default categories if needed
    await seedCategories();
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();