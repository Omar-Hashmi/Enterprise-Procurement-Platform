import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

export default function TopUpBudget({ onTopUp }) {
  const [amount, setAmount] = useState('');
  function submit(e) {
    e.preventDefault();
    onTopUp && onTopUp(+amount);
    setAmount('');
  }
  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2">Top Up</Typography>
      <TextField type="number" value={amount} onChange={e => setAmount(e.target.value)} size="small" />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained">Top Up</Button>
      </Box>
    </Box>
  );
}
