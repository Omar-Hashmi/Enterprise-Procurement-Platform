import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BudgetForm from './components/BudgetForm';

export default function EditBudget() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 800, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/budgets">Budgets</Link>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Edit Budget</Typography>
      <Card variant="outlined">
        <CardContent>
          <BudgetForm isEdit />
        </CardContent>
      </Card>
    </Box>
  );
}
