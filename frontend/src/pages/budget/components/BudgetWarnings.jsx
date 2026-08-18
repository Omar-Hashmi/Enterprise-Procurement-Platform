import React from 'react';
import { Alert } from '@mui/material';

export default function BudgetWarnings({ warnings = [] }) {
  const sample = warnings.length ? warnings : ['Marketing nearing limit', 'R&D overspent'];
  return (
    <div>
      {sample.map((w, i) => (
        <Alert severity="warning" key={i} sx={{ mb: 1 }}>{w}</Alert>
      ))}
    </div>
  );
}
