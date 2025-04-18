import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { formatDate, truncateHash } from '../utils/formatters';

const agreementStates = [
  'Negotiation', 'PendingPayment', 'Pending',
  'InProgress', 'Dispatched', 'Completed',
  'Disputed', 'Cancelled'
];

export default function AgreementCard({ agreement, onRetry, onConfirmPayment, onDispatch, onRate, onSubmitZK }) {
  const {
    id,
    quantity,
    price,
    deadline,
    state,
    ipfsHash,
    erpSynced
  } = agreement;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          Agreement #{id}
        </Typography>

        <Typography variant="body1"><strong>Quantity:</strong> {quantity}</Typography>
        <Typography variant="body1"><strong>Price:</strong> {price} USD</Typography>
        <Typography variant="body1"><strong>Deadline:</strong> {formatDate(deadline)}</Typography>
        <Typography variant="body1">
          <strong>Status:</strong> {agreementStates[state] || 'Unknown'}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>IPFS Document:</strong>{' '}
          {ipfsHash ? (
            <a href={`https://ipfs.io/ipfs/${ipfsHash}`} target="_blank" rel="noreferrer">
              {truncateHash(ipfsHash)}
            </a>
          ) : (
            <em>Not available</em>
          )}
        </Typography>

        <Box sx={{ mt: 2 }}>
          {erpSynced ? (
            <Chip label="Synced with ERP" color="success" />
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="Not Synced" color="error" />
              <Button size="small" variant="outlined" onClick={() => onRetry(id)}>
                Retry Sync
              </Button>
            </Stack>
          )}
        </Box>

        {/* 🚩 Ajustement horizontal des boutons ici */}
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            
            {/* Première colonne */}
            <Stack spacing={1}>
              <Button size="small" variant="contained" color="primary" onClick={() => onConfirmPayment(id)}>
                Confirm Payment
              </Button>
              <Button size="small" variant="contained" color="secondary" onClick={() => onDispatch(id)}>
                Dispatch Order
              </Button>
            </Stack>

            {/* Deuxième colonne (remontée visuellement) */}
            <Stack spacing={1}>
              <Button size="small" variant="outlined" onClick={() => onSubmitZK(id)}>
                Submit ZK Proof
              </Button>
              <Button size="small" variant="outlined" color="success" onClick={() => onRate(id, 5)}>
                Rate Supplier ★★★★★
              </Button>
            </Stack>
            
          </Stack>
        </Box>

      </Stack>
    </Paper>
  );
}
