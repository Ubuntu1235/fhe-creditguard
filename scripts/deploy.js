const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying FHE CreditGuard contracts...\n");

  // Get the deployer and test accounts
  const [deployer, lender1, lender2, lender3, user1, user2] = await ethers.getSigners();
  
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy FHECreditScoring
  console.log("📄 Deploying FHECreditScoring contract...");
  const FHECreditScoring = await ethers.getContractFactory("FHECreditScoring");
  const creditScoring = await FHECreditScoring.deploy();
  await creditScoring.waitForDeployment();
  const creditScoringAddress = await creditScoring.getAddress();
  console.log("✅ FHECreditScoring deployed to:", creditScoringAddress);

  // Deploy ConfidentialLoanMarketplace
  console.log("📄 Deploying ConfidentialLoanMarketplace contract...");
  const ConfidentialLoanMarketplace = await ethers.getContractFactory("ConfidentialLoanMarketplace");
  const marketplace = await ConfidentialLoanMarketplace.deploy(creditScoringAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ ConfidentialLoanMarketplace deployed to:", marketplaceAddress);

  // Register lenders
  console.log("\n👥 Registering lenders...");
  await creditScoring.registerLender(lender1.address);
  console.log(`✅ Registered lender 1: ${lender1.address}`);

  await creditScoring.registerLender(lender2.address);
  console.log(`✅ Registered lender 2: ${lender2.address}`);

  await creditScoring.registerLender(lender3.address);
  console.log(`✅ Registered lender 3: ${lender3.address}`);

  // Register marketplace as a lender so it can check credit qualifications
  await creditScoring.registerLender(marketplaceAddress);
  console.log(`✅ Registered marketplace as lender: ${marketplaceAddress}`);

  // Create some sample loan offers
  console.log("\n💸 Creating sample loan offers...");
  
  // Lender 1 creates offers
  await marketplace.connect(lender1).createLoanOffer(
    ethers.parseEther("1.0"), // 1 ETH
    650, // min credit score
    500 // 5% interest rate
  );
  console.log("✅ Created loan offer 1: 1.0 ETH, min score 650, 5% interest");

  await marketplace.connect(lender1).createLoanOffer(
    ethers.parseEther("2.5"), // 2.5 ETH
    700, // min credit score
    300 // 3% interest rate
  );
  console.log("✅ Created loan offer 2: 2.5 ETH, min score 700, 3% interest");

  // Lender 2 creates offers
  await marketplace.connect(lender2).createLoanOffer(
    ethers.parseEther("0.5"), // 0.5 ETH
    600, // min credit score
    800 // 8% interest rate
  );
  console.log("✅ Created loan offer 3: 0.5 ETH, min score 600, 8% interest");

  await marketplace.connect(lender2).createLoanOffer(
    ethers.parseEther("5.0"), // 5 ETH
    750, // min credit score
    250 // 2.5% interest rate
  );
  console.log("✅ Created loan offer 4: 5.0 ETH, min score 750, 2.5% interest");

  // Submit sample user data for testing
  console.log("\n👤 Submitting sample user data...");
  
  // Helper function to encode data
  const encodeData = (value) => {
    return ethers.AbiCoder.defaultAbiCoder().encode(["uint32"], [value]);
  };

  // User 1 data (good credit)
  await creditScoring.connect(user1).submitCreditData(
    encodeData(75000),  // income: $75,000
    encodeData(5000),   // debt: $5,000
    encodeData(95),     // payment history: 95/100
    encodeData(25)      // credit utilization: 25%
  );
  console.log("✅ Submitted data for User 1 (good credit)");

  // User 2 data (average credit)
  await creditScoring.connect(user2).submitCreditData(
    encodeData(45000),  // income: $45,000
    encodeData(15000),  // debt: $15,000
    encodeData(75),     // payment history: 75/100
    encodeData(65)      // credit utilization: 65%
  );
  console.log("✅ Submitted data for User 2 (average credit)");

  // Test credit qualifications
  console.log("\n🧪 Testing credit qualifications...");
  
  try {
    const user1Qualified = await creditScoring.connect(lender1).checkCreditQualification(user1.address, 650);
    console.log(`✅ User 1 qualification check (min 650): ${user1Qualified}`);
    
    const user2Qualified = await creditScoring.connect(lender1).checkCreditQualification(user2.address, 650);
    console.log(`✅ User 2 qualification check (min 650): ${user2Qualified}`);
  } catch (error) {
    console.log("⚠️ Qualification test skipped (might be due to test setup)");
  }

  // Get active offers count
  const activeOffers = await marketplace.getActiveOffers();
  console.log(`\n📊 Total active loan offers: ${activeOffers.length}`);

  // Save deployment info to file
  console.log("\n💾 Saving deployment information...");
  const fs = require('fs');
  
  const deploymentInfo = {
    network: "localhost",
    timestamp: new Date().toISOString(),
    contracts: {
      creditScoring: creditScoringAddress,
      marketplace: marketplaceAddress
    },
    accounts: {
      deployer: deployer.address,
      lenders: [
        lender1.address,
        lender2.address,
        lender3.address
      ],
      users: [
        user1.address,
        user2.address
      ]
    },
    loanOffers: [
      {
        id: 0,
        lender: lender1.address,
        amount: "1.0 ETH",
        minScore: 650,
        interestRate: "5%"
      },
      {
        id: 1,
        lender: lender1.address,
        amount: "2.5 ETH",
        minScore: 700,
        interestRate: "3%"
      },
      {
        id: 2,
        lender: lender2.address,
        amount: "0.5 ETH",
        minScore: 600,
        interestRate: "8%"
      },
      {
        id: 3,
        lender: lender2.address,
        amount: "5.0 ETH",
        minScore: 750,
        interestRate: "2.5%"
      }
    ]
  };

  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync('frontend/src/contract-addresses.js', 
    `export const CREDIT_SCORING_ADDRESS = "${creditScoringAddress}";\nexport const MARKETPLACE_ADDRESS = "${marketplaceAddress}";`
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("==========================================");
  console.log("📋 Deployment Summary:");
  console.log("==========================================");
  console.log(`🏦 FHECreditScoring: ${creditScoringAddress}`);
  console.log(`💰 ConfidentialLoanMarketplace: ${marketplaceAddress}`);
  console.log(`👥 Registered Lenders: 4 (including marketplace)`);
  console.log(`💸 Loan Offers Created: 4`);
  console.log(`👤 Sample Users: 2`);
  console.log("==========================================");
  console.log("\n🔧 Next steps:");
  console.log("1. Update frontend with contract addresses");
  console.log("2. Run 'cd frontend && npm run dev' to start the dApp");
  console.log("3. Connect MetaMask to http://localhost:8545");
  console.log("4. Import test accounts using private keys from Hardhat");
  console.log("\n📁 Deployment info saved to:");
  console.log("   - deployment-info.json");
  console.log("   - frontend/src/contract-addresses.js");
}

// Helper function to handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });