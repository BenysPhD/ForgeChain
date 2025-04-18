import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import { ethers } from 'ethers';
import contractConfig from '../config/contractConfig';
import AuditLogsTable from '../components/AuditLogsTable';

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          contractConfig.supplierAgreementAddress,
          contractConfig.supplierAgreementABI,
          provider
        );

        const events = await contract.queryFilter("*", 0, "latest");

        const formatted = events.map(e => ({
          eventName: e.eventName,
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
          args: e.args ? Object.values(e.args).slice(0, e.args.length) : [],
        }));

        setLogs(formatted);
      } catch (err) {
        console.error("Log fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Container sx={{ my: 5 }}>
      <Typography variant="h4" gutterBottom>
        Blockchain Audit Logs
      </Typography>
      {loading ? <CircularProgress /> : <AuditLogsTable logs={logs} />}
    </Container>
  );
}
