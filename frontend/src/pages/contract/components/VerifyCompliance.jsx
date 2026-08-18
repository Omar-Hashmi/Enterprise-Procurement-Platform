import React from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function VerifyCompliance({ onVerify }) {
  function verify() {
    onVerify && onVerify();
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2">Verify Compliance</Typography>
      <Button variant="contained" onClick={verify}>Verify</Button>
    </Box>
  );
}
