import React from 'react';
import { Box, Typography } from '@mui/material';

export default function ContractStatusSummary({ total = 20, expiringSoon = 4 }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Total Contracts</Typography>
      <Typography variant="h6" fontWeight={700}>{total}</Typography>
      <Typography variant="body2">Expiring Soon: {expiringSoon}</Typography>
    </Box>
  );
}
