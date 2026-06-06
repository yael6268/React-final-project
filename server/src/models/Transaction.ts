import mongoose, { type Document, type Model, Schema } from 'mongoose';

export interface TransactionDoc extends Document {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  userId: string;
}

const transactionSchema = new Schema<TransactionDoc>({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true },
}, {
  timestamps: true,
});

const Transaction = (mongoose.models.Transaction as Model<TransactionDoc>) || mongoose.model<TransactionDoc>('Transaction', transactionSchema);

export default Transaction;
