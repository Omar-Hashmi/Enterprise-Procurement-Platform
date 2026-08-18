import React from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function ReceiveGoods({ onReceive }) {
  function receive() {
    onReceive && onReceive();
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2">Receive Goods</Typography>
      <Button variant="contained" onClick={receive}>Mark as Received</Button>
    </Box>
  );
}
