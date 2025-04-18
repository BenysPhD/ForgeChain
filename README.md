# ForgeChain: Blockchain-based DApp for Sustainable Supplier Selection

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Smart Contract Coverage](https://img.shields.io/badge/Coverage-98%25-brightgreen.svg)]()
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.TODO.svg)](https://doi.org/10.5281/zenodo.TODO)

## 🧠 Overview
"ForgeChain" is a full-stack decentralized application (DApp) designed for sustainable supplier selection in Industry 4.0 supply chains. It integrates:

- AHP-TOPSIS for multi-criteria decision making (MCDM)
- NSGA-II for multi-objective optimization
- Ethereum smart contracts (Hardhat)
- IPFS for off-chain document storage
- A React-based frontend with TailwindCSS
- A backend API (ForgeChain middleware) to sync with ERP systems

The framework has been validated in a real-world case study with Isopep Packaging Company.

## 🚀 Features
- Weighted supplier evaluation via AHP and TOPSIS
- Order allocation via NSGA-II under 5 realistic scenarios (baseline, disruption, urgency...)
- Transparent smart contracts for supplier agreement and rating
- IPFS-based immutable storage of contract documents
- Blockchain event logging and ERP/API integration

## 📂 Project Structure
```
ForgeChain/
├── contracts/              # Solidity smart contracts
├── frontend/isopep-frontend/ # React frontend with TailwindCSS
├── backend/                # Node.js + Express middleware API
├── test/                   # Hardhat test suite
├── scripts/                # Deployment scripts
└── README.md               # Project documentation
```

## 🛠️ Technologies
| Stack        | Tools                            |
|--------------|----------------------------------|
| Blockchain   | Ethereum (Hardhat, Solidity)     |
| Frontend     | React, TailwindCSS               |
| Backend      | Node.js, Express                 |
| Optimization | MATLAB (NSGA-II), AHP, TOPSIS    |
| Storage      | IPFS                             |

## 🧪 Test & Coverage
- Hardhat test suite with 98% coverage on `SupplierAgreement.sol`
- Tests include ZK proof submission, arbitration, order dispatch, payment escrow

```bash
npx hardhat test
npx hardhat coverage
```

## 🧾 Smart Contract Overview
- `SupplierAgreement.sol`: manages agreement creation, payment, rating, delivery, and disputes
- `Litige.sol`: handles dispute resolution via arbitrator
- `OracleMock.sol`: used for delivery verification
- `TestToken.sol`: mock ERC20 for testing payments

## 🔁 Optimization Results
- JSON outputs from MATLAB NSGA-II simulations (5 scenarios)
- Interactive visualization of allocations in the DApp

## 📦 Installation
```bash
git clone https://github.com/BenysPhD/ForgeChain.git
cd ForgeChain
npm install
cd frontend/isopep-frontend
npm install && npm run dev
```

## 🌍 Citation
If you use this project in academic work:
```bibtex
@misc{benyelles2025forgechain,
  author       = {Mohammed El Amine Benyelles and Lamia Triqui and Mohammed Dahane},
  title        = {ForgeChain: Blockchain-based DApp for Sustainable Supplier Selection},
  year         = {2025},
  howpublished = {\url{https://github.com/BenysPhD/ForgeChain}},
  note         = {GitHub repository, DOI: \url{https://doi.org/10.5281/zenodo.15243177}}
}

 
```

## 📜 License
This project is licensed under the MIT License.

## 📧 Contact
- Authors:
  - Mohammed El Amine Benyelles  
    Université de Tlemcen, Département de Génie Industriel, Laboratoire MELT  
    📧 mohammedelamine.benyelles@univ-tlemcen.dz (corresponding author)
  - Lamia Triqui  
    Université de Tlemcen, Laboratoire MELT
  - Mohammed Dahane  
    Université de Lorraine, LGIPM, Metz, France


---
> "Towards a decentralized, transparent, and multi-objective supplier management platform in Industry 4.0."

---



