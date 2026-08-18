import React from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function TerminateContract({ onTerminate }) {
  function terminate() {
    onTerminate && onTerminate();
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2">Terminate Contract</Typography>
      <Button variant="contained" color="error" onClick={terminate}>Terminate</Button>
    </Box>
  );
}
