import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import TransactionsPage from './views/TransactionsPage'
import Dashboard from './components/Dashboard'
import NavBar from './components/NavBar'

function App() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #f7f8ff 0%, #eef2fb 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <main style={{ flex: 1, padding: '0', maxWidth: '100%' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
