import React from 'react';

interface SummaryCardProps {
  title: string;
  amount: number;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, color }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      textAlign: 'center',
      minWidth: '150px',
      borderTop: `5px solid ${color}`,
      direction: 'rtl'
    }}>
      <h3 style={{ margin: 0, color: '#555', fontSize: '1rem' }}>{title}</h3>
      <p style={{ margin: '10px 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#222' }}>
        ₪{amount.toLocaleString()}
      </p>
    </div>
  );
};

export default SummaryCard;