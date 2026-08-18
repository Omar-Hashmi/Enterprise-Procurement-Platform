import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Modal from '../../../components/common/Modal';

const MOCK_BANK_ACCOUNTS = [
  {
    id: 1,
    bankName: 'Habib Bank Limited (HBL)',
    accountTitle: 'Apex Global Logistics Pvt Ltd',
    accountNumber: '00427901234503',
    iban: 'PK36HABB0000427901234503',
    swiftCode: 'HABBPKKA',
    branchCode: '0427',
    currency: 'PKR',
    isPrimary: true,
  },
  {
    id: 2,
    bankName: 'Standard Chartered Bank',
    accountTitle: 'Apex Global Logistics Pvt Ltd',
    accountNumber: '01182394001',
    iban: 'PK12SCBL0000000118239401',
    swiftCode: 'SCBLPKKA',
    branchCode: '0118',
    currency: 'USD',
    isPrimary: false,
  },
];

const INITIAL_FORM_STATE = {
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  swiftCode: '',
  branchCode: '',
  currency: 'PKR',
  isPrimary: false,
};

export const VendorBankAccounts = ({ vendorId }) => {
  const [accounts, setAccounts] = useState(MOCK_BANK_ACCOUNTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`Copied ${label} to clipboard!`);
  };

  const handleOpenModal = (account = null) => {
    if (account) {
      setEditingId(account.id);
      setFormData(account);
    } else {
      setEditingId(null);
      setFormData(INITIAL_FORM_STATE);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.bankName || !formData.accountNumber) return;

    if (editingId) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === editingId) {
            return { ...formData, id: editingId };
          }
          if (formData.isPrimary) return { ...acc, isPrimary: false };
          return acc;
        })
      );
    } else {
      const newAcc = {
        ...formData,
        id: Date.now(),
      };
      setAccounts((prev) => {
        const updated = formData.isPrimary
          ? prev.map((a) => ({ ...a, isPrimary: false }))
          : [...prev];
        return [...updated, newAcc];
      });
    }

    handleCloseModal();
  };

  const handleSetPrimary = (id) => {
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isPrimary: acc.id === id,
      }))
    );
  };

  const handleDelete = (id) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const modalActions = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="outlined" color="inherit" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        {editingId ? 'Update Account' : 'Add Account'}
      </Button>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Bank Accounts & Disbursement Info
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage vendor bank details for electronic funds transfer (EFT) and wire payments
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Add Bank Account
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {accounts.map((account) => (
          <Grid item xs={12} md={6} key={account.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: account.isPrimary ? 'primary.main' : 'divider',
                boxShadow: account.isPrimary ? '0 0 0 1px #1976d2' : 'none',
                position: 'relative',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccountBalanceIcon color={account.isPrimary ? 'primary' : 'action'} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {account.bankName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Branch Code: {account.branchCode || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {account.isPrimary && (
                      <Chip label="Primary Account" color="primary" size="small" sx={{ fontWeight: 600 }} />
                    )}
                    <Chip label={account.currency} variant="outlined" size="small" />
                  </Box>
                </Box>

                <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1.5, mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Account Title
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    {account.accountTitle}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" display="block">
                    Account Number
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                      {account.accountNumber}
                    </Typography>
                    <Tooltip title="Copy Account Number">
                      <IconButton size="small" onClick={() => handleCopy(account.accountNumber, 'Account Number')}>
                        <ContentCopyIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block">
                    IBAN
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                      {account.iban || 'N/A'}
                    </Typography>
                    {account.iban && (
                      <Tooltip title="Copy IBAN">
                        <IconButton size="small" onClick={() => handleCopy(account.iban, 'IBAN')}>
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    SWIFT: <strong>{account.swiftCode || 'N/A'}</strong>
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {!account.isPrimary && (
                      <Tooltip title="Set as Primary">
                        <IconButton size="small" color="warning" onClick={() => handleSetPrimary(account.id)}>
                          <StarOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenModal(account)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(account.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add / Edit Bank Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Bank Account' : 'Add Bank Account'}
        maxWidth="sm"
        actions={modalActions}
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            name="bankName"
            label="Bank Name"
            value={formData.bankName}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />
          <TextField
            name="accountTitle"
            label="Account Title"
            value={formData.accountTitle}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                name="accountNumber"
                label="Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
                fullWidth
                required
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                select
                name="currency"
                label="Currency"
                value={formData.currency}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                <MenuItem value="PKR">PKR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <TextField
            name="iban"
            label="IBAN"
            value={formData.iban}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="swiftCode"
                label="SWIFT / BIC Code"
                value={formData.swiftCode}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="branchCode"
                label="Branch Code"
                value={formData.branchCode}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Copy Feedback Snackbar */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setToastMessage('')}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VendorBankAccounts;