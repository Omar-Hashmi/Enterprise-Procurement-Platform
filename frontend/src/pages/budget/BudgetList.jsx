import React, { useState } from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent, Grid, Button, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import BudgetTable from './components/BudgetTable';
import BudgetSummary from './components/BudgetSummary';
import BudgetWarnings from './components/BudgetWarnings';
import AddIcon from '@mui/icons-material/Add';
import { useBudget } from '../../hooks/useBudget';

export default function BudgetList() {
  const navigate = useNavigate();
  const { budgets, isLoading, error, fetchBudgets } = useBudget();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const total = budgets.reduce((sum, budget) => sum + Number(budget.allocatedAmount || 0), 0);
  const spent = budgets.reduce((sum, budget) => sum + Number(budget.spentAmount || 0), 0);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Budgets</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Budgets</Typography>
          <Typography variant="body2" color="text.secondary">Overview and management of organizational budgets</Typography>
        </Box>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/budgets/new')}>Create Budget</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <BudgetSummary total={total} spent={spent} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <BudgetWarnings />
        </Grid>
      </Grid>

      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchBudgets}>Retry</Button>} sx={{ mb: 2 }}>{error}</Alert>}
      {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress aria-label="Loading budgets" /></Box> : <BudgetTable budgets={budgets} page={page} rowsPerPage={rowsPerPage} onPageChange={(event, nextPage) => setPage(nextPage)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} onEdit={(budget) => navigate(`/budgets/${budget._id || budget.id}/edit`)} />}
    </Box>
  );
}
