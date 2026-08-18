import React from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function ReserveFunds({ onReserve }) {
  function reserve() {
    onReserve && onReserve();
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2">Reserve Funds</Typography>
      <Button variant="outlined" onClick={reserve}>Reserve</Button>
    </Box>
  );
}
