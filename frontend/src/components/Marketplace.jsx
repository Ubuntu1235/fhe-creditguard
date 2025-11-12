import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Marketplace = ({ marketplaceContract, account }) => {
  const [loanOffers, setLoanOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const tx = await marketplaceContract.applyForLoan(offerId);
      console.log('Applying for loan...', tx.hash);
      await tx.wait();
      
      alert('✅ Loan application submitted! The lender will review your application.');
    } catch (error) {
      console.error('Error applying for loan:', error);
      alert('❌ Error applying for loan: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <h2>📊 Loan Marketplace</h2>
        <p>Loading available loan offers...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>📊 Loan Marketplace</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Browse available loan offers and apply confidentially.
      </p>

      {loanOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <h3>No active loan offers available</h3>
          <p>Check back later or create a loan offer as a lender.</p>
        </div>
      ) : (
        <div className="loan-offers">
          {loanOffers.map((offer) => (
            <div key={offer.id.toString()} className="loan-offer-card">
              <h4>Loan Offer #{offer.id.toString()}</h4>
              
              <div className="offer-details">
                <div className="detail-item">
                  <span className="detail-label">Loan Amount</span>
                  <span className="detail-value">
                    {ethers.formatEther(offer.amount)} ETH
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Min Credit Score</span>
                  <span className="detail-value">{offer.minCreditScore.toString()}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Interest Rate</span>
                  <span className="detail-value">
                    {(offer.interestRate / 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              <button 
                onClick={() => applyForLoan(offer.id)}
                className="apply-btn"
              >
                📝 Apply for Loan
              </button>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={loadLoanOffers}
        style={{ 
          marginTop: '2rem', 
          padding: '0.75rem 1.5rem',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        🔄 Refresh Offers
      </button>
    </div>
  );
};

export default Marketplace;