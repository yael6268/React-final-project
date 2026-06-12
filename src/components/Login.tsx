import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom'; // ✅ הוספנו את ה-Import הזה
import { useAuth } from '../context/AuthContext'; // ✅ הוספנו את ה-Import הזה

const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth(); // ✅ הוספנו את השורה הזו
  const navigate = useNavigate(); // ✅ הוספנו את השורה הזו

  const [serverMessage, setServerMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'שגיאה בהתחברות. בדקי את הפרטים.');
      }

      setIsError(false);
      
      // After login, go to the budget page and keep the logged-in user id for API calls
      login(resData.token, resData.user?.id);
      navigate('/budget');
      
    } catch (error: any) {
      setIsError(true);
      setServerMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2>התחברות למערכת</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>אימייל:</label>
          <input
            type="email"
            {...register('email')}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: errors.email ? '1px solid red' : '1px solid #ccc' }}
          />
          {errors.email && <p style={{ color: 'red', margin: '5px 0 0 0', fontSize: '12px' }}>{errors.email.message}</p>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>סיסמה:</label>
          <input
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: errors.password ? '1px solid red' : '1px solid #ccc' }}
          />
          {errors.password && <p style={{ color: 'red', margin: '5px 0 0 0', fontSize: '12px' }}>{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ padding: '10px', backgroundColor: isLoading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? 'מתחבר...' : 'התחבר'}
        </button>
      </form>

      {serverMessage && (
        <div style={{ marginTop: '20px', padding: '10px', borderRadius: '4px', backgroundColor: isError ? '#f8d7da' : '#d4edda', color: isError ? '#721c24' : '#155724' }}>
          {serverMessage}
        </div>
      )}
    </div>
  );
}