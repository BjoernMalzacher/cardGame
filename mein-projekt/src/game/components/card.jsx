import React from 'react';

export const Card =  ({ card, onClick, selected = false, small = false }) => {
  const { rank, suit, color, isJoker } = card;
  const size = small ? { width: '70px', height: '105px', padding: '6px' } : { width: '100px', height: '150px', padding: '8px' };

  const cardStyle = {
    ...size,
    backgroundColor: isJoker ? '#F3F4F6' : '#FFFFFF',
    border: selected ? '3px solid #3B82F6' : isJoker ? '3px dashed #F87171' : '2px solid #D1D5DB',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  };

  if (!isJoker) {
    return (
      <div 
        style={cardStyle} 
        onClick={onClick}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ textAlign: 'left', color: color }}>
          <div style={{ fontSize: small ? '12px' : '16px', fontWeight: 'bold' }}>{rank}</div>
          <div style={{ fontSize: small ? '10px' : '12px' }}>{suit}</div>
        </div>

        <div style={{ textAlign: 'center', color: color, fontSize: small ? '24px' : '36px', opacity: 0.8 }}>
          {suit}
        </div>

        <div style={{ textAlign: 'right', color: color, transform: 'rotate(180deg)' }}>
          <div style={{ fontSize: small ? '12px' : '16px', fontWeight: 'bold' }}>{rank}</div>
          <div style={{ fontSize: small ? '10px' : '12px' }}>{suit}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{...cardStyle, backgroundColor: '#F3F4F6', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}} 
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ fontSize: small ? '14px' : '18px', fontWeight: 'bold', color: color, letterSpacing: '2px' }}>
        {rank}
      </div>
      <div style={{ fontSize: small ? '28px' : '40px', color: color, marginTop: '4px' }}>
        {suit}
      </div>
    </div>
  );
};

export const EmptySlot = ({ onClick }) => {
  return (
    <div 
      style={{
        width: '100px',
        height: '150px',
        border: '3px dashed #888888',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ color: '#888', fontSize: '12px', textAlign: 'center' }}>Leer</div>
    </div>
  );
};

export const CardBack = () => {
  return (
    <div 
      style={{
        width: '100px',
        height: '150px',
        backgroundColor: '#1F2937',
        border: '2px solid #111827',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ fontSize: '48px', color: '#4B5563' }}>🂠</div>
    </div>
  );
};