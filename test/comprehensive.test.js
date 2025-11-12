const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FHE CreditGuard Comprehensive Tests", function () {
  let creditScoring, marketplace;
  let owner, user1, lender1;

  beforeEach(async function () {
    [owner, user1, lender1] = await ethers.getSigners();
    
    const FHECreditScoring = await ethers.getContractFactory("FHECreditScoring");
    creditScoring = await FHECreditScoring.deploy();
    
    const ConfidentialLoanMarketplace = await ethers.getContractFactory("ConfidentialLoanMarketplace");
    marketplace = await ConfidentialLoanMarketplace.deploy(await creditScoring.getAddress());
    
    await creditScoring.registerLender(await marketplace.getAddress());
  });

  describe("Credit Data Submission", function () {
    it("Should encrypt and store user data", async function () {
      const encryptedData = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [50000]);
      await expect(creditScoring.connect(user1).submitCreditData(
        encryptedData, encryptedData, encryptedData, encryptedData
      )).to.emit(creditScoring, "CreditDataSubmitted");
    });
  });

  describe("Loan Marketplace", function () {
    it("Should create and display loan offers", async function () {
      await marketplace.connect(lender1).createLoanOffer(
        ethers.parseEther("1.0"), 650, 500
      );
      
      const offers = await marketplace.getActiveOffers();
      expect(offers.length).to.equal(1);
    });
  });

  describe("FHE Functionality", function () {
    it("Should calculate credit scores confidentially", async function () {
      // Test FHE computations
      const encryptedData = ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [50000]);
      await creditScoring.connect(user1).submitCreditData(
        encryptedData, encryptedData, encryptedData, encryptedData
      );
      
      // This should work without decrypting raw data
      const qualified = await creditScoring.checkCreditQualification(user1.address, 600);
      expect(qualified).to.be.true;
    });
  });
});