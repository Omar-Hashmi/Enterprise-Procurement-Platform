import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

export default function RecordExpense({ onRecord }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  function submit(e) {
    e.preventDefault();
    onRecord && onRecord({ desc, amount: +amount });
    setDesc('');
    setAmount('');
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2">Record Expense</Typography>
      <TextField placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} size="small" />
      <TextField placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} size="small" />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained">Record</Button>
      </Box>
    </Box>
  );
}
