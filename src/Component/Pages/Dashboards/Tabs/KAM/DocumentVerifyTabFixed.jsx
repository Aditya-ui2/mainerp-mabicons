import React from 'react';

const DocumentVerifyTabFixed = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#f0f4f8', minHeight: '400px', borderRadius: '24px' }}>
      <h1 style={{ color: '#1a365d' }}>Verification Audit System</h1>
      <p style={{ color: '#4a5568' }}>The system is currently syncing with the candidate database...</p>
      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '16px', border: '2px dashed #cbd5e0' }}>
         <p>Establishing secure handshake...</p>
         <button 
           onClick={() => window.location.reload()}
           style={{ padding: '10px 20px', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
         >
           Manual Reset
         </button>
      </div>
    </div>
  );
};

export default DocumentVerifyTabFixed;
