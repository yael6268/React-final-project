import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e9e8ee',
      boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '12px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <div style={{
          fontWeight: 800,
          fontSize: '1.1rem',
          color: '#5439ff',
          letterSpacing: '-0.5px',
        }}>💰 ניהול כספים</div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              color: isActive('/dashboard') ? '#5439ff' : '#5f6170',
              fontWeight: isActive('/dashboard') ? 700 : 600,
              fontSize: '0.95rem',
              borderBottom: isActive('/dashboard') ? '3px solid #5439ff' : 'none',
              paddingBottom: isActive('/dashboard') ? '8px' : '0',
              transition: 'all 0.2s ease',
            }}
          >
            לוח בקרה
          </Link>
          <Link
            to="/transactions"
            style={{
              textDecoration: 'none',
              color: isActive('/transactions') ? '#5439ff' : '#5f6170',
              fontWeight: isActive('/transactions') ? 700 : 600,
              fontSize: '0.95rem',
              borderBottom: isActive('/transactions') ? '3px solid #5439ff' : 'none',
              paddingBottom: isActive('/transactions') ? '8px' : '0',
              transition: 'all 0.2s ease',
            }}
          >
            תנועות
          </Link>
        </nav>

        {/* User Profile Button */}
        <button style={{
          background: 'linear-gradient(135deg, #6b5bff 0%, #2ec4b6 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(44, 33, 197, 0.18)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 30px rgba(44, 33, 197, 0.25)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'none';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(44, 33, 197, 0.18)';
        }}
        >
          👤 פרופיל
        </button>
      </div>
    </header>
  );
};

export default NavBar;
