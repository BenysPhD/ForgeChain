import React from 'react';
import { Container, Typography, CircularProgress, Grid, Paper, Stack, TextField, Button } from '@mui/material';
import AgreementCard from '../components/AgreementCard';
import useSupplierAgreement from '../hooks/useSupplierAgreement';

export default function Agreements() {
  const { agreements, loading, retrySyncToERP } = useSupplierAgreement();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Supplier Agreements Overview
      </Typography>

      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Below is the list of supplier agreements retrieved from the blockchain. ERP sync status is also shown.
      </Typography>

      {loading && <CircularProgress />}

      {!loading && agreements.length === 0 && (
        <Typography>No agreements found.</Typography>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          {agreements.map((agreement) => (
            <AgreementCard
              key={agreement.id}
              agreement={agreement}
              onRetry={retrySyncToERP}
            />
          ))}
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Typography variant="h6" gutterBottom>
                Actions & Proofs
              </Typography>

              {/* Submit ZK Proof */}
              <Typography variant="subtitle1">Submit Zero-Knowledge Proof</Typography>
              <input type="file" />
              <Button variant="contained">Submit ZK Proof</Button>

              {/* Rate Supplier */}
              <Typography variant="subtitle1">Rate Supplier</Typography>
              <TextField label="Supplier Address" fullWidth />
              <TextField label="Rating (1-5)" type="number" fullWidth />
              <Button variant="contained" color="secondary">Submit Rating</Button>

              {/* Resolve Dispute */}
              <Typography variant="subtitle1">Resolve Dispute</Typography>
              <TextField label="Dispute Decision" fullWidth />
              <Button variant="contained" color="error">Resolve Dispute</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
