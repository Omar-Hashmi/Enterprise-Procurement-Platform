import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function ComplianceDocuments({ docs = [] }) {
  const sample = docs.length ? docs : [{ id: 1, name: 'NDA.pdf' }];
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Compliance Documents</Typography>
      <List>
        {sample.map(d => (
          <ListItem key={d.id} disableGutters><ListItemText primary={d.name} /></ListItem>
        ))}
      </List>
    </Box>
  );
}
