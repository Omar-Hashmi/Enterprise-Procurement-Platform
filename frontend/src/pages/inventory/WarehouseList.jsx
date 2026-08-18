import React, { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent, Alert, Button, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import WarehouseTable from './components/WarehouseTable';
import apiClient from '../../lib/api';
import { demoWarehouses } from '../../data/demoData';

export default function WarehouseList() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadWarehouses = async () => {
    setLoading(true); setError('');
    try { const response = await apiClient.get('/inventory/warehouses'); const records = response.data?.data || []; setWarehouses(records.length ? records : demoWarehouses); }
    catch (requestError) { setWarehouses(demoWarehouses); setError(''); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadWarehouses(); }, []);
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/inventory">Inventory</Link>
        <Typography color="text.primary">Warehouses</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Warehouses</Typography>
      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadWarehouses}>Retry</Button>} sx={{ mb: 2 }}>{error}</Alert>}
      <Card variant="outlined"><CardContent>{loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress aria-label="Loading warehouses" /></Box> : <WarehouseTable warehouses={warehouses} />}</CardContent></Card>
    </Box>
  );
}
