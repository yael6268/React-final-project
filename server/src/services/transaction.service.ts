import Transaction from '../models/Transaction.js'; // בהנחה שזה מודל Mongoose

interface FilterOptions {
  page: number;
  limit: number;
  category?: string;
  type?: 'income' | 'expense';
}

export const fetchTransactions = async (userId: string, options: FilterOptions) => {
  const { page, limit, category, type } = options;
  const skip = (page - 1) * limit;

  // בניית אובייקט השילוט (Query) באופן דינמי
  const query: any = { userId };

  if (category) query.category = category;
  if (type) query.type = type;

  // ביצוע השילוט במקביל לקבלת סך הכל תנועות (בשביל הפגינציה בצד הלקוח)
  const [transactions, total] = await Promise.all([
    Transaction.find(query).sort({ date: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments(query)
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};

export const addTransaction = async (userId: string, data: any) => {
  const transaction = new Transaction({
    ...data,
    userId,
    date: data.date || new Date()
  });
  return await transaction.save();
};