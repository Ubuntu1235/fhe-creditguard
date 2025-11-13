import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

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
    console.error('App Error:', error, errorInfo);
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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#FF6B6B', marginBottom: '1rem' }}>⚠️ Application Error</h1>
          <p style={{ marginBottom: '1rem' }}>Something went wrong. Check the console for details.</p>
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

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; background: #1a1a1a; color: white; min-height: 100vh;">
      <h1 style="color: #FF6B6B;">Error: Root element not found</h1>
      <p>Cannot find the root element to mount React app.</p>
    </div>
  `;
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('✅ React app rendered successfully');
    
    // Hide loading screen
    setTimeout(() => {
      const loadingElement = document.getElementById('initial-loading');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
    }, 500);
    
  } catch (error) {
    console.error('❌ Failed to render React app:', error);
    
    // Fallback UI
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; background: #1a1a1a; color: white; min-height: 100vh;">
        <h1 style="color: #FF6B6B;">FHE CreditGuard</h1>
        <p>Failed to initialize application. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="
          background: #FFD700;
          color: #000000;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 1rem;
        ">Refresh Page</button>
      </div>
    `;
  }
}
