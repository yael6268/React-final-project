//const mongoose = require('mongoose');
import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    userId: String,
    category: String,
    limit: Number,
    month: Number,
    year: Number

});

export default mongoose.model('Budget', budgetSchema);
/*זה הטבלה שלי במסד נתונים היא שומרת לי לכל משתמש מה הסכום המקסימלי שהוא יכול להוציא בכל קטגוריה בכל חודש */ 