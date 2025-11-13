import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header style={{ 
        background: '#1a1a1a', 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '2px solid #FFD700'
      }}>
        <div>
          <h1 style={{ color: '#FFD700', margin: 0 }}>⚡ FHE CreditGuard</h1>
          <p style={{ color: '#cccccc', margin: 0, fontSize: '0.875rem' }}>
            Confidential Credit Scoring on Blockchain
          </p>
        </div>
        <button style={{
          background: '#FFD700',
          color: '#000000',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          🦊 Connect Wallet
        </button>
      </header>

      <main style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        minHeight: '80vh',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '3rem', color: '#FFD700', marginBottom: '1rem' }}>
          Welcome to FHE CreditGuard
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#cccccc', marginBottom: '2rem' }}>
          Confidential Credit Scoring Protocol
        </p>
        
        <div style={{
          background: '#2a2a2a',
          padding: '2rem',
          borderRadius: '12px',
          maxWidth: '600px',
          margin: '0 auto',
          border: '1px solid #444'
        }}>
          <h2 style={{ color: '#FFD700' }}>🚀 Getting Started</h2>
          <p>Connect your MetaMask wallet to begin using confidential credit scoring.</p>
          <button style={{
            background: '#FFD700',
            color: '#000000',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '1.125rem',
            marginTop: '1rem'
          }}>
            Connect MetaMask
          </button>
        </div>

        <div style={{ marginTop: '3rem', color: '#888' }}>
          <p>If you can see this message, the basic React app is working!</p>
          <p>Next, we'll add the blockchain functionality.</p>
        </div>
      </main>

      <footer style={{
        background: '#1a1a1a',
        padding: '1.5rem',
        textAlign: 'center',
        color: '#cccccc',
        borderTop: '2px solid #FFD700'
      }}>
        <p>⚡ FHE CreditGuard - Built with FHE Technology</p>
      </footer>
    </div>
  );
}

export default App;
