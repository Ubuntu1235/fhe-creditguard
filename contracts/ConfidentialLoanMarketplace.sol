// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./FHECreditScoring.sol";

contract ConfidentialLoanMarketplace {
    FHECreditScoring public creditScoring;

    struct LoanOffer {
        address lender;
        uint256 amount;
        uint32 minCreditScore;
        uint256 interestRate;
        bool active;
    }

    struct LoanApplication {
        address borrower;
        uint256 loanOfferId;
        bool approved;
        bool exists;
    }

    LoanOffer[] public loanOffers;
    mapping(uint256 => LoanApplication) public loanApplications;
    uint256 private applicationCounter;

    event LoanOfferCreated(uint256 offerId, address lender, uint256 amount, uint32 minScore);
    event LoanApplied(uint256 applicationId, address borrower, uint256 offerId);
    event LoanApproved(uint256 applicationId, address borrower, address lender);

    constructor(address _creditScoring) {
        creditScoring = FHECreditScoring(_creditScoring);
    }

    function createLoanOffer(
        uint256 _amount,
        uint32 _minCreditScore,
        uint256 _interestRate
    ) external {
        uint256 offerId = loanOffers.length;
        loanOffers.push(LoanOffer({
            lender: msg.sender,
            amount: _amount,
            minCreditScore: _minCreditScore,
            interestRate: _interestRate,
            active: true
        }));

        emit LoanOfferCreated(offerId, msg.sender, _amount, _minCreditScore);
    }

    function applyForLoan(uint256 _offerId) external {
        require(_offerId < loanOffers.length, "Invalid offer ID");
        require(loanOffers[_offerId].active, "Offer not active");

        bool qualified = creditScoring.checkCreditQualification(
            msg.sender, 
            loanOffers[_offerId].minCreditScore
        );

        require(qualified, "Credit qualification failed");

        applicationCounter++;
        loanApplications[applicationCounter] = LoanApplication({
            borrower: msg.sender,
            loanOfferId: _offerId,
            approved: false,
            exists: true
        });

        emit LoanApplied(applicationCounter, msg.sender, _offerId);
    }

    function approveLoan(uint256 _applicationId) external {
        require(loanApplications[_applicationId].exists, "Application not found");
        
        LoanApplication storage application = loanApplications[_applicationId];
        LoanOffer storage offer = loanOffers[application.loanOfferId];
        
        require(msg.sender == offer.lender, "Only lender can approve");

        application.approved = true;
        emit LoanApproved(_applicationId, application.borrower, offer.lender);
    }

    function getActiveOffers() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < loanOffers.length; i++) {
            if (loanOffers[i].active) {
                activeCount++;
            }
        }

        uint256[] memory activeOffers = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < loanOffers.length; i++) {
            if (loanOffers[i].active) {
                activeOffers[index] = i;
                index++;
            }
        }
        return activeOffers;
    }

    function getLoanOffer(uint256 _offerId) external view returns (LoanOffer memory) {
        require(_offerId < loanOffers.length, "Invalid offer ID");
        return loanOffers[_offerId];
    }

    function getApplicationsByBorrower(address _borrower) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= applicationCounter; i++) {
            if (loanApplications[i].borrower == _borrower) {
                count++;
            }
        }

        uint256[] memory borrowerApplications = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= applicationCounter; i++) {
            if (loanApplications[i].borrower == _borrower) {
                borrowerApplications[index] = i;
                index++;
            }
        }
        return borrowerApplications;
    }
}