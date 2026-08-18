import React from 'react';
import { Box, Typography } from '@mui/material';
import DeliveryTable from './DeliveryTable';

export default function PendingDeliveries({ deliveries = [] }) {
  const pendingDeliveries = deliveries.filter((delivery) =>
    ['pending', 'scheduled', 'in transit'].includes(String(delivery.deliveryStatus || delivery.status || '').toLowerCase())
  );
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Pending Deliveries</Typography>
      <DeliveryTable deliveries={pendingDeliveries} />
    </Box>
  );
}
