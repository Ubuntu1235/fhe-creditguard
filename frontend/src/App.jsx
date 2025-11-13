import React from 'react';
import './App.css';

function App() {
  console.log('🎯 App component rendering...');
  
  return (
    <div className="App">
      <header className="header">
        <div className="logo-section">
          <h1>⚡ FHE CreditGuard</h1>
          <p>Confidential Credit Scoring on Blockchain</p>
        </div>
        <button className="connect-btn">
          🦊 Connect Wallet
        </button>
      </header>

      <main className="main-content">
        <div className="dashboard welcome-dashboard">
          <div className="welcome-content">
            <h1>Welcome to FHE CreditGuard</h1>
            <p className="welcome-subtitle">
              Confidential Credit Scoring Protocol
            </p>
            
            <div style={{ 
              background: '#2a2a2a', 
              padding: '2rem', 
              borderRadius: '12px', 
              margin: '2rem 0',
              border: '1px solid #444'
            }}>
              <h2 style={{ color: '#FFD700', marginBottom: '1rem' }}>✅ Application Loaded Successfully!</h2>
              <p>Your FHE CreditGuard dApp is now running on Vercel.</p>
              <p style={{ marginTop: '1rem', color: '#888' }}>Next, we'll add the blockchain functionality.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p><strong>⚡ FHE CreditGuard</strong> - Confidential Credit Scoring Protocol</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
