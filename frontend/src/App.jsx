import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import UserDashboard from './components/UserDashboard';
import LenderDashboard from './components/LenderDashboard';
import './App.css';

const APP_NAME = 'FHE CreditGuard';

function App() {
  const [account, setAccount] = useState('');
  const [userType, setUserType] = useState('user');
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
        setIsConnected(true);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setNetwork(network.name);
        
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Error connecting wallet.');
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        });
        setNetwork('sepolia');
      } catch (error) {
        console.error('Error switching network:', error);
      }
    }
  };

  return (
    <div className="App">
      <Header 
        account={account} 
        connectWallet={connectWallet}
        userType={userType}
        setUserType={setUserType}
        isConnected={isConnected}
        switchNetwork={switchNetwork}
        network={network}
        appName={APP_NAME}
      />
      
      <main className="main-content">
        {!isConnected ? (
          <div className="dashboard welcome-dashboard">
            <div className="welcome-content">
              <h1>Welcome to {APP_NAME}</h1>
              <p>Connect your wallet to get started with confidential credit scoring.</p>
              <button onClick={connectWallet} className="connect-btn large">
                🦊 Connect MetaMask
              </button>
            </div>
          </div>
        ) : (
          // THIS IS THE FIXED PART - Shows actual dashboards
          userType === 'user' ? 
            <UserDashboard account={account} network={network} /> :
            <LenderDashboard account={account} network={network} />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p><strong>⚡ FHE CreditGuard</strong> - Confidential Credit Scoring</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
