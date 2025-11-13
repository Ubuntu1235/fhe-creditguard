import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🚀 FHE CreditGuard starting...');

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: '#1a1a1a',
          color: 'white',
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1 style={{ color: '#FF6B6B' }}>⚠️ Application Error</h1>
          <p>The application crashed. Check the browser console for details.</p>
          <p style={{ 
            background: '#2a2a2a', 
            padding: '1rem', 
            borderRadius: '8px',
            margin: '1rem 0',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            Error: {this.state.error?.message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#FFD700',
              color: '#000000',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Failed to render React app:', error);
  // Fallback rendering
  root.render(
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      background: '#1a1a1a',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>FHE CreditGuard</h1>
      <p>Failed to load application. Please check the console.</p>
    </div>
  );
}
