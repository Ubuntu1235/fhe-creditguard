import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Marketplace = ({ marketplaceContract, account }) => {
  const [loanOffers, setLoanOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    loadLoanOffers();
  }, [marketplaceContract]);

  const loadLoanOffers = async () => {
    if (!marketplaceContract) return;

    try {
      setIsLoading(true);
      const activeOfferIds = await marketplaceContract.getActiveOffers();
      
      const offers = [];
      for (const offerId of activeOfferIds) {
        const offer = await marketplaceContract.getLoanOffer(offerId);
        offers.push({
          id: offerId,
          lender: offer.lender,
          amount: offer.amount,
          minCreditScore: offer.minCreditScore,
          interestRate: offer.interestRate,
          active: offer.active
        });
      }
      
      setLoanOffers(offers);
    } catch (error) {
      console.error('Error loading loan offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyForLoan = async (offerId) => {
    if (!marketplaceContract) return;

    try {
      setApplying(offerId);
      const tx = await marketplaceContract.applyForLoan(offerId);
      console.log('Applying for loan...', tx.hash);
      await tx.wait();
      
      alert('✅ Loan application submitted! The lender will review your application.');
    } catch (error) {
      console.error('Error applying for loan:', error);
      alert('❌ Error applying for loan: ' + error.message);
    } finally {
      setApplying(null);
    }
  };

  const getCreditScoreTier = (score) => {
    if (score >= 800) return { label: 'Excellent', color: '#10b981' };
    if (score >= 740) return { label: 'Very Good', color: '#22c55e' };
    if (score >= 670) return { label: 'Good', color: '#eab308' };
    if (score >= 580) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  };

  const formatInterestRate = (basisPoints) => {
    return (basisPoints / 100).toFixed(2) + '%';
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 Loan Marketplace</h2>
          <p>Browse available loan offers and apply confidentially.</p>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading available loan offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Loan Marketplace</h2>
        <p>Browse available loan offers and apply confidentially using your encrypted credit data.</p>
      </div>

      <div className="section-actions">
        <button 
          onClick={loadLoanOffers}
          className="refresh-btn"
          disabled={isLoading}
        >
          {isLoading ? '🔄 Loading...' : '🔄 Refresh Offers'}
        </button>
      </div>

      {loanOffers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h4>No Active Loan Offers</h4>
          <p>There are currently no active loan offers in the marketplace. Check back later or create an offer as a lender.</p>
        </div>
      ) : (
        <div className="loan-offers">
          {loanOffers.map((offer) => (
            <div key={offer.id.toString()} className="loan-offer-card">
              <div className="offer-header">
                <h4>Loan Offer #{offer.id.toString()}</h4>
                <span className="lender-badge">
                  Lender: {offer.lender.slice(0, 6)}...{offer.lender.slice(-4)}
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

              <button 
                onClick={() => applyForLoan(offer.id)}
                disabled={applying === offer.id}
                className="apply-btn"
              >
                {applying === offer.id ? (
                  <>
                    <span className="spinner-small"></span>
                    Applying...
                  </>
                ) : (
                  <>
                    📝 Apply for Loan
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .dashboard-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .section-actions {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
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
        
        .loan-offers {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .loan-offer-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .loan-offer-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #4f46e5, #8b5cf6);
        }
        
        .loan-offer-card:hover {
          border-color: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .offer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .offer-header h4 {
          color: #1e293b;
          margin: 0;
          font-size: 1.125rem;
        }
        
        .lender-badge {
          background: #f1f5f9;
          color: #64748b;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .offer-details {
          margin-bottom: 1.5rem;
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
          font-weight: 600;
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
        
        .apply-btn {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1rem;
        }
        
        .apply-btn:hover:not(:disabled) {
          background: #d97706;
          transform: translateY(-1px);
        }
        
        .apply-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }
        
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .offer-header {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .loan-offers {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Marketplace;
