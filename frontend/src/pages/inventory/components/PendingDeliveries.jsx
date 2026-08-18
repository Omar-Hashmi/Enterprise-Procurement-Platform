import React from 'react';
import { Box, Typography } from '@mui/material';
import DeliveryTable from './DeliveryTable';

export default function PendingDeliveries() {
  const sample = [{ id: 1, ref: 'DEL-1001', status: 'Pending', eta: '2026-08-20' }];
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Pending Deliveries</Typography>
      <DeliveryTable deliveries={sample} />
    </Box>
  );
}
