import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import BudgetProgress from './components/BudgetProgress';
import RecordExpense from './components/RecordExpense';
import TopUpBudget from './components/TopUpBudget';
import ReserveFunds from './components/ReserveFunds';

export default function BudgetDetails() {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">
          Dashboard
        </Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/budgets">
          Budgets
        </Link>
        <Typography color="text.primary">Details</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Budget Details</Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <BudgetProgress />
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><RecordExpense /></Grid>
                <Grid item xs={12} sm={6}><TopUpBudget /></Grid>
                <Grid item xs={12}><ReserveFunds /></Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
