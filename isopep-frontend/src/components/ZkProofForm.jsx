import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import UploadIcon from '@mui/icons-material/CloudUpload';

export default function ZkProofForm({ onSubmit }) {
  const [proof, setProof] = useState('');

  const handleSubmit = () => {
    if (proof) {
      onSubmit(proof);
      setProof('');
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <TextField
        label="ZK Proof Hash"
        fullWidth
        value={proof}
        onChange={(e) => setProof(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="secondary"
        startIcon={<UploadIcon />}
        onClick={handleSubmit}
        disabled={!proof}
      >
        Submit ZK Proof
      </Button>
    </Box>
  );
}
