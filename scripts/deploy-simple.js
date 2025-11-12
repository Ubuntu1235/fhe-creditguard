const { ethers } = require("hardhat");

async function main() {
  console.log("🔗 Checking connection to Sepolia...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("✅ Connected to network");
    console.log("📝 Deployer address:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.log("❌ Insufficient ETH for deployment");
      console.log("💧 Get free Sepolia ETH from: https://faucets.chain.link/sepolia");
      return;
    }

    console.log("\n📄 Deploying FHECreditScoring contract...");
    const FHECreditScoring = await ethers.getContractFactory("FHECreditScoring");
    const creditScoring = await FHECreditScoring.deploy();
    await creditScoring.waitForDeployment();
    const creditScoringAddress = await creditScoring.getAddress();
    console.log("✅ FHECreditScoring deployed to:", creditScoringAddress);

    console.log("📄 Deploying ConfidentialLoanMarketplace contract...");
    const ConfidentialLoanMarketplace = await ethers.getContractFactory("ConfidentialLoanMarketplace");
    const marketplace = await ConfidentialLoanMarketplace.deploy(creditScoringAddress);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ ConfidentialLoanMarketplace deployed to:", marketplaceAddress);

    console.log("👥 Registering marketplace as lender...");
    await creditScoring.registerLender(marketplaceAddress);
    console.log("✅ Marketplace registered as lender");

    // Save addresses
    const fs = require('fs');
    const addresses = {
      creditScoring: creditScoringAddress,
      marketplace: marketplaceAddress
    };
    
    fs.writeFileSync('deployment-sepolia.json', JSON.stringify(addresses, null, 2));
    fs.writeFileSync('frontend/src/contract-addresses.js', 
      `export const CREDIT_SCORING_ADDRESS = "${creditScoringAddress}";\nexport const MARKETPLACE_ADDRESS = "${marketplaceAddress}";\nexport const NETWORK = "sepolia";`
    );

    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("==========================================");
    console.log("🏦 FHECreditScoring:", creditScoringAddress);
    console.log("💰 ConfidentialLoanMarketplace:", marketplaceAddress);
    console.log("🌐 Network: Sepolia Testnet");
    console.log("==========================================");
    console.log("\n📁 Addresses saved to:");
    console.log("   - deployment-sepolia.json");
    console.log("   - frontend/src/contract-addresses.js");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("💧 Get free Sepolia ETH from: https://faucets.chain.link/sepolia");
    } else if (error.message.includes("network")) {
      console.log("🔧 Check your RPC URL in .env file");
    }
  }
}

main();