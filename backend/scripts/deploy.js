const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  // 1. Récupération des comptes : deployer, oracle et arbitrator
  const [deployer, oracleAccount, arbitrator] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Oracle Account:", oracleAccount.address);
  console.log("Arbitrator:", arbitrator.address);

  // 2. Déployer le token de test (TestToken) servant de stablecoin
  const TestTokenFactory = await ethers.getContractFactory("TestToken", deployer);
  const stablecoin = await TestTokenFactory.deploy();
  await stablecoin.waitForDeployment();
  const stablecoinAddress = await stablecoin.getAddress();
  console.log("Stablecoin déployé à:", stablecoinAddress);

  // 3. Déployer OracleMock
  const OracleFactory = await ethers.getContractFactory("OracleMock", deployer);
  const oracleMock = await OracleFactory.deploy();
  await oracleMock.waitForDeployment();
  const oracleMockAddress = await oracleMock.getAddress();
  console.log("OracleMock déployé à:", oracleMockAddress);

  // 4. Déployer SupplierAgreement
  // Le constructeur attend : ( _oracle, _arbitrator, _oracleAddress, _tokenAddress )
  const SupplierAgreementFactory = await ethers.getContractFactory("SupplierAgreement", deployer);
  const supplierAgreement = await SupplierAgreementFactory.deploy(
    oracleAccount.address,
    arbitrator.address,
    oracleMockAddress,
    stablecoinAddress
  );
  await supplierAgreement.waitForDeployment();
  const supplierAgreementAddress = await supplierAgreement.getAddress();
  console.log("SupplierAgreement déployé à:", supplierAgreementAddress);

  // 5. Déployer Litige
  const LitigeFactory = await ethers.getContractFactory("Litige", deployer);
  const litigeContract = await LitigeFactory.deploy();
  await litigeContract.waitForDeployment();
  const litigeAddress = await litigeContract.getAddress();
  console.log("Litige déployé à:", litigeAddress);

  // 🔥 6. Sauvegarder toutes les adresses dans un fichier JSON
  const deploymentInfo = {
    stablecoinAddress,
    oracleMockAddress,
    supplierAgreementAddress,
    litigeAddress
  };

  fs.writeFileSync(
    path.resolve(__dirname, "../deploymentInfo.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Déploiement terminé avec succès et addresses sauvegardées dans deploymentInfo.json !");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur de déploiement :", error);
    process.exit(1);
  });
