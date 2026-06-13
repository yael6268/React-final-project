import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import BudgetFlowPage from './pages/BudgetFlowPage.tsx';
import BudgetManagementPage from './pages/BudgetManagementPage.tsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <BudgetFlowPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/budget/manage"
            element={
              <ProtectedRoute>
                <BudgetManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/budget" replace />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
