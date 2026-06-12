import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. הגדרת חוקי הולידציה של הטופס באמצעות Zod (בול כמו שביקשו!)
const registerSchema = z.object({
  name: z.string().min(2, 'שם משתמש חייב להכיל לפחות 2 תווים'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

// יצירת טיפוס (Type) מתוך הסכמה של Zod
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [serverMessage, setServerMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // חיווי טעינה (Loading state) מההנחיות!

  // 2. שימוש ב-React Hook Form עם ה-Resolver של Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // 3. פונקציית שליחת הטופס לשרת
  const onSubmit = async (data: RegisterFormData) => {
    setServerMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      let resData: any = {};
      try {
        resData = await response.json();
      } catch {
        resData = {};
      }

      if (!response.ok) {
        throw new Error(resData.message || 'משהו השתבש בהרשמה');
      }

      setIsError(false);
      setServerMessage('ההרשמה הצליחה! עכשיו אפשר להתחבר.');
      reset();
    } catch (error: any) {
      setIsError(true);
      const message = error instanceof TypeError && error.message.includes('Failed to fetch')
        ? 'השרת לא זמין כרגע. נסי לנסות שוב בעוד מספר רגעים.'
        : error.message || 'שגיאה בהרשמה.';
      setServerMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2>הרשמה למערכת</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* שדה שם משתמש */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>שם משתמש:</label>
          <input
            type="text"
            {...register('name')}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: errors.name ? '1px solid red' : '1px solid #ccc' }}
          />
          {errors.name && <p style={{ color: 'red', margin: '5px 0 0 0', fontSize: '12px' }}>{errors.name.message}</p>}
        </div>

        {/* שדה אימייל */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>אימייל:</label>
          <input
            type="email"
            {...register('email')}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: errors.email ? '1px solid red' : '1px solid #ccc' }}
          />
          {errors.email && <p style={{ color: 'red', margin: '5px 0 0 0', fontSize: '12px' }}>{errors.email.message}</p>}
        </div>

        {/* שדה סיסמה */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>סיסמה:</label>
          <input
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: errors.password ? '1px solid red' : '1px solid #ccc' }}
          />
          {errors.password && <p style={{ color: 'red', margin: '5px 0 0 0', fontSize: '12px' }}>{errors.password.message}</p>}
        </div>

        {/* כפתור שליחה עם חיווי טעינה */}
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ padding: '10px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? 'רושם משתמש...' : 'הירשם'}
        </button>
      </form>

      {/* חיווי שגיאות/הצלחה מהשרת (Error State) */}
      {serverMessage && (
        <div style={{ marginTop: '20px', padding: '10px', borderRadius: '4px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724' }}>
          {serverMessage}
        </div>
      )}
    </div>
  );
}