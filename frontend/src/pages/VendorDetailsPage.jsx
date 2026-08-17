import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Rating,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BusinessIcon from '@mui/icons-material/Business';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HighQualityOutlinedIcon from '@mui/icons-material/HighQualityOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/feedback/LoadingState';
import ErrorState from '../components/feedback/ErrorState';
import EmptyState from '../components/feedback/EmptyState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { getStatusColor, USER_ROLES } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/formatters';

// State machine transitions matching backend VendorService
const VALID_STATUS_TRANSITIONS = {
  pending: [
    { value: 'active', label: 'Approve & Activate (active)' },
    { value: 'blacklisted', label: 'Blacklist Vendor (blacklisted)' },
  ],
  active: [
    { value: 'suspended', label: 'Suspend Vendor (suspended)' },
    { value: 'blacklisted', label: 'Blacklist Vendor (blacklisted)' },
  ],
  suspended: [
    { value: 'active', label: 'Re-activate Vendor (active)' },
    { value: 'blacklisted', label: 'Blacklist Vendor (blacklisted)' },
  ],
  blacklisted: [], // Terminal
};

// Safe helper to mask sensitive banking numbers
const maskAccountNumber = (accNumber) => {
  if (!accNumber || typeof accNumber !== 'string') return '****';
  const clean = accNumber.trim();
  if (clean.length <= 4) return clean;
  return '•'.repeat(clean.length - 4) + clean.slice(-4);
};

export const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const userRole = user?.role?.toLowerCase() || '';
  const canManageVendors = [USER_ROLES.PROCUREMENT_OFFICER, USER_ROLES.ADMIN].includes(userRole);
  const canRateVendor = [
    USER_ROLES.PROCUREMENT_OFFICER,
    USER_ROLES.DEPARTMENT_MANAGER,
    USER_ROLES.ADMIN,
  ].includes(userRole);

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState('success');

  // --- Dialog 1 State: Status Transition ---
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [statusError, setStatusError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // --- Dialog 2 State: Edit Vendor ---
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editServerError, setEditServerError] = useState('');
  const [isUpdatingVendor, setIsUpdatingVendor] = useState(false);

  // --- Dialog 3 State: Vendor Rating / Evaluation ---
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    deliveryScore: 5,
    qualityScore: 5,
    costEfficiencyScore: 5,
    complianceScore: 5,
    comments: '',
  });
  const [ratingError, setRatingError] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // --- Dialog 4 State: Add Certification ---
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    issuingAuthority: '',
    certificateNumber: '',
    issueDate: '',
    expiryDate: '',
    documentUrl: '',
  });
  const [certErrors, setCertErrors] = useState({});
  const [certServerError, setCertServerError] = useState('');
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);

  // --- Dialog 5 State: Add Bank Account ---
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    branchCode: '',
    isPrimary: false,
  });
  const [bankErrors, setBankErrors] = useState({});
  const [bankServerError, setBankServerError] = useState('');
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);

  // Query 1: Vendor 360° Profile Details
  const {
    data: vendor,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const response = await apiClient.get(`/vendors/${id}`);
      return response.data?.data;
    },
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Query 2: Active Vendor Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['vendorCategories'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/vendors/categories');
        return response.data?.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = () => {
    refetch();
  };

  // -------------------------------------------------------------
  // STATUS MANAGEMENT
  // -------------------------------------------------------------
  const handleOpenStatusDialog = () => {
    if (!vendor) return;
    const allowedTransitions = VALID_STATUS_TRANSITIONS[vendor.status] || [];
    setSelectedNextStatus(allowedTransitions[0]?.value || '');
    setStatusReason('');
    setStatusError('');
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    if (isUpdatingStatus) return;
    setStatusDialogOpen(false);
  };

  const handleSubmitStatusChange = async (e) => {
    e.preventDefault();
    if (!selectedNextStatus) {
      setStatusError('Please select a target status.');
      return;
    }
    if (selectedNextStatus === 'blacklisted' && (!statusReason || statusReason.trim().length < 5)) {
      setStatusError('A reason of at least 5 characters is required when blacklisting a vendor.');
      return;
    }

    setStatusError('');
    setIsUpdatingStatus(true);

    try {
      await apiClient.patch(`/vendors/${id}/status`, {
        status: selectedNextStatus,
        reason: statusReason.trim() || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      await queryClient.refetchQueries({ queryKey: ['vendor', id] });
      await queryClient.invalidateQueries({ queryKey: ['vendors'] });
      await queryClient.invalidateQueries({ queryKey: ['vendorStatusSummary'] });

      setFeedbackMessage(`Vendor status successfully updated to "${selectedNextStatus.toUpperCase()}".`);
      setFeedbackSeverity('success');
      setStatusDialogOpen(false);
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to transition vendor status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // -------------------------------------------------------------
  // EDIT VENDOR PROFILE
  // -------------------------------------------------------------
  const handleOpenEditDialog = () => {
    if (!vendor) return;
    const currentCategoryIds = Array.isArray(vendor.categories)
      ? vendor.categories.map((c) => (typeof c === 'object' ? c._id : c))
      : [];

    setEditFormData({
      companyName: vendor.companyName || '',
      registrationNumber: vendor.companyInfo?.registrationNumber || '',
      industry: vendor.companyInfo?.industry || '',
      website: vendor.companyInfo?.website || '',
      categories: currentCategoryIds,
      contactName: vendor.companyInfo?.contactPerson?.name || '',
      contactEmail: vendor.companyInfo?.contactPerson?.email || '',
      contactPhone: vendor.companyInfo?.contactPerson?.phone || '',
      contactDesignation: vendor.companyInfo?.contactPerson?.designation || '',
      street: vendor.companyInfo?.address?.street || '',
      city: vendor.companyInfo?.address?.city || '',
      state: vendor.companyInfo?.address?.state || '',
      country: vendor.companyInfo?.address?.country || '',
      postalCode: vendor.companyInfo?.address?.postalCode || '',
      taxId: vendor.taxInfo?.taxId || '',
      vatNumber: vendor.taxInfo?.vatNumber || '',
      taxDocumentUrl: vendor.taxInfo?.taxDocumentUrl || '',
    });
    setEditErrors({});
    setEditServerError('');
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (isUpdatingVendor) return;
    setEditDialogOpen(false);
  };

  const handleEditFieldChange = (field) => (e) => {
    const value = e.target.value;
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setEditFormData((prev) => ({
      ...prev,
      categories: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSaveVendorChanges = async (e) => {
    e.preventDefault();
    if (!editFormData) return;

    const errs = {};
    if (!editFormData.companyName.trim()) errs.companyName = 'Company name is required';
    if (!editFormData.registrationNumber.trim()) errs.registrationNumber = 'Registration number is required';
    if (!editFormData.contactName.trim()) errs.contactName = 'Contact name is required';
    if (!editFormData.contactEmail.trim()) errs.contactEmail = 'Contact email is required';
    if (!editFormData.contactPhone.trim()) errs.contactPhone = 'Contact phone is required';
    if (!editFormData.street.trim()) errs.street = 'Street is required';
    if (!editFormData.city.trim()) errs.city = 'City is required';
    if (!editFormData.country.trim()) errs.country = 'Country is required';
    if (!editFormData.taxId.trim()) errs.taxId = 'Tax ID is required';

    if (editFormData.website.trim() && !/^https?:\/\/.+/i.test(editFormData.website.trim())) {
      errs.website = 'Must be a valid URL (https://...)';
    }
    if (editFormData.taxDocumentUrl.trim() && !/^https?:\/\/.+/i.test(editFormData.taxDocumentUrl.trim())) {
      errs.taxDocumentUrl = 'Must be a valid URL (https://...)';
    }

    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setEditServerError('');
    setIsUpdatingVendor(true);

    try {
      const payload = {
        companyName: editFormData.companyName.trim(),
        companyInfo: {
          registrationNumber: editFormData.registrationNumber.trim(),
          website: editFormData.website.trim() || undefined,
          industry: editFormData.industry.trim() || undefined,
          address: {
            street: editFormData.street.trim(),
            city: editFormData.city.trim(),
            state: editFormData.state.trim() || undefined,
            country: editFormData.country.trim(),
            postalCode: editFormData.postalCode.trim() || undefined,
          },
          contactPerson: {
            name: editFormData.contactName.trim(),
            email: editFormData.contactEmail.trim(),
            phone: editFormData.contactPhone.trim(),
            designation: editFormData.contactDesignation.trim() || undefined,
          },
        },
        taxInfo: {
          taxId: editFormData.taxId.trim(),
          vatNumber: editFormData.vatNumber.trim() || undefined,
          taxDocumentUrl: editFormData.taxDocumentUrl.trim() || undefined,
        },
        categories: editFormData.categories,
      };

      await apiClient.patch(`/vendors/${id}`, payload);

      await queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      await queryClient.refetchQueries({ queryKey: ['vendor', id] });
      await queryClient.invalidateQueries({ queryKey: ['vendors'] });

      setFeedbackMessage('Vendor profile information updated successfully.');
      setFeedbackSeverity('success');
      setEditDialogOpen(false);
    } catch (err) {
      setEditServerError(err.response?.data?.message || 'Failed to update vendor profile.');
    } finally {
      setIsUpdatingVendor(false);
    }
  };

  // -------------------------------------------------------------
  // VENDOR PERFORMANCE RATINGS
  // -------------------------------------------------------------
  const handleOpenRatingDialog = () => {
    setRatingForm({
      deliveryScore: 5,
      qualityScore: 5,
      costEfficiencyScore: 5,
      complianceScore: 5,
      comments: '',
    });
    setRatingError('');
    setRatingDialogOpen(true);
  };

  const handleCloseRatingDialog = () => {
    if (isSubmittingRating) return;
    setRatingDialogOpen(false);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setRatingError('');
    setIsSubmittingRating(true);

    try {
      const payload = {
        deliveryScore: Number(ratingForm.deliveryScore),
        qualityScore: Number(ratingForm.qualityScore),
        costEfficiencyScore: Number(ratingForm.costEfficiencyScore),
        complianceScore: Number(ratingForm.complianceScore),
        comments: ratingForm.comments?.trim() || undefined,
      };

      await apiClient.post(`/vendors/${id}/ratings`, payload);

      await queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      await queryClient.refetchQueries({ queryKey: ['vendor', id] });
      await queryClient.invalidateQueries({ queryKey: ['vendors'] });

      setFeedbackMessage('Vendor performance evaluation submitted successfully.');
      setFeedbackSeverity('success');
      setRatingDialogOpen(false);
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit vendor rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // -------------------------------------------------------------
  // VENDOR CERTIFICATIONS
  // -------------------------------------------------------------
  const handleOpenCertDialog = () => {
    setCertForm({
      name: '',
      issuingAuthority: '',
      certificateNumber: '',
      issueDate: '',
      expiryDate: '',
      documentUrl: '',
    });
    setCertErrors({});
    setCertServerError('');
    setCertDialogOpen(true);
  };

  const handleCloseCertDialog = () => {
    if (isSubmittingCert) return;
    setCertDialogOpen(false);
  };

  const handleCertFieldChange = (field) => (e) => {
    const value = e.target.value;
    setCertForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitCert = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!certForm.name.trim()) errs.name = 'Certificate name is required';
    if (!certForm.issuingAuthority.trim()) errs.issuingAuthority = 'Issuing authority is required';
    if (!certForm.certificateNumber.trim()) errs.certificateNumber = 'Certificate number is required';
    if (!certForm.issueDate) errs.issueDate = 'Issue date is required';
    if (!certForm.documentUrl.trim()) {
      errs.documentUrl = 'Document link URL is required';
    } else if (!/^https?:\/\/.+/i.test(certForm.documentUrl.trim())) {
      errs.documentUrl = 'Must be a valid URL (https://...)';
    }

    if (certForm.issueDate && certForm.expiryDate) {
      if (new Date(certForm.expiryDate) <= new Date(certForm.issueDate)) {
        errs.expiryDate = 'Expiry date must be after issue date';
      }
    }

    setCertErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCertServerError('');
    setIsSubmittingCert(true);

    try {
      const payload = {
        name: certForm.name.trim(),
        issuingAuthority: certForm.issuingAuthority.trim(),
        certificateNumber: certForm.certificateNumber.trim(),
        issueDate: new Date(certForm.issueDate).toISOString(),
        expiryDate: certForm.expiryDate ? new Date(certForm.expiryDate).toISOString() : undefined,
        documentUrl: certForm.documentUrl.trim(),
      };

      await apiClient.post(`/vendors/${id}/certifications`, payload);

      await queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      await queryClient.refetchQueries({ queryKey: ['vendor', id] });

      setFeedbackMessage('Certification credential added successfully.');
      setFeedbackSeverity('success');
      setCertDialogOpen(false);
    } catch (err) {
      setCertServerError(err.response?.data?.message || 'Failed to add certification.');
    } finally {
      setIsSubmittingCert(false);
    }
  };

  // -------------------------------------------------------------
  // BANK ACCOUNTS
  // -------------------------------------------------------------
  const handleOpenBankDialog = () => {
    setBankForm({
      bankName: '',
      accountTitle: '',
      accountNumber: '',
      iban: '',
      swiftCode: '',
      branchCode: '',
      isPrimary: false,
    });
    setBankErrors({});
    setBankServerError('');
    setBankDialogOpen(true);
  };

  const handleCloseBankDialog = () => {
    if (isSubmittingBank) return;
    setBankDialogOpen(false);
  };

  const handleBankFieldChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setBankForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitBank = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!bankForm.bankName.trim()) errs.bankName = 'Bank name is required';
    if (!bankForm.accountTitle.trim()) errs.accountTitle = 'Account title is required';
    if (!bankForm.accountNumber.trim()) errs.accountNumber = 'Account number is required';

    setBankErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBankServerError('');
    setIsSubmittingBank(true);

    try {
      const payload = {
        bankName: bankForm.bankName.trim(),
        accountTitle: bankForm.accountTitle.trim(),
        accountNumber: bankForm.accountNumber.trim(),
        iban: bankForm.iban.trim() || undefined,
        swiftCode: bankForm.swiftCode.trim() || undefined,
        branchCode: bankForm.branchCode.trim() || undefined,
        isPrimary: Boolean(bankForm.isPrimary),
      };

      await apiClient.post(`/vendors/${id}/bank-accounts`, payload);

      await queryClient.invalidateQueries({ queryKey: ['vendor', id] });
      await queryClient.refetchQueries({ queryKey: ['vendor', id] });

      setFeedbackMessage('Bank settlement account added successfully.');
      setFeedbackSeverity('success');
      setBankDialogOpen(false);
    } catch (err) {
      setBankServerError(err.response?.data?.message || 'Failed to add bank account.');
    } finally {
      setIsSubmittingBank(false);
    }
  };

  if (isLoading && !vendor) {
    return <LoadingState message="Loading vendor 360° profile..." minHeight={400} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load vendor profile"
        description={error?.response?.data?.message || 'Unable to retrieve vendor details.'}
        onRetry={handleRefresh}
      />
    );
  }

  if (!vendor) {
    return <EmptyState title="Vendor Not Found" description="The requested supplier profile does not exist." />;
  }

  const allowedNextTransitions = VALID_STATUS_TRANSITIONS[vendor.status] || [];
  const isTerminal = allowedNextTransitions.length === 0;
  const isBlacklisted = vendor.status === 'blacklisted' || vendor.isBlacklisted;

  const contact = vendor.companyInfo?.contactPerson;
  const address = vendor.companyInfo?.address;
  const categoryObjects = Array.isArray(vendor.categories) ? vendor.categories : [];
  const ratings = Array.isArray(vendor.ratings) ? vendor.ratings : [];
  const certifications = Array.isArray(vendor.certifications) ? vendor.certifications : [];
  const bankAccounts = Array.isArray(vendor.bankAccounts) ? vendor.bankAccounts : [];

  // Compute average sub-scores across ratings
  const deliveryAvg = ratings.length > 0 ? ratings.reduce((acc, r) => acc + (r.deliveryScore || 0), 0) / ratings.length : 0;
  const qualityAvg = ratings.length > 0 ? ratings.reduce((acc, r) => acc + (r.qualityScore || 0), 0) / ratings.length : 0;
  const costAvg = ratings.length > 0 ? ratings.reduce((acc, r) => acc + (r.costEfficiencyScore || 0), 0) / ratings.length : 0;
  const complianceAvg = ratings.length > 0 ? ratings.reduce((acc, r) => acc + (r.complianceScore || 0), 0) / ratings.length : 0;

  return (
    <Box>
      {/* Top Breadcrumb & Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/vendors')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to Vendor Directory
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Tooltip title="Refresh Details">
            <IconButton
              onClick={handleRefresh}
              disabled={isFetching}
              color="primary"
              sx={{ border: '1px solid #e2e8f0' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {canRateVendor && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RateReviewOutlinedIcon />}
              onClick={handleOpenRatingDialog}
              sx={{ fontWeight: 600, borderRadius: 1.5 }}
            >
              Rate Supplier
            </Button>
          )}

          {canManageVendors && (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditOutlinedIcon />}
                onClick={handleOpenEditDialog}
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              >
                Edit Profile
              </Button>

              {!isTerminal && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SwapHorizIcon />}
                  onClick={handleOpenStatusDialog}
                  sx={{ fontWeight: 600, borderRadius: 1.5 }}
                >
                  Change Status
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <Alert severity={feedbackSeverity} onClose={() => setFeedbackMessage('')} sx={{ mb: 3 }}>
          {feedbackMessage}
        </Alert>
      )}

      {/* Blacklisted Supplier Warning Banner */}
      {isBlacklisted && (
        <Alert severity="error" icon={<WarningAmberOutlinedIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Restricted Supplier — Vendor Blacklisted
          </Typography>
          <Typography variant="body2">
            Reason: {vendor.blacklistReason || 'Supplier has been blacklisted from procurement engagements.'}
          </Typography>
        </Alert>
      )}

      {/* Hero 360° Profile Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: '#e0f2fe',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                }}
              >
                {vendor.companyName?.charAt(0)?.toUpperCase() || 'V'}
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                  <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {vendor.companyName}
                  </Typography>
                  <Chip
                    label={vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : 'Pending'}
                    color={getStatusColor(vendor.status)}
                    sx={{ fontWeight: 700, fontSize: '0.8125rem', textTransform: 'capitalize' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Vendor Code: <strong>{vendor.vendorCode || 'N/A'}</strong> • Reg No:{' '}
                  <strong>{vendor.companyInfo?.registrationNumber || 'N/A'}</strong>
                </Typography>
              </Box>
            </Box>

            {/* Performance Rating Score Box */}
            <Box
              sx={{
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                p: 2,
                textAlign: { xs: 'left', md: 'right' },
                minWidth: 200,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Supplier Rating Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: 0.5 }}>
                <Rating value={vendor.averageRating || 0} precision={0.5} size="small" readOnly />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {vendor.averageRating > 0 ? vendor.averageRating.toFixed(2) : '0.00'}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {ratings.length} performance evaluation{ratings.length === 1 ? '' : 's'} recorded
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main 360° Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Company Details, Certifications, Bank Accounts */}
        <Grid item xs={12} md={8}>
          {/* Section 1: Company Profile */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" fontSize="small" />
                Company Overview & Industry
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Industry Sector
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, color: 'text.primary' }}>
                      {vendor.companyInfo?.industry || 'Not Specified'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Corporate Website
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {vendor.companyInfo?.website ? (
                        <Button
                          href={vendor.companyInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          sx={{ p: 0, textTransform: 'none', fontWeight: 600 }}
                        >
                          {vendor.companyInfo.website}
                        </Button>
                      ) : (
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Approved Vendor Categories
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {categoryObjects.length > 0 ? (
                        categoryObjects.map((cat, i) => (
                          <Chip
                            key={i}
                            label={typeof cat === 'object' ? cat.name : cat}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No category classifications assigned.
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Section 2: Physical Address & Tax */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnOutlinedIcon color="primary" fontSize="small" />
                Location & Tax Credentials
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Headquarters Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {address?.street || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[address?.city, address?.state, address?.country, address?.postalCode].filter(Boolean).join(', ')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Tax Identification (TIN / Tax ID)
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {vendor.taxInfo?.taxId || 'N/A'}
                  </Typography>
                  {vendor.taxInfo?.vatNumber && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      VAT: {vendor.taxInfo.vatNumber}
                    </Typography>
                  )}
                  {vendor.taxInfo?.taxDocumentUrl && (
                    <Button
                      href={vendor.taxInfo.taxDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      startIcon={<ReceiptLongOutlinedIcon fontSize="small" />}
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      sx={{ p: 0, mt: 1, textTransform: 'none' }}
                    >
                      Tax Certificate Link
                    </Button>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Section 3: Vendor Certifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUserOutlinedIcon color="primary" fontSize="small" />
                  Compliance & Certifications ({certifications.length})
                </Typography>
                {canManageVendors && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCertDialog}
                    sx={{ fontWeight: 600 }}
                  >
                    Add Certification
                  </Button>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />

              {certifications.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No verified certifications or compliance documents registered for this supplier.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {certifications.map((cert) => {
                    const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
                    return (
                      <Grid item xs={12} sm={6} key={cert._id || cert.certificateNumber}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {cert.name}
                            </Typography>
                            {isExpired ? (
                              <Chip label="Expired" size="small" color="error" sx={{ height: 20, fontSize: '0.6875rem' }} />
                            ) : cert.verified ? (
                              <Chip label="Verified" size="small" color="success" sx={{ height: 20, fontSize: '0.6875rem' }} />
                            ) : (
                              <Chip label="Submitted" size="small" color="default" sx={{ height: 20, fontSize: '0.6875rem' }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Issuer: <strong>{cert.issuingAuthority}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Cert #: <strong>{cert.certificateNumber}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Valid: {formatDate(cert.issueDate)} {cert.expiryDate ? `— ${formatDate(cert.expiryDate)}` : '(No expiry)'}
                          </Typography>
                          {cert.documentUrl && (
                            <Button
                              href={cert.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              endIcon={<OpenInNewIcon fontSize="small" />}
                              sx={{ mt: 1, p: 0, textTransform: 'none', fontSize: '0.75rem' }}
                            >
                              View Certificate Document
                            </Button>
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Bank Accounts */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceOutlinedIcon color="primary" fontSize="small" />
                  Banking & Settlement Details ({bankAccounts.length})
                </Typography>
                {canManageVendors && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenBankDialog}
                    sx={{ fontWeight: 600 }}
                  >
                    Add Bank Account
                  </Button>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />

              {bankAccounts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No banking details registered. Add settlement credentials to facilitate automated purchase orders.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {bankAccounts.map((bank) => (
                    <Grid item xs={12} sm={6} key={bank._id || bank.accountNumber}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          height: '100%',
                          border: bank.isPrimary ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {bank.bankName}
                          </Typography>
                          {bank.isPrimary && (
                            <Chip label="Primary" size="small" color="primary" sx={{ height: 20, fontSize: '0.6875rem' }} />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Account Title: <strong>{bank.accountTitle}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                          Account Number: <strong style={{ fontFamily: 'monospace' }}>{maskAccountNumber(bank.accountNumber)}</strong>
                        </Typography>
                        {bank.iban && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                            IBAN: <strong style={{ fontFamily: 'monospace' }}>{bank.iban}</strong>
                          </Typography>
                        )}
                        {bank.swiftCode && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                            SWIFT / BIC: <strong>{bank.swiftCode}</strong>
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Contact, Performance Ratings Breakdown, Audit */}
        <Grid item xs={12} md={4}>
          {/* Primary Contact Person Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutlineIcon color="primary" fontSize="small" />
                Primary Liaison Contact
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: '#e0f2fe',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                  }}
                >
                  {contact?.name?.charAt(0)?.toUpperCase() || 'C'}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {contact?.name || 'Unassigned Contact'}
                  </Typography>
                  {contact?.designation && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {contact.designation}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Email Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {contact?.email || 'N/A'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Phone Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {contact?.phone || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Performance Evaluation Scorecard */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarOutlineIcon color="primary" fontSize="small" />
                Performance Scorecard
              </Typography>
              <Divider sx={{ my: 2 }} />

              {ratings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No evaluations submitted yet.
                  </Typography>
                  {canRateVendor && (
                    <Button size="small" variant="outlined" startIcon={<RateReviewOutlinedIcon />} onClick={handleOpenRatingDialog}>
                      Evaluate Supplier
                    </Button>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Delivery Score */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocalShippingOutlinedIcon sx={{ fontSize: 15 }} /> Delivery Reliability
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {deliveryAvg.toFixed(1)} / 5.0
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(deliveryAvg / 5) * 100} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>

                  {/* Quality Score */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HighQualityOutlinedIcon sx={{ fontSize: 15 }} /> Product Quality
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {qualityAvg.toFixed(1)} / 5.0
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(qualityAvg / 5) * 100} color="success" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>

                  {/* Cost Efficiency */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MonetizationOnOutlinedIcon sx={{ fontSize: 15 }} /> Cost Efficiency
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {costAvg.toFixed(1)} / 5.0
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(costAvg / 5) * 100} color="warning" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>

                  {/* Compliance Score */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GavelOutlinedIcon sx={{ fontSize: 15 }} /> Contract & SLA Compliance
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {complianceAvg.toFixed(1)} / 5.0
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(complianceAvg / 5) * 100} color="info" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>

                  {/* Recent Evaluator Comments */}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Recent Evaluator Comments
                  </Typography>
                  {ratings.slice(-3).reverse().map((r, idx) => (
                    <Paper key={idx} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Rating value={(r.deliveryScore + r.qualityScore + r.costEfficiencyScore + r.complianceScore) / 4} size="small" precision={0.5} readOnly />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(r.ratedAt)}
                        </Typography>
                      </Box>
                      {r.comments && (
                        <Typography variant="caption" color="text.primary" sx={{ fontStyle: 'italic', display: 'block' }}>
                          "{r.comments}"
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Registration Audit Trail
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Initial Onboarding Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDateTime(vendor.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Profile Update
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDateTime(vendor.updatedAt)}
                  </Typography>
                </Box>

                {vendor.createdBy && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Registered By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {typeof vendor.createdBy === 'object' ? vendor.createdBy.fullName : 'System User'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ============================================================= */}
      {/* DIALOG 1: STATUS TRANSITION                                   */}
      {/* ============================================================= */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Supplier Status</DialogTitle>
        <Box component="form" onSubmit={handleSubmitStatusChange} noValidate>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Current Status: <strong>{vendor.status?.toUpperCase()}</strong>. Select the next valid lifecycle status:
            </Typography>

            {statusError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {statusError}
              </Alert>
            )}

            <TextField
              select
              label="Target Status"
              fullWidth
              value={selectedNextStatus}
              onChange={(e) => setSelectedNextStatus(e.target.value)}
              disabled={isUpdatingStatus}
              sx={{ mb: 2.5 }}
            >
              {allowedNextTransitions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            {selectedNextStatus === 'blacklisted' && (
              <TextField
                label="Blacklist Justification / Reason"
                placeholder="State the compliance, legal, or commercial reasons for blacklisting (min 5 characters)..."
                fullWidth
                multiline
                rows={3}
                required
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                disabled={isUpdatingStatus}
                helperText="Mandatory under enterprise vendor management policy"
              />
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseStatusDialog} disabled={isUpdatingStatus} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color={selectedNextStatus === 'blacklisted' ? 'error' : 'primary'}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? <CircularProgress size={20} color="inherit" /> : 'Confirm Status Change'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ============================================================= */}
      {/* DIALOG 2: EDIT VENDOR PROFILE                                 */}
      {/* ============================================================= */}
      {editFormData && (
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Vendor Profile Information</DialogTitle>
          <Box component="form" onSubmit={handleSaveVendorChanges} noValidate>
            <DialogContent sx={{ pt: 1 }}>
              {editServerError && (
                <Alert severity="error" sx={{ mb: 2.5 }}>
                  {editServerError}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Company Legal Name"
                    fullWidth
                    required
                    value={editFormData.companyName}
                    onChange={handleEditFieldChange('companyName')}
                    error={Boolean(editErrors.companyName)}
                    helperText={editErrors.companyName}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Registration Number"
                    fullWidth
                    required
                    value={editFormData.registrationNumber}
                    onChange={handleEditFieldChange('registrationNumber')}
                    error={Boolean(editErrors.registrationNumber)}
                    helperText={editErrors.registrationNumber}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Industry Sector"
                    fullWidth
                    value={editFormData.industry}
                    onChange={handleEditFieldChange('industry')}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Website URL"
                    fullWidth
                    value={editFormData.website}
                    onChange={handleEditFieldChange('website')}
                    error={Boolean(editErrors.website)}
                    helperText={editErrors.website}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="edit-vendor-categories-label">Vendor Categories</InputLabel>
                    <Select
                      labelId="edit-vendor-categories-label"
                      multiple
                      value={editFormData.categories}
                      onChange={handleEditCategoryChange}
                      input={<OutlinedInput label="Vendor Categories" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const cat = categories.find((c) => c._id === value);
                            return <Chip key={value} label={cat ? cat.name : value} size="small" />;
                          })}
                        </Box>
                      )}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Contact Full Name"
                    fullWidth
                    required
                    value={editFormData.contactName}
                    onChange={handleEditFieldChange('contactName')}
                    error={Boolean(editErrors.contactName)}
                    helperText={editErrors.contactName}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Job Title / Designation"
                    fullWidth
                    value={editFormData.contactDesignation}
                    onChange={handleEditFieldChange('contactDesignation')}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    required
                    value={editFormData.contactEmail}
                    onChange={handleEditFieldChange('contactEmail')}
                    error={Boolean(editErrors.contactEmail)}
                    helperText={editErrors.contactEmail}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    required
                    value={editFormData.contactPhone}
                    onChange={handleEditFieldChange('contactPhone')}
                    error={Boolean(editErrors.contactPhone)}
                    helperText={editErrors.contactPhone}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Street Address"
                    fullWidth
                    required
                    value={editFormData.street}
                    onChange={handleEditFieldChange('street')}
                    error={Boolean(editErrors.street)}
                    helperText={editErrors.street}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    fullWidth
                    required
                    value={editFormData.city}
                    onChange={handleEditFieldChange('city')}
                    error={Boolean(editErrors.city)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State / Province"
                    fullWidth
                    value={editFormData.state}
                    onChange={handleEditFieldChange('state')}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    fullWidth
                    required
                    value={editFormData.country}
                    onChange={handleEditFieldChange('country')}
                    error={Boolean(editErrors.country)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Postal / ZIP Code"
                    fullWidth
                    value={editFormData.postalCode}
                    onChange={handleEditFieldChange('postalCode')}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tax ID / TIN"
                    fullWidth
                    required
                    value={editFormData.taxId}
                    onChange={handleEditFieldChange('taxId')}
                    error={Boolean(editErrors.taxId)}
                    helperText={editErrors.taxId}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="VAT Registration Number"
                    fullWidth
                    value={editFormData.vatNumber}
                    onChange={handleEditFieldChange('vatNumber')}
                    size="small"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={handleCloseEditDialog} disabled={isUpdatingVendor} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isUpdatingVendor}>
                {isUpdatingVendor ? <CircularProgress size={20} color="inherit" /> : 'Save Profile Changes'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}

      {/* ============================================================= */}
      {/* DIALOG 3: VENDOR PERFORMANCE EVALUATION / RATING              */}
      {/* ============================================================= */}
      <Dialog open={ratingDialogOpen} onClose={handleCloseRatingDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Evaluate Vendor Performance</DialogTitle>
        <Box component="form" onSubmit={handleSubmitRating} noValidate>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Submit a formal performance evaluation across the 4 standard enterprise procurement dimensions (Scores 1 to 5).
            </Typography>

            {ratingError && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {ratingError}
              </Alert>
            )}

            <Grid container spacing={2.5}>
              {/* Delivery Reliability */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Delivery Reliability
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={ratingForm.deliveryScore}
                    onChange={(_e, v) => setRatingForm((prev) => ({ ...prev, deliveryScore: v || 1 }))}
                    size="medium"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {ratingForm.deliveryScore}
                  </Typography>
                </Box>
              </Grid>

              {/* Product Quality */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Product / Service Quality
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={ratingForm.qualityScore}
                    onChange={(_e, v) => setRatingForm((prev) => ({ ...prev, qualityScore: v || 1 }))}
                    size="medium"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {ratingForm.qualityScore}
                  </Typography>
                </Box>
              </Grid>

              {/* Cost Efficiency */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Cost Efficiency & Pricing
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={ratingForm.costEfficiencyScore}
                    onChange={(_e, v) => setRatingForm((prev) => ({ ...prev, costEfficiencyScore: v || 1 }))}
                    size="medium"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {ratingForm.costEfficiencyScore}
                  </Typography>
                </Box>
              </Grid>

              {/* Compliance Score */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Contract & SLA Compliance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={ratingForm.complianceScore}
                    onChange={(_e, v) => setRatingForm((prev) => ({ ...prev, complianceScore: v || 1 }))}
                    size="medium"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {ratingForm.complianceScore}
                  </Typography>
                </Box>
              </Grid>

              {/* Evaluator Comments */}
              <Grid item xs={12}>
                <TextField
                  label="Evaluator Comments & Performance Notes"
                  placeholder="Summarize fulfillment observations, SLA adherence, or improvement areas (max 1000 characters)..."
                  fullWidth
                  multiline
                  rows={3}
                  value={ratingForm.comments}
                  onChange={(e) => setRatingForm((prev) => ({ ...prev, comments: e.target.value }))}
                  disabled={isSubmittingRating}
                  inputProps={{ maxLength: 1000 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseRatingDialog} disabled={isSubmittingRating} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="secondary" disabled={isSubmittingRating}>
              {isSubmittingRating ? <CircularProgress size={20} color="inherit" /> : 'Submit Performance Rating'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ============================================================= */}
      {/* DIALOG 4: ADD CERTIFICATION                                   */}
      {/* ============================================================= */}
      <Dialog open={certDialogOpen} onClose={handleCloseCertDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Vendor Certification</DialogTitle>
        <Box component="form" onSubmit={handleSubmitCert} noValidate>
          <DialogContent sx={{ pt: 1 }}>
            {certServerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {certServerError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Certification Name"
                  placeholder="e.g. ISO 9001:2015 Quality Management"
                  fullWidth
                  required
                  value={certForm.name}
                  onChange={handleCertFieldChange('name')}
                  error={Boolean(certErrors.name)}
                  helperText={certErrors.name}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Issuing Authority"
                  placeholder="e.g. Bureau Veritas"
                  fullWidth
                  required
                  value={certForm.issuingAuthority}
                  onChange={handleCertFieldChange('issuingAuthority')}
                  error={Boolean(certErrors.issuingAuthority)}
                  helperText={certErrors.issuingAuthority}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Certificate Number"
                  placeholder="e.g. CERT-2026-99182"
                  fullWidth
                  required
                  value={certForm.certificateNumber}
                  onChange={handleCertFieldChange('certificateNumber')}
                  error={Boolean(certErrors.certificateNumber)}
                  helperText={certErrors.certificateNumber}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Issue Date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={certForm.issueDate}
                  onChange={handleCertFieldChange('issueDate')}
                  error={Boolean(certErrors.issueDate)}
                  helperText={certErrors.issueDate}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={certForm.expiryDate}
                  onChange={handleCertFieldChange('expiryDate')}
                  error={Boolean(certErrors.expiryDate)}
                  helperText={certErrors.expiryDate || 'Optional expiration'}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Certificate Document URL"
                  placeholder="https://docs.example.com/cert-iso.pdf"
                  fullWidth
                  required
                  value={certForm.documentUrl}
                  onChange={handleCertFieldChange('documentUrl')}
                  error={Boolean(certErrors.documentUrl)}
                  helperText={certErrors.documentUrl || 'Link to certified document or audit report'}
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseCertDialog} disabled={isSubmittingCert} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmittingCert}>
              {isSubmittingCert ? <CircularProgress size={20} color="inherit" /> : 'Add Certification'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ============================================================= */}
      {/* DIALOG 5: ADD BANK ACCOUNT                                    */}
      {/* ============================================================= */}
      <Dialog open={bankDialogOpen} onClose={handleCloseBankDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Settlement Bank Account</DialogTitle>
        <Box component="form" onSubmit={handleSubmitBank} noValidate>
          <DialogContent sx={{ pt: 1 }}>
            {bankServerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {bankServerError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bank Name"
                  placeholder="e.g. JPMorgan Chase"
                  fullWidth
                  required
                  value={bankForm.bankName}
                  onChange={handleBankFieldChange('bankName')}
                  error={Boolean(bankErrors.bankName)}
                  helperText={bankErrors.bankName}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Account Title"
                  placeholder="e.g. Apex Global Tech Ltd"
                  fullWidth
                  required
                  value={bankForm.accountTitle}
                  onChange={handleBankFieldChange('accountTitle')}
                  error={Boolean(bankErrors.accountTitle)}
                  helperText={bankErrors.accountTitle}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Account Number"
                  placeholder="e.g. 1092837465"
                  fullWidth
                  required
                  value={bankForm.accountNumber}
                  onChange={handleBankFieldChange('accountNumber')}
                  error={Boolean(bankErrors.accountNumber)}
                  helperText={bankErrors.accountNumber}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="IBAN"
                  placeholder="e.g. US33CHAS0000001092837465"
                  fullWidth
                  value={bankForm.iban}
                  onChange={handleBankFieldChange('iban')}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="SWIFT / BIC Code"
                  placeholder="e.g. CHASUS33"
                  fullWidth
                  value={bankForm.swiftCode}
                  onChange={handleBankFieldChange('swiftCode')}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Branch Code"
                  placeholder="e.g. 0441"
                  fullWidth
                  value={bankForm.branchCode}
                  onChange={handleBankFieldChange('branchCode')}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bankForm.isPrimary}
                      onChange={handleBankFieldChange('isPrimary')}
                      color="primary"
                    />
                  }
                  label="Set as Primary Account"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseBankDialog} disabled={isSubmittingBank} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmittingBank}>
              {isSubmittingBank ? <CircularProgress size={20} color="inherit" /> : 'Add Bank Account'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default VendorDetailsPage;
