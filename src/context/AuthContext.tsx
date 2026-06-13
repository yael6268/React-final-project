import React, { createContext, useContext, useState, useEffect } from 'react';

// הגדרת הטיפוסים של הסטייט הגלובלי
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  login: (token: string, userId?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUserIdFromToken = (token: string | null) => {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.userId || decoded.id || null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // בבדיקה ראשונית: האם המשתמש כבר מחובר (יש טוקן בדפדפן)?
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userId') || getUserIdFromToken(savedToken);

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUserId) {
      localStorage.setItem('userId', savedUserId);
      setUserId(savedUserId);
    } else {
      localStorage.removeItem('userId');
      setUserId(null);
    }

    setLoading(false);
  }, []);

  const login = (newToken: string, newUserId?: string) => {
    const resolvedUserId = newUserId || getUserIdFromToken(newToken);

    localStorage.setItem('token', newToken);
    if (resolvedUserId) {
      localStorage.setItem('userId', resolvedUserId);
      setUserId(resolvedUserId);
    } else {
      localStorage.removeItem('userId');
      setUserId(null);
    }

    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
  };

  const isAuthenticated = Boolean(token && (userId || getUserIdFromToken(token)));

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔥 הנה ה-Custom Hook החדש שלכן! (דרישת חובה בפרויקט)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};