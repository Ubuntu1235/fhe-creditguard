const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying FHE CreditGuard to Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

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

  // Register marketplace as a lender
  console.log("👥 Registering marketplace as lender...");
  await creditScoring.registerLender(marketplaceAddress);
  console.log("✅ Marketplace registered as lender");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    contracts: {
      creditScoring: creditScoringAddress,
      marketplace: marketplaceAddress
    },
    deployer: deployer.address
  };

  fs.writeFileSync('deployment-sepolia.json', JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync('frontend/src/contract-addresses.js', 
    `export const CREDIT_SCORING_ADDRESS = "${creditScoringAddress}";\nexport const MARKETPLACE_ADDRESS = "${marketplaceAddress}";\nexport const NETWORK = "sepolia";`
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("==========================================");
  console.log("📋 Deployment Summary:");
  console.log("==========================================");
  console.log(`🏦 FHECreditScoring: ${creditScoringAddress}`);
  console.log(`💰 ConfidentialLoanMarketplace: ${marketplaceAddress}`);
  console.log(`🌐 Network: Sepolia Testnet`);
  console.log("==========================================");
  
  console.log("\n⏳ Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
  
  console.log("\n✅ Contracts ready on Sepolia!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });