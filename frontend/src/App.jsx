import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import Header from './components/Header';
import UserDashboard from './components/UserDashboard';
import LenderDashboard from './components/LenderDashboard';
import Marketplace from './components/Marketplace';
import './App.css';

// Import contract addresses and ABIs
import { CREDIT_SCORING_ABI, MARKETPLACE_ABI } from './contracts/abi';
import { CREDIT_SCORING_ADDRESS, MARKETPLACE_ADDRESS } from './contract-addresses';

// Environment variables
const APP_NAME = import.meta.env.VITE_APP_NAME || 'FHE CreditGuard';
const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION || 'Confidential Credit Scoring Protocol';

function App() {
  const [account, setAccount] = useState('');
  const [creditContract, setCreditContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [userType, setUserType] = useState('user');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [network, setNetwork] = useState('');

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await initContracts(accounts[0]);
          setIsConnected(true);
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setNetwork(network.name);
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
    setIsLoading(false);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsLoading(true);
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
        await initContracts(accounts[0]);
        setIsConnected(true);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setNetwork(network.name);
        
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Error connecting wallet. Please make sure MetaMask is installed and unlocked.');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Please install MetaMask to use this dApp!');
    }
  };

  const initContracts = async (account) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const creditScoring = new ethers.Contract(CREDIT_SCORING_ADDRESS, CREDIT_SCORING_ABI, signer);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
      
      setCreditContract(creditScoring);
      setMarketplaceContract(marketplace);

      console.log('Contracts initialized:', {
        creditScoring: CREDIT_SCORING_ADDRESS,
        marketplace: MARKETPLACE_ADDRESS
      });
    } catch (error) {
      console.error('Error initializing contracts:', error);
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
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'sepETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            });
            setNetwork('sepolia');
          } catch (addError) {
            console.error('Error adding network:', addError);
            alert('Error adding Sepolia network. Please add it manually in MetaMask.');
          }
        }
        console.error('Error switching network:', error);
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initContracts(accounts[0]);
        } else {
          setAccount('');
          setCreditContract(null);
          setMarketplaceContract(null);
          setIsConnected(false);
        }
      };

      const handleChainChanged = (chainId) => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-content">
            <h1>⚡ {APP_NAME}</h1>
            <p>Loading confidential credit scoring dApp...</p>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
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
                <p className="welcome-subtitle">
                  {APP_DESCRIPTION}
                </p>
                
                <div className="feature-grid">
                  <div className="feature-card">
                    <div className="feature-icon">🔒</div>
                    <h3>Complete Privacy</h3>
                    <p>Your financial data is encrypted and never exposed to anyone</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h3>Instant Verification</h3>
                    <p>Lenders can check qualifications without seeing your data</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">🌐</div>
                    <h3>Decentralized</h3>
                    <p>Built on blockchain for transparency and security</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">💸</div>
                    <h3>Loan Marketplace</h3>
                    <p>Access multiple loan offers with your confidential score</p>
                  </div>
                </div>

                <div className="connection-section">
                  <button onClick={connectWallet} className="connect-btn large">
                    🦊 Connect MetaMask
                  </button>
                  <button onClick={switchNetwork} className="network-btn">
                    🌐 Switch to Sepolia
                  </button>
                  <p className="network-info">
                    {network ? `Currently on: ${network}` : 'Please connect to Sepolia Test Network'}
                  </p>
                </div>

                <div className="demo-info">
                  <h3>🚀 How It Works</h3>
                  <ol>
                    <li><strong>Connect Wallet:</strong> Link your MetaMask wallet to the dApp</li>
                    <li><strong>Switch Network:</strong> Ensure you're on Sepolia test network</li>
                    <li><strong>Submit Data:</strong> Encrypt and submit your financial information</li>
                    <li><strong>Get Offers:</strong> Receive confidential loan offers from lenders</li>
                    <li><strong>Stay Private:</strong> Your data remains encrypted throughout the process</li>
                  </ol>
                </div>

                <div className="tech-stack">
                  <h4>🛠️ Powered By</h4>
                  <div className="tech-items">
                    <div className="tech-item">
                      <span className="tech-icon">⚡</span>
                      <span>FHE Encryption</span>
                    </div>
                    <div className="tech-item">
                      <span className="tech-icon">🔗</span>
                      <span>Ethereum Blockchain</span>
                    </div>
                    <div className="tech-item">
                      <span className="tech-icon">🛡️</span>
                      <span>Zero-Knowledge Proofs</span>
                    </div>
                    <div className="tech-item">
                      <span className="tech-icon">🌐</span>
                      <span>Sepolia Testnet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {network !== 'sepolia' && (
                <div className="network-warning">
                  <div className="warning-content">
                    <span className="warning-icon">⚠️</span>
                    <div className="warning-text">
                      <h4>Wrong Network Detected</h4>
                      <p>Please switch to Sepolia Test Network to use {APP_NAME}</p>
                    </div>
                    <button onClick={switchNetwork} className="switch-network-btn">
                      🌐 Switch to Sepolia
                    </button>
                  </div>
                </div>
              )}
              
              {userType === 'user' ? 
                <UserDashboard 
                  contract={creditContract} 
                  account={account} 
                  network={network}
                /> :
                <LenderDashboard 
                  contract={creditContract}
                  marketplaceContract={marketplaceContract}
                  account={account} 
                  network={network}
                />
              }
            </>
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <p>
              <strong>⚡ {APP_NAME}</strong> - {APP_DESCRIPTION}
            </p>
            <p>
              🔐 Built with FHE Technology • 🌐 Deployed on Sepolia •{' '}
              <a href="https://docs.zama.org" target="_blank" rel="noopener noreferrer">
                Powered by Zama
              </a>
            </p>
            <div className="footer-links">
              <a href="https://github.com/Ubuntu1235/fhe-creditguard" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://docs.zama.org" target="_blank" rel="noopener noreferrer">Documentation</a>
              <a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer">Etherscan</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
