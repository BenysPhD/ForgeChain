import React, { useState } from 'react';
import {
  Container, Typography, Box, Stack,
  TextField, Button, CircularProgress
} from '@mui/material';
import AgreementCard from '../components/AgreementCard';
import useSupplierAgreement from '../hooks/useSupplierAgreement';
import { ethers } from 'ethers';
import contractConfig from '../config/contractConfig';
import { uploadToIPFS } from '../utils/ipfs';

export default function Dashboard() {
  const { agreements, retrySync, refreshAgreements } = useSupplierAgreement();

  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState(null);
  const [zkProof, setZkProof] = useState(null);
  const [supplierToRate, setSupplierToRate] = useState('');
  const [rating, setRating] = useState('');
  const [disputeDecision, setDisputeDecision] = useState('');
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const provider = new ethers.BrowserProvider(window.ethereum);

  const handleCreateAgreement = async () => {
    if (!file) return setStatus("Please select a file for IPFS upload");

    try {
      setUploading(true);
      setStatus("Uploading file to IPFS...");
      const ipfsHash = await uploadToIPFS(file);
      setStatus("Creating agreement on blockchain...");

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      const tx = await contract.createAgreement(
        Number(quantity),
        Number(price),
        deadlineTimestamp,
        ipfsHash
      );

      await tx.wait();
      setStatus("Agreement created successfully.");
      refreshAgreements();

      setQuantity('');
      setPrice('');
      setDeadline('');
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus("Error creating agreement.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const totalAmount = Number(quantity) * Number(price);
      const tx = await contract.confirmPayment(totalAmount);
      setStatus("Confirming payment...");
      await tx.wait();
      setStatus("Payment confirmed.");
      refreshAgreements();
    } catch (err) {
      console.error(err);
      setStatus("Error confirming payment.");
    }
  };

  const handleDispatchOrder = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const tx = await contract.dispatchOrder();
      setStatus("Dispatching order...");
      await tx.wait();
      setStatus("Order dispatched.");
      refreshAgreements();
    } catch (err) {
      console.error(err);
      setStatus("Error dispatching order.");
    }
  };

  const handleSubmitZKProof = async () => {
    if (!zkProof) return setStatus("Select a ZK proof file first.");

    try {
      const arrayBuffer = await zkProof.arrayBuffer();
      const proofBytes = new Uint8Array(arrayBuffer);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const tx = await contract.submitZKProof(proofBytes);
      setStatus("Submitting Zero-Knowledge proof...");
      await tx.wait();
      setStatus("ZK proof submitted.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to submit ZK proof.");
    }
  };

  const handleRateSupplier = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const tx = await contract.rateSupplier(supplierToRate, Number(rating));
      setStatus("Rating supplier...");
      await tx.wait();
      setStatus("Supplier rated successfully.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to rate supplier.");
    }
  };

  const handleStartAgreement = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const tx = await contract.startAgreement();
      setStatus("Starting agreement...");
      await tx.wait();
      setStatus("Agreement started.");
      refreshAgreements();
    } catch (err) {
      console.error(err);
      setStatus("Error starting agreement.");
    }
  };

  const handleResolveDispute = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const tx = await contract.resolveDispute(disputeDecision);
      setStatus("Resolving dispute...");
      await tx.wait();
      setStatus("Dispute resolved.");
      refreshAgreements();
    } catch (err) {
      console.error(err);
      setStatus("Failed to resolve dispute.");
    }
  };

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Supplier Agreements Overview
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Below is the list of supplier agreements retrieved from the blockchain. ERP sync status is also shown.
      </Typography>

      <Box mb={5}>
        <Typography variant="h6" gutterBottom>Create New Supplier Agreement</Typography>
        <Stack spacing={2} maxWidth={400}>
          <TextField
            label="Quantity"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            type="number"
          />
          <TextField
            label="Price per Unit"
            value={price}
            onChange={e => setPrice(e.target.value)}
            type="number"
          />
          <TextField
            label="Deadline"
            type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            InputLabelProps={{ shrink: true }}
            slotProps={{ input: { step: 60 } }}
          />
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            accept=".pdf,.doc,.docx,.png,.jpg"
          />
          <Button variant="contained" onClick={handleCreateAgreement} disabled={uploading}>
            {uploading ? <CircularProgress size={20} color="inherit" /> : 'Create Agreement'}
          </Button>
          <Button variant="outlined" onClick={handleConfirmPayment}>Confirm Payment</Button>
          <Button variant="outlined" onClick={handleStartAgreement}>Start Agreement</Button>
          <Button variant="outlined" onClick={handleDispatchOrder}>Dispatch Order</Button>

          <Typography variant="h6" mt={4}>Submit Zero-Knowledge Proof</Typography>
          <input
            type="file"
            accept=".txt,.json,.bin"
            onChange={(e) => setZkProof(e.target.files[0])}
          />
          <Button variant="outlined" onClick={handleSubmitZKProof}>Submit ZK Proof</Button>

          <Typography variant="h6" mt={4}>Rate Supplier</Typography>
          <TextField
            label="Supplier Address"
            value={supplierToRate}
            onChange={e => setSupplierToRate(e.target.value)}
          />
          <TextField
            label="Rating (1–5)"
            value={rating}
            onChange={e => setRating(e.target.value)}
            type="number"
          />
          <Button variant="outlined" onClick={handleRateSupplier}>Submit Rating</Button>

          <Typography variant="h6" mt={4}>Resolve Dispute</Typography>
          <TextField
            label="Dispute Decision"
            placeholder='RefundBuyer or ReleaseFunds'
            value={disputeDecision}
            onChange={(e) => setDisputeDecision(e.target.value)}
          />
          <Button variant="outlined" onClick={handleResolveDispute}>Resolve Dispute</Button>

          <Typography>{status}</Typography>
        </Stack>
      </Box>

      {agreements.length === 0 && (
        <Typography variant="body1" sx={{ mt: 4 }}>
          No supplier agreements found. Start by creating one.
        </Typography>
      )}

      <Box>
        {agreements.map((agreement) => (
          <AgreementCard key={agreement.id} agreement={agreement} onRetry={retrySync} />
        ))}
      </Box>
    </Container>
  );
}
