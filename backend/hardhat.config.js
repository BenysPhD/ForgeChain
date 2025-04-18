require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");

// On importe fs et path pour la tâche
const fs = require("fs");
const path = require("path");

// Définition de la config Hardhat
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    local: {
      url: "http://localhost:8545",
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
      },
    },
  },
};

// Tâche copy-abis : juste après ou avant le `module.exports` c’est OK
task("copy-abis", "Copies ABIs and generates contractConfig.js for frontend")
  .setAction(async () => {
    const contracts = ["SupplierAgreement", "TestToken", "OracleMock", "Litige"];
    const srcDir = path.resolve(__dirname, "artifacts/contracts");
    const destAbis = path.resolve(__dirname, "../isopep-frontend/src/config/abis");

    // Création du dossier abis si pas existant
    if (!fs.existsSync(destAbis)) {
      fs.mkdirSync(destAbis, { recursive: true });
    }

    for (const name of contracts) {
      const src = path.join(srcDir, `${name}.sol`, `${name}.json`);
      const dest = path.join(destAbis, `${name}.json`);
      fs.copyFileSync(src, dest);
      console.log(`Copied ${name}.json`);
    }

    // Exemple : Lecture du SupplierAgreement et génération contractConfig.js
    // (Selon si tu veux lire l'adresse dynamiquement depuis un deploymentInfo.json)
    try {
      const supplierAgreementArtifact = require(path.join(srcDir, "SupplierAgreement.sol", "SupplierAgreement.json"));
      const abi = supplierAgreementArtifact.abi;

      // Lecture optionnelle d'un fichier deploymentInfo.json
      let supplierAgreementAddress = "0xYourDeployedContractAddress";
      const deployInfoPath = path.resolve(__dirname, "deploymentInfo.json");
      if (fs.existsSync(deployInfoPath)) {
        const { supplierAgreementAddress: newAddr } = JSON.parse(fs.readFileSync(deployInfoPath, "utf-8"));
        if (newAddr) supplierAgreementAddress = newAddr;
      }

      // Génération du contractConfig.js
      const configPath = path.resolve(__dirname, "../isopep-frontend/src/config/contractConfig.js");
      const configContent = `const contractConfig = {
  supplierAgreementAddress: "${supplierAgreementAddress}",
  supplierAgreementABI: ${JSON.stringify(abi, null, 2)}
};

export default contractConfig;
`;

      fs.writeFileSync(configPath, configContent, "utf-8");
      console.log(`Generated contractConfig.js with address: ${supplierAgreementAddress}`);
    } catch (err) {
      console.log("Pas de SupplierAgreement.json ou pas d'ABI trouvé, skip contractConfig.js generation");
    }
  });
