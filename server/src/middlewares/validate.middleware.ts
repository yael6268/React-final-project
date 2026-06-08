import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject } from 'zod';

// פונקציה שבודקת את רכיבי הבקשה מול חוקי ה-Zod שהגדרנו
export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); // הכל תקין? תמשיך לשלב הבא (ל-Controller)
    } catch (error: any) {
      // אם יש שגיאה, נחזיר אותה בצורה מסודרת לדפדפן
      res.status(400).json({ 
        message: 'הנתונים שהוזנו אינם תקינים', 
        errors: error.errors 
      });
    }
  };