import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function BudgetForm({ isEdit = false, initial = {} }) {
  const [name, setName] = useState(initial.name || '');
  const [amount, setAmount] = useState(initial.amount || '');

  function handleSubmit(e) {
    e.preventDefault();
    console.log(isEdit ? 'Update budget' : 'Create budget', { name, amount });
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth size="small" />
      <TextField label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} fullWidth size="small" />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="contained" type="submit">{isEdit ? 'Save' : 'Create'}</Button>
      </Box>
    </Box>
  );
}
