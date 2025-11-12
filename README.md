# FHE CreditGuard - Confidential Credit Scoring dApp

## Overview
FHE CreditGuard is a revolutionary decentralized credit scoring system that uses Fully Homomorphic Encryption (FHE) to compute credit scores without ever decrypting user data. This ensures complete privacy while maintaining functionality.

## Unique Features
- **True Data Privacy**: Raw financial data never exposed to anyone
- **Confidential Computations**: Credit scores calculated on encrypted data
- **Zero-Knowledge Proofs**: Lenders verify qualifications without seeing scores
- **Decentralized Marketplace**: Private loan application system

## Technology Stack
- **Smart Contracts**: Solidity + FHEVM
- **Frontend**: React + Vite
- **Encryption**: Zama FHEVM library
- **Testing**: Hardhat + Chai

## Local Development Setup

### Prerequisites
- Node.js 18+
- MetaMask
- Hardhat

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install