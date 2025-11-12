import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

const UserDashboard = ({ contract, account, network }) => {
  const navigate = useNavigate();
  const [creditData, setCreditData] = useState({
    income: '',
    debt: '',
    paymentHistory: '',
    creditUtilization: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState(null);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    checkDataStatus();
  }, [contract, account]);

  const checkDataStatus = async () => {
    if (contract && account) {
      try {
        console.log('📡 Checking data status for:', account);
        const status = await contract.getUserDataStatus(account);
        console.log('✅ Data status:', status);
        setIsSubmitted(status);
        setDataStatus(status);
      } catch (error) {
        console.log('ℹ️ No existing data found for this account');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreditData({
      ...creditData,
      [name]: value
    });
    setError('');
  };

  const validateForm = () => {
    const { income, debt, paymentHistory, creditUtilization } = creditData;
    
    if (!income || !debt || !paymentHistory || !creditUtilization) {
      setError('Please fill in all fields');
      return false;
    }

    if (parseInt(income) < 0 || parseInt(debt) < 0) {
      setError('Income and debt must be positive numbers');
      return false;
    }

    if (parseInt(paymentHistory) < 0 || parseInt(paymentHistory) > 100) {
      setError('Payment history must be between 0 and 100');
      return false;
    }

    if (parseInt(creditUtilization) < 0 || parseInt(creditUtilization) > 100) {
      setError('Credit utilization must be between 0% and 100%');
      return false;
    }

    return true;
  };

  const encryptData = (value) => {
    console.log('🔐 Encrypting value:', value);
    return ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [parseInt(value)]);
  };

  const submitCreditData = async () => {
    if (!contract) {
      setError('Smart contract not loaded. Please check your wallet connection.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      console.log('🚀 Starting credit data submission...');
      console.log('Account:', account);
      console.log('Network:', network);
      console.log('Contract address:', await contract.getAddress());

      const encryptedIncome = encryptData(creditData.income);
      const encryptedDebt = encryptData(creditData.debt);
      const encryptedPaymentHistory = encryptData(creditData.paymentHistory);
      const encryptedCreditUtilization = encryptData(creditData.creditUtilization);

      console.log('📝 Calling submitCreditData on contract...');
      const tx = await contract.submitCreditData(
        encryptedIncome,
        encryptedDebt,
        encryptedPaymentHistory,
        encryptedCreditUtilization
      );

      console.log('✅ Transaction submitted:', tx.hash);
      setTxHash(tx.hash);
      
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed!', receipt);
      
      setIsSubmitted(true);
      setDataStatus(true);
      
      console.log('🎉 Credit data successfully submitted!');
      
    } catch (error) {
      console.error('❌ Error submitting data:', error);
      
      let errorMessage = 'Failed to submit credit data. ';
      if (error.message.includes('user rejected transaction')) {
        errorMessage = 'You rejected the transaction in MetaMask.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for transaction fees. Please get Sepolia ETH from a faucet.';
      } else if (error.message.includes('Data already submitted')) {
        errorMessage = 'You have already submitted credit data for this account.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goToMarketplace = () => {
    console.log('🚀 Navigating to marketplace...');
    navigate('/marketplace');
  };

  const resetForm = () => {
    setCreditData({
      income: '',
      debt: '',
      paymentHistory: '',
      creditUtilization: ''
    });
    setIsSubmitted(false);
    setDataStatus(false);
    setError('');
    setTxHash('');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>👤 Borrower Dashboard</h2>
        <p>
          Securely submit your financial information using Fully Homomorphic Encryption (FHE). 
          Your data remains encrypted while enabling confidential credit checks.
        </p>
        {network && (
          <div className="network-info-badge">
            🌐 Connected to: {network}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <div className="error-icon">❌</div>
          <div className="error-content">
            <h4>Submission Failed</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {txHash && !isSubmitted && (
        <div className="transaction-info">
          <div className="tx-icon">📝</div>
          <div className="tx-content">
            <h4>Transaction Submitted</h4>
            <p>Transaction Hash: {txHash}</p>
            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="etherscan-link"
            >
              View on Etherscan ↗
            </a>
          </div>
        </div>
      )}

      {dataStatus ? (
        <div className="status-section">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <div className="success-content">
              <h3>🎉 Credit Data Successfully Submitted!</h3>
              <p>
                Your financial information has been encrypted and stored securely on the blockchain. 
                Lenders can now verify your eligibility for loans without ever accessing your raw data.
              </p>
              
              {txHash && (
                <div className="tx-link">
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    📝 View Transaction on Etherscan
                  </a>
                </div>
              )}
              
              <div className="next-steps">
                <h4>🚀 Next Steps:</h4>
                <div className="steps-grid">
                  <div className="step">
                    <span className="step-number">1</span>
                    <p>Visit the Marketplace to see available loan offers</p>
                  </div>
                  <div className="step">
                    <span className="step-number">2</span>
                    <p>Apply for loans that match your credit profile</p>
                  </div>
                  <div className="step">
                    <span className="step-number">3</span>
                    <p>Lenders will review your application confidentially</p>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  onClick={goToMarketplace}
                  className="action-btn primary large"
                >
                  🏪 Explore Loan Marketplace
                </button>
                <button 
                  onClick={resetForm}
                  className="action-btn secondary"
                >
                  🔄 Submit Different Data
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="form-section">
          <div className="form-intro">
            <h3>Submit Your Encrypted Credit Information</h3>
            <p>All data is encrypted before being stored on the blockchain. Only you control access to your information.</p>
          </div>

          <div className="data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="income">Annual Gross Income (USD)</label>
                <input
                  id="income"
                  type="number"
                  name="income"
                  value={creditData.income}
                  onChange={handleInputChange}
                  placeholder="e.g., 75000"
                  disabled={isLoading}
                  min="0"
                  step="1000"
                />
                <small>Your total yearly income before taxes and deductions</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="debt">Total Outstanding Debt (USD)</label>
                <input
                  id="debt"
                  type="number"
                  name="debt"
                  value={creditData.debt}
                  onChange={handleInputChange}
                  placeholder="e.g., 15000"
                  disabled={isLoading}
                  min="0"
                  step="100"
                />
                <small>Sum of all loans, credit cards, and other debts</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="paymentHistory">Payment History Score</label>
                <input
                  id="paymentHistory"
                  type="number"
                  name="paymentHistory"
                  value={creditData.paymentHistory}
                  onChange={handleInputChange}
                  placeholder="0 - 100"
                  disabled={isLoading}
                  min="0"
                  max="100"
                />
                <small>
                  90-100: Excellent | 75-89: Good | 60-74: Fair | Below 60: Needs Improvement
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="creditUtilization">Credit Utilization Rate (%)</label>
                <input
                  id="creditUtilization"
                  type="number"
                  name="creditUtilization"
                  value={creditData.creditUtilization}
                  onChange={handleInputChange}
                  placeholder="0 - 100"
                  disabled={isLoading}
                  min="0"
                  max="100"
                />
                <small>Percentage of available credit you're currently using (lower is better)</small>
              </div>
            </div>

            <div className="form-actions">
              <button 
                onClick={submitCreditData}
                disabled={!contract || isLoading || !creditData.income}
                className="submit-btn"
              >
                {isLoading ? (
                  <>
                    <span className="spinner-small"></span>
                    Encrypting & Submitting Data...
                  </>
                ) : (
                  <>
                    <span className="lock-icon">🔒</span>
                    Submit Encrypted Credit Data
                  </>
                )}
              </button>
              
              {!contract && (
                <p className="warning-text">
                  ⚠️ Smart contract not connected. Please check your wallet connection.
                </p>
              )}
            </div>
          </div>

          <div className="privacy-notice">
            <h4>🔐 How Your Privacy is Protected</h4>
            <div className="privacy-features">
              <div className="privacy-item">
                <strong>Fully Homomorphic Encryption (FHE)</strong>
                <p>Your data is encrypted before submission and remains encrypted during all computations</p>
              </div>
              <div className="privacy-item">
                <strong>Zero Data Exposure</strong>
                <p>Lenders only see qualification results, never your actual financial information</p>
              </div>
              <div className="privacy-item">
                <strong>Blockchain Security</strong>
                <p>All transactions are recorded on an immutable blockchain for transparency</p>
              </div>
              <div className="privacy-item">
                <strong>User Control</strong>
                <p>You maintain complete control over your data and who can access it</p>
              </div>
            </div>
          </div>

          <div className="debug-info">
            <h4>🔧 Connection Status</h4>
            <div className="debug-details">
              <p><strong>Account:</strong> {account || 'Not connected'}</p>
              <p><strong>Network:</strong> {network || 'Unknown'}</p>
              <p><strong>Contract:</strong> {contract ? 'Connected' : 'Not connected'}</p>
              <p><strong>Data Status:</strong> {dataStatus ? 'Submitted' : 'Not submitted'}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .network-info-badge {
          background: #FFD700;
          color: #000;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: 1rem;
          display: inline-block;
        }
        
        .error-message {
          background: #dc2626;
          color: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 2px solid #fecaca;
        }
        
        .error-icon {
          font-size: 2rem;
        }
        
        .error-content h4 {
          margin: 0 0 0.5rem 0;
          color: white;
        }
        
        .error-content p {
          margin: 0;
          opacity: 0.9;
        }
        
        .transaction-info {
          background: #4f46e5;
          color: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .tx-icon {
          font-size: 2rem;
        }
        
        .tx-content h4 {
          margin: 0 0 0.5rem 0;
          color: white;
        }
        
        .tx-content p {
          margin: 0 0 0.5rem 0;
          font-family: monospace;
          font-size: 0.875rem;
        }
        
        .etherscan-link {
          color: #FFD700;
          text-decoration: none;
          font-weight: 600;
        }
        
        .etherscan-link:hover {
          text-decoration: underline;
        }
        
        .status-section {
          text-align: center;
        }
        
        .success-message {
          background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          border: 2px solid #FFD700;
          border-radius: 16px;
          padding: 3rem;
          margin: 2rem 0;
          position: relative;
          overflow: hidden;
        }
        
        .success-message::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #FFD700, #FF6B00);
        }
        
        .success-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          display: block;
        }
        
        .success-content h3 {
          color: #FFD700;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        
        .success-content p {
          color: #cccccc;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          line-height: 1.6;
        }
        
        .tx-link {
          margin: 1.5rem 0;
        }
        
        .tx-link a {
          color: #FFD700;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #2a2a2a;
          border-radius: 8px;
          border: 1px solid #444;
          transition: all 0.2s ease;
        }
        
        .tx-link a:hover {
          background: #FFD700;
          color: #000000;
          text-decoration: none;
        }
        
        .next-steps {
          margin: 2rem 0;
          padding: 2rem;
          background: #2a2a2a;
          border-radius: 12px;
          border: 1px solid #444;
        }
        
        .next-steps h4 {
          color: #FFD700;
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
        }
        
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #1a1a1a;
          border-radius: 8px;
          border: 1px solid #333;
        }
        
        .step-number {
          background: #FFD700;
          color: #000000;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        
        .step p {
          margin: 0;
          color: #cccccc;
          line-height: 1.5;
        }
        
        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
          flex-wrap: wrap;
        }
        
        .action-btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          border: 2px solid transparent;
        }
        
        .action-btn.primary {
          background: #FFD700;
          color: #000000;
        }
        
        .action-btn.primary:hover {
          background: #FFC400;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
          border-color: #FFD700;
        }
        
        .action-btn.secondary {
          background: transparent;
          color: #FFD700;
          border: 2px solid #FFD700;
        }
        
        .action-btn.secondary:hover {
          background: #FFD700;
          color: #000000;
          transform: translateY(-2px);
        }
        
        .action-btn.large {
          padding: 1.25rem 2.5rem;
          font-size: 1.125rem;
        }
        
        .form-section {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .form-intro {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: #2a2a2a;
          border-radius: 12px;
          border: 1px solid #444;
        }
        
        .form-intro h3 {
          color: #FFD700;
          margin-bottom: 1rem;
        }
        
        .form-intro p {
          color: #cccccc;
          margin: 0;
        }
        
        .data-form {
          background: #2a2a2a;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #444;
          margin-bottom: 2rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .form-group label {
          font-weight: 600;
          color: #FFD700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .form-group input {
          padding: 1rem;
          border: 2px solid #444;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #1a1a1a;
          color: #ffffff;
          font-family: inherit;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #FFD700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
        }
        
        .form-group input:disabled {
          background: #333;
          color: #999;
          cursor: not-allowed;
        }
        
        .form-group small {
          font-size: 0.75rem;
          color: #999;
          font-style: italic;
          line-height: 1.4;
        }
        
        .form-actions {
          text-align: center;
          margin-top: 2rem;
        }
        
        .submit-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 1.25rem 3rem;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 300px;
          justify-content: center;
          border: 2px solid transparent;
        }
        
        .submit-btn:disabled {
          background: #6b7280;
          cursor: not-allowed;
          transform: none;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
          border-color: #10b981;
        }
        
        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .lock-icon {
          font-size: 1.25rem;
        }
        
        .warning-text {
          color: #ef4444;
          margin-top: 1rem;
          font-size: 0.875rem;
        }
        
        .privacy-notice {
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .privacy-notice h4 {
          color: #FFD700;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .privacy-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .privacy-item {
          background: #2a2a2a;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #333;
        }
        
        .privacy-item strong {
          color: #ffffff;
          display: block;
          margin-bottom: 0.5rem;
        }
        
        .privacy-item p {
          color: #cccccc;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }
        
        .debug-info {
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 12px;
          padding: 1.5rem;
        }
        
        .debug-info h4 {
          color: #FFD700;
          margin-bottom: 1rem;
        }
        
        .debug-details p {
          margin: 0.5rem 0;
          font-family: monospace;
          font-size: 0.875rem;
          color: #cccccc;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .action-btn {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }
          
          .steps-grid {
            grid-template-columns: 1fr;
          }
          
          .step {
            flex-direction: column;
            text-align: center;
            align-items: center;
          }
          
          .submit-btn {
            min-width: auto;
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;