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
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VerifiedIcon from '@mui/icons-material/Verified';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Modal from '../../../components/common/Modal';

const MOCK_CERTIFICATIONS = [
  {
    id: 1,
    title: 'ISO 9001:2015 Quality Management',
    issuingAuthority: 'SGS International',
    certificateNumber: 'CERT-ISO-9001-8841',
    issueDate: '2023-01-15',
    expiryDate: '2026-01-14',
    status: 'ACTIVE', // ACTIVE, EXPIRING_SOON, EXPIRED
    documentName: 'ISO9001_Certificate_Apex.pdf',
  },
  {
    id: 2,
    title: 'ISO 27001 Information Security',
    issuingAuthority: 'Bureau Veritas',
    certificateNumber: 'CERT-ISO-27001-3312',
    issueDate: '2022-09-01',
    expiryDate: '2025-08-31',
    status: 'EXPIRING_SOON',
    documentName: 'ISO27001_Security_Audit.pdf',
  },
  {
    id: 3,
    title: 'National Tax Number (NTN) Certificate',
    issuingAuthority: 'Federal Board of Revenue (FBR)',
    certificateNumber: 'NTN-7492018-3',
    issueDate: '2020-05-10',
    expiryDate: '2028-05-09',
    status: 'ACTIVE',
    documentName: 'NTN_Registration_Doc.pdf',
  },
];

const INITIAL_FORM_STATE = {
  title: '',
  issuingAuthority: '',
  certificateNumber: '',
  issueDate: '',
  expiryDate: '',
  status: 'ACTIVE',
  documentName: '',
};

export const VendorCertifications = ({ vendorId }) => {
  const [certifications, setCertifications] = useState(MOCK_CERTIFICATIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);

  const handleOpenModal = (cert = null) => {
    if (cert) {
      setEditingId(cert.id);
      setFormData(cert);
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.certificateNumber) return;

    if (editingId) {
      setCertifications((prev) =>
        prev.map((c) => (c.id === editingId ? { ...formData, id: editingId } : c))
      );
    } else {
      const newCert = {
        ...formData,
        id: Date.now(),
        documentName: formData.documentName || 'Compliance_Doc.pdf',
      };
      setCertifications((prev) => [...prev, newCert]);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Chip label="Active" color="success" size="small" icon={<VerifiedIcon fontSize="small" />} />;
      case 'EXPIRING_SOON':
        return <Chip label="Expiring Soon" color="warning" size="small" icon={<WarningAmberIcon fontSize="small" />} />;
      case 'EXPIRED':
        return <Chip label="Expired" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const modalActions = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="outlined" color="inherit" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        {editingId ? 'Update Certification' : 'Add Certification'}
      </Button>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Certifications & Compliance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage ISO standards, regulatory licenses, tax documents, and safety audits
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Add Certification
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {certifications.map((cert) => (
          <Grid item xs={12} md={6} key={cert.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: cert.status === 'EXPIRING_SOON' ? 'warning.main' : 'divider',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: cert.status === 'ACTIVE' ? 'success.50' : 'warning.50',
                        color: cert.status === 'ACTIVE' ? 'success.main' : 'warning.main',
                        display: 'flex',
                      }}
                    >
                      <VerifiedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {cert.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Issued by {cert.issuingAuthority}
                      </Typography>
                    </Box>
                  </Box>
                  {getStatusChip(cert.status)}
                </Box>

                <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1.5, mb: 2 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Cert / License #
                      </Typography>
                      <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                        {cert.certificateNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Issued Date
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {cert.issueDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Expiration Date
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={cert.status === 'EXPIRING_SOON' ? 'warning.main' : 'text.primary'}
                      >
                        {cert.expiryDate}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon fontSize="small" color="action" />
                    <Typography variant="caption" fontWeight={500} color="text.secondary">
                      {cert.documentName}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Download Certificate">
                      <IconButton size="small" color="primary">
                        <FileDownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenModal(cert)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(cert.id)}>
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

      {/* Add / Edit Certification Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Certification' : 'Add Certification'}
        maxWidth="sm"
        actions={modalActions}
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            name="title"
            label="Certification Name / Title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />
          <TextField
            name="issuingAuthority"
            label="Issuing Authority / Board"
            value={formData.issuingAuthority}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />
          <TextField
            name="certificateNumber"
            label="Certificate / License Number"
            value={formData.certificateNumber}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type="date"
                name="issueDate"
                label="Issue Date"
                value={formData.issueDate}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="date"
                name="expiryDate"
                label="Expiry Date"
                value={formData.expiryDate}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <TextField
            select
            name="status"
            label="Compliance Status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            size="small"
          >
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="EXPIRING_SOON">EXPIRING_SOON</MenuItem>
            <MenuItem value="EXPIRED">EXPIRED</MenuItem>
          </TextField>
          <TextField
            name="documentName"
            label="Document File Name"
            value={formData.documentName}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="e.g., ISO_Certificate.pdf"
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default VendorCertifications;