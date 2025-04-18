import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2025 <strong>ForgeChain</strong> — All rights reserved.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Built with  React, Hardhat & Ethereum — enabling transparent & sustainable supplier selection
      </Typography>
      <Typography variant="caption" color="text.disabled">
        Designed for academic validation and industrial deployment (Isopep Case Study)
      </Typography>
    </Box>
  );
}
