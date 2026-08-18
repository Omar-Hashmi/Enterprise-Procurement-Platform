import React, { useState } from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ContractTable from './components/ContractTable';
import ContractStatusSummary from './components/ContractStatusSummary';
import AddIcon from '@mui/icons-material/Add';

export default function ContractList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  return (
    <Box sx={{ p: { xs:2, sm:3 }, maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">Dashboard</Link>
        <Typography color="text.primary">Contracts</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Contracts</Typography>
          <Typography variant="body2" color="text.secondary">Manage contracts and monitor expiration/compliance</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/contracts/new')}>Create Contract</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}><Card variant="outlined"><CardContent><ContractStatusSummary /></CardContent></Card></Grid>
        <Grid item xs={12} md={8}></Grid>
      </Grid>

      <ContractTable
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
}
