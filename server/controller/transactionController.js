const { error } = require('node:console');
const Transection = require('../models/Transaction');
const { z } = require('zod');

const transactionSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    category: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional()
});

exports.getTransactions = async (req, res) => {
    try {
        const {startDate, endDate ,category, page = 1, limit = 10} = req.query;
        const { error } = transactionSchema.parse({ startDate, endDate, category, page, limit });
        if (error) {
            return res.status(400).json({ message: "נתונים לא תקינים" });
        }
        let query = { userId: req.user.id };
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (startDate) {
            query.date = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.date = { $lte: new Date(endDate) };
        }
        if(category){
            query.category = category;
        }
        const transactions = await Transection.find(query).sort({ date: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await Transection.countDocuments(query);
        res.json({
            transactions,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            totalTransactions: total
        });
    } catch (err) {
        res.status(500).json({ message: "שגיאה בקבלת העסקאות"  });
    }
};


exports.createTransaction = async (req, res) => {
    try {
        const { amount, type, category, date, description } = req.body;
        if (!amount || amount <= 0) {
        return res.status(400).json({ message: "נא להזין סכום חיובי ותקין" });
        }
        if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "סוג התנועה חייב להיות הכנסה או הוצאה" });
        }
        const transaction = new Transection({
            userId: req.user.id,
            amount,
            type,
            category,
            date,
            description
        });
        await transaction.save();
        res.status(201).json(transaction);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }   
};

exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transection.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: " העסקה לא נמצאה" });
        }
        await transaction.remove();
        res.json({ message: " העסקה נמחקה בהצלחה" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { amount, type, category, date, description } = req.body;
        if (amount && amount <= 0) {
            return res.status(400).json({ message: "נא להזין סכום חיובי ותקין" });
        }
        if (type && !['income', 'expense'].includes(type)) {
            return res.status(400).json({ message: "סוג התנועה חייב להיות הכנסה או הוצאה" });
        }
        const transaction = await Transection.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: "העסקה לא נמצאה" });
        }   
        transaction.amount = amount || transaction.amount;
        transaction.type = type || transaction.type;
        transaction.category = category || transaction.category;
        transaction.date = date || transaction.date;
        transaction.description = description || transaction.description;
        await transaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

