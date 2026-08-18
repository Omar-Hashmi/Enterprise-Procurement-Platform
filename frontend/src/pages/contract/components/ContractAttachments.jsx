import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function ContractAttachments({ attachments = [] }) {
  const sample = attachments.length ? attachments : [{ id: 1, name: 'contract.pdf' }];
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Attachments</Typography>
      <List>
        {sample.map(a => (
          <ListItem key={a.id} disableGutters><ListItemText primary={a.name} /></ListItem>
        ))}
      </List>
    </Box>
  );
}
