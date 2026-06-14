import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import TransactionsPage from './views/TransactionsPage'
import Dashboard from './components/Dashboard'
import NavBar from './components/NavBar'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Register from './components/Register'
import BudgetFlowPage from './pages/BudgetFlowPage.tsx';
import BudgetManagementPage from './pages/BudgetManagementPage.tsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div style={{ background: 'linear-gradient(180deg, #f7f8ff 0%, #eef2fb 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar />
        <main style={{ flex: 1, padding: '0', maxWidth: '100%' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
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
