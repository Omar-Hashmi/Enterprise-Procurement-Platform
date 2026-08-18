import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function DeliveryForm({ initial = {} }) {
  const [ref, setRef] = useState(initial.ref || '');
  const [eta, setEta] = useState(initial.eta || '');

  function handleSubmit(e) {
    e.preventDefault();
    console.log('Create delivery', { ref, eta });
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Reference" value={ref} onChange={e => setRef(e.target.value)} size="small" />
      <TextField label="ETA" type="date" value={eta} onChange={e => setEta(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained">Save</Button>
      </Box>
    </Box>
  );
}
