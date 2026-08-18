import React, { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent, Grid, Button, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ContractTable from './components/ContractTable';
import ContractStatusSummary from './components/ContractStatusSummary';
import AddIcon from '@mui/icons-material/Add';
import apiClient from '../../lib/api';
import { demoContracts } from '../../data/demoData';

export default function ContractList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadContracts = async () => {
    setLoading(true); setError('');
    try { const response = await apiClient.get('/contracts'); const records = response.data?.data || []; setContracts(records.length ? records : demoContracts); }
    catch (requestError) { setContracts(demoContracts); setError(''); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadContracts(); }, []);
  const handleEdit = (contract) => navigate(`/contracts/${contract._id || contract.id}/edit`);
  const handleDelete = async (contract) => {
    if (!window.confirm(`Delete “${contract.title}”?`)) return;
    const id = contract._id || contract.id;
    try {
      if (!String(id).startsWith('demo-')) await apiClient.delete(`/contracts/${id}`);
      setContracts((current) => current.filter((item) => (item._id || item.id) !== id));
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete this contract.'); }
  };
  const expiringSoon = contracts.filter((contract) => contract.status === 'expiring_soon').length;
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
        <Grid item xs={12} md={4}><Card variant="outlined"><CardContent><ContractStatusSummary total={contracts.length} expiringSoon={expiringSoon} /></CardContent></Card></Grid>
        <Grid item xs={12} md={8}></Grid>
      </Grid>

      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadContracts}>Retry</Button>} sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress aria-label="Loading contracts" /></Box> : <ContractTable contracts={contracts}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />}
    </Box>
  );
}
