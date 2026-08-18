import React from 'react';
import { Box, Typography } from '@mui/material';

export default function DeliveryStatusSummary({ total = 0, pending = 0 }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Total Deliveries</Typography>
      <Typography variant="h6" fontWeight={700}>{total}</Typography>
      <Typography variant="body2">Pending: {pending}</Typography>
    </Box>
  );
}
