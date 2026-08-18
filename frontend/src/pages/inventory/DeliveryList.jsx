import React, { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent, Alert, Button, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeliveryTable from './components/DeliveryTable';
import apiClient from '../../lib/api';
import { demoDeliveries } from '../../data/demoData';

export default function DeliveryList() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadDeliveries = async () => {
    setLoading(true); setError('');
    try { const response = await apiClient.get('/inventory'); const records = response.data?.data || []; setDeliveries(records.length ? records : demoDeliveries); }
    catch (requestError) { setDeliveries(demoDeliveries); setError(''); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadDeliveries(); }, []);
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/inventory">Inventory</Link>
        <Typography color="text.primary">Deliveries</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Deliveries</Typography>
      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadDeliveries}>Retry</Button>} sx={{ mb: 2 }}>{error}</Alert>}
      <Card variant="outlined"><CardContent>{loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress aria-label="Loading deliveries" /></Box> : <DeliveryTable deliveries={deliveries} />}</CardContent></Card>
    </Box>
  );
}
