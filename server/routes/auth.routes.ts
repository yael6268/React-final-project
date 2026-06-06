import { Router } from 'express';
import  { register, login } from '../src/controllers/auth.controller.ts';
import { validate } from '../src/middlewares/validate.middleware.ts';
import { registerSchema, loginSchema } from '../src/schemas/user.schema.ts';

const router = Router();

// נתיב הרשמה: קודם בודק וולטרציה, אז מפעיל את הלוגיקה
router.post('/register', validate(registerSchema), register);

// נתיב התחברות: קודם בודק וולטרציה, אז מפעיל את הלוגיקה
router.post('/login', validate(loginSchema), login);

export default router;