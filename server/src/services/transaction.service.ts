import Transaction from '../models/Transaction.ts'; // בהנחה שזה מודל Mongoose

interface FilterOptions {
  page: number;
  limit: number;
  category?: string;
  type?: 'income' | 'expense';
  fromDate?: string;
  toDate?: string;
}

export const fetchTransactions = async (userId: string, options: FilterOptions) => {
  const { page, limit, category, type, fromDate, toDate } = options;
  const skip = (page - 1) * limit;

  // בניית אובייקט השילוט (Query) באופן דינמי
  const query: any = { userId };

  if (category) query.category = category;
  if (type) query.type = type;
  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) {
      const start = new Date(fromDate);
      if (!isNaN(start.getTime())) query.date.$gte = start;
    }
    if (toDate) {
      const end = new Date(toDate);
      if (!isNaN(end.getTime())) {
        // include end of day
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    // if no valid date parsed, delete date filter
    if (Object.keys(query.date).length === 0) delete query.date;
  }

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