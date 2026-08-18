import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function WarehouseForm({ isEdit = false, initial = {} }) {
  const [name, setName] = useState(initial.name || '');
  const [location, setLocation] = useState(initial.location || '');

  function handleSubmit(e) {
    e.preventDefault();
    console.log(isEdit ? 'Update warehouse' : 'Create warehouse', { name, location });
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Name" value={name} onChange={e => setName(e.target.value)} size="small" />
      <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} size="small" />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained">{isEdit ? 'Save' : 'Create'}</Button>
      </Box>
    </Box>
  );
}
