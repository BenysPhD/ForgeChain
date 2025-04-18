// src/hooks/useERPIntegration.js
import { useState } from 'react';
import axios from 'axios';

export default function useERPIntegration() {
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [loading, setLoading] = useState(false);

  const syncToERP = async (agreement) => {
    setLoading(true);
    setSyncError(null);
    try {
      const res = await axios.post('http://localhost:5000/sync-agreement', {
        agreementId: agreement.id,
        quantity: agreement.quantity,
        price: agreement.price,
        deadline: agreement.deadline,
        ipfsHash: agreement.ipfsHash,
        txHash: agreement.txHash
      });
      setSyncStatus('success');
      return res.data;
    } catch (err) {
      setSyncStatus('failed');
      setSyncError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkSyncStatus = async (agreementId) => {
    try {
      const res = await axios.get(`http://localhost:5000/sync-status/${agreementId}`);
      return res.data.status;
    } catch (err) {
      return 'unknown';
    }
  };

  return {
    syncToERP,
    checkSyncStatus,
    syncStatus,
    syncError,
    loading
  };
}
