// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FHECreditScoring {
    struct CreditData {
        uint32 income;
        uint32 debt;
        uint32 paymentHistory;
        uint32 creditUtilization;
        bool dataSubmitted;
    }

    mapping(address => CreditData) private userCreditData;
    mapping(address => bool) public registeredLenders;
    address public owner;

    event CreditDataSubmitted(address indexed user);
    event CreditCheckPerformed(address indexed lender, address indexed user, bool qualified);

    constructor() {
        owner = msg.sender;
    }

    function submitCreditData(
        bytes calldata _encryptedIncome,
        bytes calldata _encryptedDebt, 
        bytes calldata _encryptedPaymentHistory,
        bytes calldata _encryptedCreditUtilization
    ) external {
        require(!userCreditData[msg.sender].dataSubmitted, "Data already submitted");

        userCreditData[msg.sender] = CreditData({
            income: abi.decode(_encryptedIncome, (uint32)),
            debt: abi.decode(_encryptedDebt, (uint32)),
            paymentHistory: abi.decode(_encryptedPaymentHistory, (uint32)),
            creditUtilization: abi.decode(_encryptedCreditUtilization, (uint32)),
            dataSubmitted: true
        });

        emit CreditDataSubmitted(msg.sender);
    }

    function calculateCreditScore(address _user) private view returns (uint32) {
        CreditData storage data = userCreditData[_user];
        require(data.dataSubmitted, "No credit data available");
        
        // Simplified credit score calculation
        uint32 incomeScore = data.income / 1000;
        uint32 debtRatio = data.debt / 100;
        uint32 paymentScore = data.paymentHistory / 10;
        uint32 utilizationScore = 100 - data.creditUtilization;

        // Weighted score calculation
        uint32 score = (incomeScore * 3) + (paymentScore * 4) + (utilizationScore * 2) + debtRatio;
        
        // Normalize to 300-850 range
        score = (score % 551) + 300;
        
        return score;
    }

    function checkCreditQualification(address _user, uint32 _minScore) 
        external 
        returns (bool) 
    {
        require(registeredLenders[msg.sender], "Not registered lender");
        require(userCreditData[_user].dataSubmitted, "User data not available");

        uint32 creditScore = calculateCreditScore(_user);
        bool qualified = creditScore >= _minScore;
        
        emit CreditCheckPerformed(msg.sender, _user, qualified);
        return qualified;
    }

    function registerLender(address _lender) external {
        require(msg.sender == owner, "Only owner can register lenders");
        registeredLenders[_lender] = true;
    }

    function getUserDataStatus(address _user) external view returns (bool) {
        return userCreditData[_user].dataSubmitted;
    }

    function getCreditScoreForTesting(address _user) external view returns (uint32) {
        require(userCreditData[_user].dataSubmitted, "No data available");
        return calculateCreditScore(_user);
    }
}