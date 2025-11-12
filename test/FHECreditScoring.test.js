const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FHE CreditGuard", function () {
  let creditScoring;
  let marketplace;
  let owner, user1, lender1, lender2;

  beforeEach(async function () {
    [owner, user1, lender1, lender2] = await ethers.getSigners();

    // Deploy FHECreditScoring
    const FHECreditScoring = await ethers.getContractFactory("FHECreditScoring");
    creditScoring = await FHECreditScoring.deploy();
    await creditScoring.waitForDeployment();

    // Deploy Marketplace
    const ConfidentialLoanMarketplace = await ethers.getContractFactory("ConfidentialLoanMarketplace");
    marketplace = await ConfidentialLoanMarketplace.deploy(await creditScoring.getAddress());
    await marketplace.waitForDeployment();

    // Register lenders
    await creditScoring.registerLender(lender1.address);
    await creditScoring.registerLender(lender2.address);
  });

  describe("Credit Data Submission", function () {
    it("Should allow users to submit credit data", async function () {
      const encryptedIncome = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [50000]);
      const encryptedDebt = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [10000]);
      const encryptedPaymentHistory = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [85]);
      const encryptedCreditUtilization = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [30]);

      await expect(
        creditScoring.connect(user1).submitCreditData(
          encryptedIncome,
          encryptedDebt,
          encryptedPaymentHistory,
          encryptedCreditUtilization
        )
      ).to.emit(creditScoring, "CreditDataSubmitted").withArgs(user1.address);
    });

    it("Should prevent duplicate data submission", async function () {
      const encryptedData = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [50000]);
      
      await creditScoring.connect(user1).submitCreditData(
        encryptedData, encryptedData, encryptedData, encryptedData
      );

      await expect(
        creditScoring.connect(user1).submitCreditData(
          encryptedData, encryptedData, encryptedData, encryptedData
        )
      ).to.be.revertedWith("Data already submitted");
    });
  });

  describe("Credit Qualification", function () {
    beforeEach(async function () {
      const encryptedIncome = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [50000]);
      const encryptedDebt = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [10000]);
      const encryptedPaymentHistory = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [85]);
      const encryptedCreditUtilization = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [30]);

      await creditScoring.connect(user1).submitCreditData(
        encryptedIncome,
        encryptedDebt,
        encryptedPaymentHistory,
        encryptedCreditUtilization
      );
    });

    it("Should allow lenders to check credit qualification", async function () {
      const minScore = 600;
      
      await expect(
        creditScoring.connect(lender1).checkCreditQualification(user1.address, minScore)
      ).to.emit(creditScoring, "CreditCheckPerformed");
    });

    it("Should prevent unregistered lenders from checking", async function () {
      const [unauthorized] = await ethers.getSigners();
      
      await expect(
        creditScoring.connect(unauthorized).checkCreditQualification(user1.address, 600)
      ).to.be.revertedWith("Not registered lender");
    });
  });

  describe("Loan Marketplace", function () {
    beforeEach(async function () {
      // Submit credit data for user1
      const encryptedIncome = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [75000]);
      const encryptedDebt = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [5000]);
      const encryptedPaymentHistory = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [95]);
      const encryptedCreditUtilization = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [25]);

      await creditScoring.connect(user1).submitCreditData(
        encryptedIncome,
        encryptedDebt,
        encryptedPaymentHistory,
        encryptedCreditUtilization
      );
    });

    it("Should allow lenders to create loan offers", async function () {
      await expect(
        marketplace.connect(lender1).createLoanOffer(
          ethers.parseEther("1.0"), // 1 ETH
          650, // min credit score
          500 // 5% interest rate
        )
      ).to.emit(marketplace, "LoanOfferCreated");
    });

    it("Should allow qualified users to apply for loans", async function () {
      // Create loan offer
      await marketplace.connect(lender1).createLoanOffer(
        ethers.parseEther("1.0"),
        650,
        500
      );

      // Apply for loan
      await expect(
        marketplace.connect(user1).applyForLoan(0)
      ).to.emit(marketplace, "LoanApplied");
    });
  });
});