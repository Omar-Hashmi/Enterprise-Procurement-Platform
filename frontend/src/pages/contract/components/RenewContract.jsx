import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

export default function RenewContract({ onRenew }) {
  const [date, setDate] = useState('');
  function renew() {
    onRenew && onRenew(date);
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2">Renew Contract</Typography>
      <TextField type="date" value={date} onChange={e => setDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
      <Button variant="contained" onClick={renew}>Renew</Button>
    </Box>
  );
}
