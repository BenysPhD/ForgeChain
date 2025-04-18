import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import StarRateIcon from '@mui/icons-material/StarRate';

export default function SupplierRatingForm({ onRate }) {
  const [rating, setRating] = useState('');

  return (
    <Box>
      <TextField
        label="Rate Supplier (1–5)"
        fullWidth
        type="number"
        inputProps={{ min: 1, max: 5 }}
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="outlined"
        startIcon={<StarRateIcon />}
        onClick={() => onRate(parseInt(rating))}
        disabled={!rating}
      >
        Submit Rating
      </Button>
    </Box>
  );
}
