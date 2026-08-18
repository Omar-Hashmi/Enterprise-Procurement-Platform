import React from 'react';
import { Box, Typography } from '@mui/material';

export default function BudgetSummary({ total = 15000, spent = 5400 }) {
  const remaining = total - spent;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Total</Typography>
      <Typography variant="h6" fontWeight={700}>{total}</Typography>
      <Typography variant="body2">Spent: {spent} — Remaining: {remaining}</Typography>
    </Box>
  );
}
