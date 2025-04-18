// backend/api.js
require('dotenv').config();                  // ← pour lire .env
const path    = require('path');             // ← nécessaire pour servir les fichiers statiques
const express = require('express');
const cors    = require('cors');
const { JsonRpcProvider, Contract } = require('ethers');
const { pinJSONToIPFS } = require('./services/ipfs');  // ←  service Pinata
const contractConfig     = require('./contractConfig.cjs');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Servir les JSON MATLAB statiquement ───────────────────────────────────────
app.use('/data', express.static(path.join(__dirname, 'data')));

// Connexion à l'instance locale d'Ethereum (Hardhat)
const provider = new JsonRpcProvider("http://localhost:8545");

const supplierAgreementContract = new Contract(
  contractConfig.supplierAgreementAddress,
  contractConfig.supplierAgreementABI,
  provider
);

// Map temporaire pour stocker l'état de synchronisation ERP
const syncStatus = new Map(); // Map<agreementId, 'success' | 'failed'>

// === ENDPOINTS EXISTANTS ===

// Lire un accord depuis le contrat
app.get('/agreement', async (req, res) => {
  try {
    const agreement = await supplierAgreementContract.agreement();
    res.json({
      quantity: agreement.quantity.toString(),
      price:    agreement.price.toString(),
      deadline: agreement.deadline.toString(),
      ipfsHash: agreement.ipfsHash,
      state:    agreement.state.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lire les données oracle (si dispo dans ton contrat)
app.get('/oracle-data', async (req, res) => {
  try {
    const data = await supplierAgreementContract.getOracleData();
    res.json({ oracleData: data.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Créer un accord blockchain
app.post('/create-agreement', async (req, res) => {
  try {
    const { quantity, price, deadline, ipfsHash } = req.body;
    const signer   = await provider.getSigner();
    const contractWithSigner = supplierAgreementContract.connect(signer);
    const tx       = await contractWithSigner.createAgreement(quantity, price, deadline, ipfsHash);
    await tx.wait();
    res.json({ txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Synchronisation vers ERP (simulateur)
app.post('/sync-agreement', async (req, res) => {
  const { agreementId, quantity, price, deadline, ipfsHash, txHash } = req.body;
  try {
    if (req.query.fail === 'true') {
      throw new Error("Simulated ERP sync failure");
    }
    console.log(`🔁 Syncing agreement ${agreementId} to ERP...`);
    syncStatus.set(agreementId, 'success');
    res.json({ status: 'success', agreementId, txHash });
  } catch (err) {
    console.error('❌ ERP sync failed:', err.message);
    syncStatus.set(agreementId, 'failed');
    res.status(500).json({ error: err.message });
  }
});

// Lire le statut de synchronisation ERP
app.get('/sync-status/:id', (req, res) => {
  const status = syncStatus.get(req.params.id);
  if (status) {
    res.json({ status });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// === NOUVEL ENDPOINT : PIN JSON MATLAB SUR IPFS ===

app.post('/api/ipfs/pin-json', async (req, res) => {
  try {
    const payload = req.body;              // ton JSON généré par MATLAB
    const cid     = await pinJSONToIPFS(payload);
    return res.json({ cid });
  } catch (err) {
    console.error('Pin JSON error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// === LANCEMENT DU SERVEUR ===

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Middleware API server running on port ${PORT}`);
});
