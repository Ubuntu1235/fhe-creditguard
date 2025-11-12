import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const LenderDashboard = ({ contract, marketplaceContract, account }) => {
  const [loanOffer, setLoanOffer] = useState({
    amount: '',
    minCreditScore: '',
    interestRate: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [myOffers, setMyOffers] = useState([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'myOffers'

  useEffect(() => {
    if (marketplaceContract && account) {
      loadMyOffers();
    }
  }, [marketplaceContract, account]);

  const loadMyOffers = async () => {
    if (!marketplaceContract) return;

    try {
      setIsLoadingOffers(true);
      const activeOfferIds = await marketplaceContract.getActiveOffers();
      
      const offers = [];
      for (const offerId of activeOfferIds) {
        const offer = await marketplaceContract.getLoanOffer(offerId);
        // Only show offers created by current account
        if (offer.lender.toLowerCase() === account.toLowerCase()) {
          offers.push({
            id: offerId.toString(),
            lender: offer.lender,
            amount: offer.amount,
            minCreditScore: offer.minCreditScore,
            interestRate: offer.interestRate,
            active: offer.active
          });
        }
      }
      
      setMyOffers(offers);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanOffer({
      ...loanOffer,
      [name]: value
    });
  };

  const validateForm = () => {
    const { amount, minCreditScore, interestRate } = loanOffer;
    
    if (!amount || !minCreditScore || !interestRate) {
      alert('Please fill in all fields');
      return false;
    }

    if (parseFloat(amount) <= 0) {
      alert('Loan amount must be greater than 0');
      return false;
    }

    if (parseInt(minCreditScore) < 300 || parseInt(minCreditScore) > 850) {
      alert('Credit score must be between 300 and 850');
      return false;
    }

    if (parseInt(interestRate) < 0 || parseInt(interestRate) > 2000) {
      alert('Interest rate must be between 0 and 2000 basis points (0-20%)');
      return false;
    }

    return true;
  };

  const createLoanOffer = async () => {
    if (!marketplaceContract) {
      alert('Marketplace contract not loaded. Please check your connection.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsCreating(true);
      
      const amountInWei = ethers.parseEther(loanOffer.amount);
      const minScore = parseInt(loanOffer.minCreditScore);
      const interest = parseInt(loanOffer.interestRate);

      console.log('Creating loan offer:', { amountInWei, minScore, interest });
      
      const tx = await marketplaceContract.createLoanOffer(amountInWei, minScore, interest);

      console.log('Transaction sent:', tx.hash);
      
      alert(`📝 Loan offer submitted! Waiting for confirmation...\n\nTransaction Hash: ${tx.hash}`);
      
      await tx.wait();
      
      console.log('Loan offer created successfully!');
      
      alert(`🎉 Loan offer created successfully!\n\n• Amount: ${loanOffer.eth} ETH\n• Minimum Credit Score: ${minScore}\n• Interest Rate: ${(interest / 100).toFixed(2)}%`);
      
      // Reset form and reload offers
      setLoanOffer({ amount: '', minCreditScore: '', interestRate: '' });
      await loadMyOffers();
      setActiveTab('myOffers');
      
    } catch (error) {
      console.error('Error creating loan offer:', error);
      
      let errorMessage = 'Failed to create loan offer. ';
      if (error.message.includes('user rejected transaction')) {
        errorMessage += 'You rejected the transaction in MetaMask.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage += 'Insufficient ETH for transaction fees.';
      } else {
        errorMessage += `Please try again. Error: ${error.message}`;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const formatInterestRate = (basisPoints) => {
    return (basisPoints / 100).toFixed(2) + '%';
  };

  const getCreditScoreTier = (score) => {
    if (score >= 800) return { label: 'Excellent', color: '#10b981' };
    if (score >= 740) return { label: 'Very Good', color: '#22c55e' };
    if (score >= 670) return { label: 'Good', color: '#eab308' };
    if (score >= 580) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🏦 Lender Portal</h2>
        <p>
          Create confidential loan offers and evaluate borrowers using Fully Homomorphic Encryption technology. 
          Verify creditworthiness without accessing sensitive financial data.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          📝 Create New Offer
        </button>
        <button 
          className={`tab-btn ${activeTab === 'myOffers' ? 'active' : ''}`}
          onClick={() => setActiveTab('myOffers')}
        >
          📊 My Loan Offers ({myOffers.length})
        </button>
      </div>

      {activeTab === 'create' ? (
        <div className="create-offer-section">
          <div className="form-intro">
            <h3>Create Confidential Loan Offer</h3>
            <p>Set your lending criteria. The FHE system will automatically screen borrowers while keeping their data private.</p>
          </div>

          <div className="data-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Loan Amount (ETH)</label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={loanOffer.amount}
                  onChange={handleInputChange}
                  placeholder="e.g., 1.5"
                  step="0.1"
                  min="0.1"
                  disabled={isCreating}
                />
                <small>Total loan amount in Ethereum</small>
              </div>

              <div className="form-group">
                <label htmlFor="minCreditScore">Minimum Credit Score</label>
                <input
                  id="minCreditScore"
                  type="number"
                  name="minCreditScore"
                  value={loanOffer.minCreditScore}
                  onChange={handleInputChange}
                  placeholder="e.g., 650"
                  min="300"
                  max="850"
                  disabled={isCreating}
                />
                <small>Standard credit score range: 300-850</small>
                {loanOffer.minCreditScore && (
                  <div className="score-indicator">
                    <span 
                      className="score-dot" 
                      style={{ backgroundColor: getCreditScoreTier(parseInt(loanOffer.minCreditScore)).color }}
                    ></span>
                    {getCreditScoreTier(parseInt(loanOffer.minCreditScore)).label}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="interestRate">Annual Interest Rate</label>
                <input
                  id="interestRate"
                  type="number"
                  name="interestRate"
                  value={loanOffer.interestRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 500 for 5%"
                  min="0"
                  max="2000"
                  step="10"
                  disabled={isCreating}
                />
                <small>In basis points (100 = 1% annual interest)</small>
                {loanOffer.interestRate && (
                  <div className="rate-preview">
                    Display Rate: <strong>{formatInterestRate(parseInt(loanOffer.interestRate))}</strong>
                  </div>
                )}
              </div>

              <div className="form-preview">
                <div className="preview-card">
                  <h4>Offer Preview</h4>
                  <div className="preview-details">
                    <div className="preview-item">
                      <span>Loan Amount:</span>
                      <strong>{loanOffer.amount || '0'} ETH</strong>
                    </div>
                    <div className="preview-item">
                      <span>Min Credit Score:</span>
                      <strong>{loanOffer.minCreditScore || 'N/A'}</strong>
                    </div>
                    <div className="preview-item">
                      <span>Interest Rate:</span>
                      <strong>
                        {loanOffer.interestRate ? formatInterestRate(parseInt(loanOffer.interestRate)) : 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                onClick={createLoanOffer}
                disabled={!marketplaceContract || isCreating || !loanOffer.amount}
                className="submit-btn"
              >
                {isCreating ? (
                  <>
                    <span className="spinner-small"></span>
                    Creating Loan Offer...
                  </>
                ) : (
                  <>
                    <span className="contract-icon">📄</span>
                    Publish Loan Offer
                  </>
                )}
              </button>
              
              {!marketplaceContract && (
                <p className="warning-text">
                  ⚠️ Marketplace contract not connected. Please check your wallet connection.
                </p>
              )}
            </div>
          </div>

          <div className="lender-benefits">
            <h4>🚀 Benefits of Confidential Lending</h4>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🔒</div>
                <h5>Zero Data Exposure</h5>
                <p>Borrower financial data remains encrypted. You only see qualification results.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">⚡</div>
                <h5>Automated Screening</h5>
                <p>FHE system automatically filters out unqualified applicants.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🌐</div>
                <h5>Global Reach</h5>
                <p>Access borrowers worldwide while maintaining regulatory compliance.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">📈</div>
                <h5>Risk Management</h5>
                <p>Set precise credit criteria without privacy concerns.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-offers-section">
          <div className="section-header">
            <h3>My Active Loan Offers</h3>
            <button onClick={loadMyOffers} className="refresh-btn" disabled={isLoadingOffers}>
              {isLoadingOffers ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {isLoadingOffers ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your loan offers...</p>
            </div>
          ) : myOffers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No Active Loan Offers</h4>
              <p>You haven't created any loan offers yet. Start by creating your first offer!</p>
              <button 
                onClick={() => setActiveTab('create')}
                className="action-btn primary"
              >
                Create Your First Offer
              </button>
            </div>
          ) : (
            <div className="offers-grid">
              {myOffers.map((offer) => (
                <div key={offer.id} className="offer-card">
                  <div className="offer-header">
                    <h4>Offer #{offer.id}</h4>
                    <span className={`status-badge ${offer.active ? 'active' : 'inactive'}`}>
                      {offer.active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </div>
                  
                  <div className="offer-details">
                    <div className="detail-group">
                      <div className="detail-item">
                        <span className="detail-label">Loan Amount</span>
                        <span className="detail-value">
                          {ethers.formatEther(offer.amount)} ETH
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Min Credit Score</span>
                        <span className="detail-value score-value">
                          <span 
                            className="score-indicator"
                            style={{ backgroundColor: getCreditScoreTier(offer.minCreditScore).color }}
                          ></span>
                          {offer.minCreditScore.toString()} 
                          <small>({getCreditScoreTier(offer.minCreditScore).label})</small>
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Interest Rate</span>
                        <span className="detail-value rate-value">
                          {formatInterestRate(offer.interestRate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="offer-actions">
                    <div className="offer-info">
                      <small>Created by you • Active in marketplace</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-value">{myOffers.length}</div>
              <div className="stat-label">Active Offers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {myOffers.reduce((total, offer) => total + parseFloat(ethers.formatEther(offer.amount)), 0).toFixed(1)} ETH
              </div>
              <div className="stat-label">Total Offered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {myOffers.length > 0 
                  ? formatInterestRate(myOffers.reduce((total, offer) => total + offer.interestRate, 0) / myOffers.length)
                  : '0%'
                }
              </div>
              <div className="stat-label">Avg Interest Rate</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .dashboard-header h2 {
          margin-bottom: 1rem;
        }
        
        .tab-navigation {
          display: flex;
          background: #f8fafc;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 2rem;
          border: 1px solid #e2e8f0;
        }
        
        .tab-btn {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .tab-btn.active {
          background: white;
          color: #4f46e5;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .tab-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.5);
        }
        
        .create-offer-section {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .form-intro {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        
        .form-intro h3 {
          color: #1e293b;
          margin-bottom: 1rem;
        }
        
        .data-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 2rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .form-group input {
          padding: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: white;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .form-group input:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }
        
        .form-group small {
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
        }
        
        .score-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }
        
        .score-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .rate-preview {
          font-size: 0.875rem;
          font-weight: 600;
          color: #059669;
          margin-top: 0.5rem;
        }
        
        .form-preview {
          display: flex;
          align-items: center;
        }
        
        .preview-card {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 1.5rem;
          width: 100%;
        }
        
        .preview-card h4 {
          color: #0369a1;
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        
        .preview-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .preview-item span {
          color: #64748b;
          font-size: 0.875rem;
        }
        
        .preview-item strong {
          color: #1e293b;
        }
        
        .form-actions {
          text-align: center;
          margin-top: 2rem;
        }
        
        .submit-btn {
          background: #f59e0b;
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
          min-width: 250px;
          justify-content: center;
        }
        
        .submit-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #d97706;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
        }
        
        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .contract-icon {
          font-size: 1.25rem;
        }
        
        .warning-text {
          color: #dc2626;
          margin-top: 1rem;
          font-size: 0.875rem;
        }
        
        .lender-benefits {
          background: #f8fafc;
          border-radius: 12px;
          padding: 2rem;
          border: 1px solid #e2e8f0;
        }
        
        .lender-benefits h4 {
          text-align: center;
          margin-bottom: 2rem;
          color: #1e293b;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .benefit-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        
        .benefit-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        .benefit-card h5 {
          color: #1e293b;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        
        .benefit-card p {
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }
        
        .my-offers-section {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .section-header h3 {
          color: #1e293b;
          margin: 0;
        }
        
        .refresh-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .refresh-btn:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-1px);
        }
        
        .refresh-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }
        
        .loading-state .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .empty-state h4 {
          color: #374151;
          margin-bottom: 1rem;
        }
        
        .action-btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-btn.primary {
          background: #4f46e5;
          color: white;
        }
        
        .action-btn.primary:hover {
          background: #4338ca;
          transform: translateY(-2px);
        }
        
        .offers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .offer-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }
        
        .offer-card:hover {
          border-color: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .offer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .offer-header h4 {
          color: #1e293b;
          margin: 0;
          font-size: 1.125rem;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-badge.inactive {
          background: #fecaca;
          color: #dc2626;
        }
        
        .offer-details {
          margin-bottom: 1rem;
        }
        
        .detail-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .detail-label {
          color: #64748b;
          font-size: 0.875rem;
        }
        
        .detail-value {
          color: #1e293b;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .score-value small {
          color: #6b7280;
          font-weight: normal;
        }
        
        .score-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .rate-value {
          color: #059669;
        }
        
        .offer-actions {
          border-top: 1px solid #e2e8f0;
          padding-top: 1rem;
        }
        
        .offer-info small {
          color: #9ca3af;
          font-size: 0.75rem;
        }
        
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #4f46e5;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LenderDashboard;