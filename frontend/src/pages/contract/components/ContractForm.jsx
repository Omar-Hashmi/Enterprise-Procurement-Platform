import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function ContractForm({ isEdit = false, initial = {} }) {
  const [title, setTitle] = useState(initial.title || '');
  const [vendor, setVendor] = useState(initial.vendor || '');
  const [expires, setExpires] = useState(initial.expires || '');

  function handleSubmit(e) {
    e.preventDefault();
    console.log(isEdit ? 'Update contract' : 'Create contract', { title, vendor, expires });
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} size="small" />
      <TextField label="Vendor" value={vendor} onChange={e => setVendor(e.target.value)} size="small" />
      <TextField label="Expiry Date" type="date" value={expires} onChange={e => setExpires(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained">{isEdit ? 'Save' : 'Create'}</Button>
      </Box>
    </Box>
  );
}
