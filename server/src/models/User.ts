import { Schema, model } from 'mongoose';

// 1. הגדרת המבנה (Schema) של המשתמש בתוך מסד הנתונים
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'חובה להזין שם'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'חובה להזין אימייל'],
    unique: true, // מונע הרשמה של אותו אימייל פעמיים
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'חובה להזין סיסמה'],
    minlength: [6, 'הסיסמה חייבת להכיל לפחות 6 תווים']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 2. יצירת המודל מתוך הסכמה וייצוא שלו
const User = model('User', userSchema);
export default User;