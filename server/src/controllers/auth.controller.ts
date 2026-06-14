import type { Request, Response } from 'express'; // הוספנו את המילה type
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.ts'; // הוספנו סיומת .ts בסוף הנתיב
// מפתח סודי להצפנת הטוקן (במציאות שמים אותו בקובץ .env, כאן נשים ברירת מחדל לגיבוי)
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_1234';

// 1. פונקציית הרשמה (Register)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // בדיקה האם המשתמש כבר קיים במערכת
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים במערכת' });
      return;
    }

    // הצפנת הסיסמה (Hashing) לפני השמירה
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // יצירת המשתמש החדש ושמירתו
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'ההרשמה בוצעה בהצלחה!' });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשרת במהלך ההרשמה', error });
  }
};

// 2. פונקציית התחברות (Login)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // חיפוש המשתמש לפי אימייל
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'אימייל או סיסמה אינם נכונים' });
      return;
    }

    // השוואת הסיסמה שהוזנה עם הסיסמה המוצפנת במסד הנתונים
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'אימייל או סיסמה אינם נכונים' });
      return;
    }

    // יצירת טוקן אבטחה (JWT) שתקף ל-24 שעות
    const token = jwt.sign(
      { userId: user._id.toString(), name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // החזרת הטוקן ופרטי המשתמש הבסיסיים חזרה לדפדפן
    res.status(200).json({
      message: 'התחברת בהצלחה!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשרת במהלך ההתחברות', error });
  }
};