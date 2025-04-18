import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  Container, Typography, Button, CircularProgress, Box, Paper, Stack, TextField, Divider, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import UploadIcon from '@mui/icons-material/CloudUpload';
import StarRateIcon from '@mui/icons-material/StarRate';
import contractConfig from './config/contractConfig';
import { uploadToIPFS } from './utils/ipfs';
import useERPIntegration from './hooks/useERPIntegration';

const agreementStates = [
  'Negotiation', 'PendingPayment', 'Pending',
  'InProgress', 'Dispatched', 'Completed',
  'Disputed', 'Cancelled'
];

export default function App() {
  const [account, setAccount] = useState('');
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zkProof, setZkProof] = useState('');
  const [rating, setRating] = useState('');
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');

  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error('Metamask not detected');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const agr = await contract.agreement();
      setAgreement(agr);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createAgreementWithIPFS() {
    try {
      if (!file) throw new Error("No file selected");
      const hash = await uploadToIPFS(file);
      setFileHash(hash);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const deadline = Math.floor(Date.now() / 1000) + 3600 * 24;
      const tx = await contract.createAgreement(1000, 500, deadline, hash);
      await tx.wait();
      alert('Agreement with IPFS file created!');
      
      const agreementData = {
        agreementId: tx.hash.slice(0, 10),
        quantity: 1000,
        price: 500,
        deadline,
        ipfsHash: hash,
        txHash: tx.hash
      };
      await useERPIntegration().syncToERP(agreementData);

      const agr = await contract.agreement();
      setAgreement(agr);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitZkProof() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const tx = await contract.submitZKProof(zkProof);
      await tx.wait();
      alert('ZK Proof submitted');
    } catch (err) {
      setError(err.message);
    }
  }

  async function rateSupplier() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const tx = await contract.rateSupplier(account, parseInt(rating));
      await tx.wait();
      alert('Rating submitted');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <Container maxWidth="md" sx={{ my: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, backgroundColor: '#ffffffdd' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'center' }}>
          ForgeChain
        </Typography>

        {account && (
          <Typography variant="h6" gutterBottom color="text.secondary" textAlign="center">
            Connected Account: {account}
          </Typography>
        )}

        <Typography variant="body2" gutterBottom sx={{ fontStyle: 'italic', textAlign: 'center', mb: 3 }}>
          Contract Address: {contractConfig.supplierAgreementAddress}
        </Typography>

        {loading && <Box textAlign="center"><CircularProgress /></Box>}

        {error && (
          <Typography variant="body1" color="error" sx={{ mt: 2, textAlign: 'center' }}>
            Error: {error}
          </Typography>
        )}

        {agreement && (
          <Box mt={4}>
            <Typography><strong>Quantity:</strong> {agreement.quantity.toString()}</Typography>
            <Typography><strong>Price:</strong> {agreement.price.toString()}</Typography>
            <Typography><strong>Deadline:</strong> {new Date(agreement.deadline.toNumber() * 1000).toLocaleString()}</Typography>
            <Typography><strong>Status:</strong> {agreementStates[agreement.state.toNumber()]}</Typography>
            <Typography><strong>IPFS:</strong> {agreement.ipfsHash}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3}>
          {/* Gauche: créer accord */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              <Button variant="contained" startIcon={<AddIcon />} onClick={createAgreementWithIPFS}>
                Create Agreement with File
              </Button>
            </Stack>
          </Grid>

          {/* Droite: ZK Proof + rating */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <TextField
                label="ZK Proof Hash"
                fullWidth
                variant="outlined"
                value={zkProof}
                onChange={(e) => setZkProof(e.target.value)}
              />
              <Button variant="contained" color="secondary" startIcon={<UploadIcon />} onClick={submitZkProof}>
                Submit ZK Proof
              </Button>

              <TextField
                label="Rate Supplier (1–5)"
                fullWidth
                type="number"
                variant="outlined"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
              <Button variant="outlined" startIcon={<StarRateIcon />} onClick={rateSupplier}>
                Submit Rating
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
