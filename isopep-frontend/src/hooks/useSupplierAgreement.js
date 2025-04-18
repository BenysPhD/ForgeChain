import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractConfig from '../config/contractConfig';
import axios from 'axios';

export default function useSupplierAgreement() {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAgreements() {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );

      const raw = await contract.agreement();
      const formatted = {
        id: 1,
        quantity: raw.quantity.toString(),
        price: raw.price.toString(),
        deadline: raw.deadline.toNumber(),
        state: raw.state.toString(),
        ipfsHash: raw.ipfsHash,
        erpSynced: false
      };

      setAgreements([formatted]);
    } catch (err) {
      console.error('Fetch agreements failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function retrySyncToERP(id) {
    const agreement = agreements.find(a => a.id === id);
    if (!agreement) return;
    try {
      const response = await axios.post('http://localhost:3001/api/sync-agreement', agreement);
      console.log('✅ Synced to ERP:', response.data);
      setAgreements(prev => prev.map(a =>
        a.id === id ? { ...a, erpSynced: true } : a
      ));
    } catch (err) {
      console.error('❌ Retry failed:', err);
    }
  }

  async function confirmPayment(paymentAmount) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );
      const tx = await contract.confirmPayment(paymentAmount);
      await tx.wait();
      await fetchAgreements();
    } catch (err) {
      console.error('❌ Confirm payment failed:', err);
    }
  }

  async function dispatchOrder() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );
      const tx = await contract.dispatchOrder();
      await tx.wait();
      await fetchAgreements();
    } catch (err) {
      console.error('❌ Dispatch order failed:', err);
    }
  }

  async function submitZKProof(zkProofBytes) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );
      const tx = await contract.submitZKProof(zkProofBytes);
      await tx.wait();
      await fetchAgreements();
    } catch (err) {
      console.error('❌ ZK Proof submission failed:', err);
    }
  }

  async function rateSupplier(address, rating) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.supplierAgreementAddress,
        contractConfig.supplierAgreementABI,
        signer
      );
      const tx = await contract.rateSupplier(address, rating);
      await tx.wait();
      await fetchAgreements();
    } catch (err) {
      console.error('❌ Supplier rating failed:', err);
    }
  }

  useEffect(() => {
    fetchAgreements();
  }, []);

  return {
    agreements,
    loading,
    retrySync: retrySyncToERP,
    refreshAgreements: fetchAgreements,
    confirmPayment,
    dispatchOrder,
    submitZKProof,
    rateSupplier
  };
}
