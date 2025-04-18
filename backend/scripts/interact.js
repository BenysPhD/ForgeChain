// scripts/interact.js
const { ethers } = require("hardhat");

async function main() {
  // Récupération des comptes (signers)
  const [buyer, oracle, arbitrator, s1, s2, s3, s4, s5] = await ethers.getSigners();
  console.log("Simulation ISOPEP - Buyer:", buyer.address);

  // 🪙 Déploiement du stablecoin
  const TokenFactory = await ethers.getContractFactory("TestToken", buyer);
  const token = await TokenFactory.deploy();
  await token.waitForDeployment();
  console.log("Stablecoin deployed:", await token.getAddress());

  // Mint de 10 000 tokens au buyer
  await token.mint(buyer.address, ethers.parseEther("10000"));

  // 🔮 Déploiement de l'oracle simulé
  const OracleFactory = await ethers.getContractFactory("OracleMock", oracle);
  const oracleContract = await OracleFactory.deploy();
  await oracleContract.waitForDeployment();

  // 📜 Déploiement du contrat SupplierAgreement
  const SupplierAgreementFactory = await ethers.getContractFactory("SupplierAgreement", buyer);
  const agreement = await SupplierAgreementFactory.deploy(
    oracle.address,
    arbitrator.address,
    await oracleContract.getAddress(),
    await token.getAddress()
  );
  await agreement.waitForDeployment();

  // 🧾 Buyer initie un accord avec le fournisseur S3
  const deadline = Math.floor(Date.now() / 1000) + 3600 * 24; // 24h à partir de maintenant
  await agreement.createAgreement(1000, 10, deadline, "QmHashIsopepTOPSIS2025");
  console.log("Agreement created with deadline:", new Date(deadline * 1000).toISOString());

  // ✅ S3 accepte l'accord
  await agreement.connect(s3).acceptAgreement();

  // 💰 Buyer approuve et paie l'escrow
  const unitPrice = 10;
  const quantity = 1000;
  const total = ethers.parseEther((unitPrice * quantity).toString());
  await token.connect(buyer).approve(await agreement.getAddress(), total);
  await agreement.confirmPayment(total);

  // ▶️ Activation de l'accord
  await agreement.startAgreement();

  // 🚚 S3 livre la commande
  await agreement.connect(s3).dispatchOrder();

  // 🧠 Oracle valide la livraison
  await oracleContract.setLatestAnswer(900); // simulation d'une métrique qualité
  await agreement.connect(oracle).updateDeliveryStatus(true);

  // 🌟 Buyer note le fournisseur S3
  await agreement.rateSupplier(s3.address, 5);

  // 🔍 Affichage des résultats
  const supplierInfo = await agreement.suppliers(s3.address);
  console.log("S3 rating:", supplierInfo.rating);

  const escrow = await agreement.escrowAmount();
  console.log("Escrow restant (devrait = 0):", ethers.formatEther(escrow));

  const supplierBalance = await token.balanceOf(s3.address);
  console.log("S3 token balance:", ethers.formatEther(supplierBalance));

  console.log("\n⚙️  Simulation ISOPEP complète avec succès!");
}

// Gestion des erreurs
main().catch((err) => {
  console.error("Erreur pendant la simulation:", err);
  process.exit(1);
});
