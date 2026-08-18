import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export default function BudgetProgress({ amount = 10000, spent = 3000 }) {
  const pct = Math.round((spent / amount) * 100);
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Utilization</Typography>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 10, borderRadius: 2 }} />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>{pct}% used</Typography>
    </Box>
  );
}
