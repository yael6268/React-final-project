import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode; // ✅ שונה ל-ReactNode לתאימות מלאה
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, userId } = useAuth();

  if (loading) {
    // ✅ שונה מ-textDirection ל-direction
    return <div style={{ direction: 'rtl', padding: '20px' }}>טוען מערכת אבטחה...</div>; 
  }

  if (!isAuthenticated || !userId) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}