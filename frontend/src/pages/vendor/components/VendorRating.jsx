import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Rating,
  LinearProgress,
  Chip,
  Button,
  Divider,
  Avatar,
  Stack,
  TextField,
  MenuItem,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';
import Modal from '../../../components/common/Modal';

const MOCK_PERFORMANCE_METRICS = {
  overallScore: 4.6,
  totalReviews: 28,
  kpis: {
    onTimeDelivery: 94, // percentage
    qualityCompliance: 98,
    responseTime: 90,
    priceCompetitiveness: 88,
  },
  ratingBreakdown: {
    5: 18,
    4: 7,
    3: 2,
    2: 1,
    1: 0,
  },
};

const MOCK_REVIEWS = [
  {
    id: 1,
    evaluator: 'Sarah Jenkins',
    role: 'Procurement Manager',
    rating: 5,
    date: '2026-07-12',
    comment: 'Exceptional delivery speed on recent hardware bulk orders. Zero DOA items received.',
    category: 'Hardware Logistics',
  },
  {
    id: 2,
    evaluator: 'Farhan Ahmed',
    role: 'Supply Chain Lead',
    rating: 4,
    date: '2026-05-28',
    comment: 'Consistent quality and reliable communication. Slight delay in invoice processing during Q1.',
    category: 'SLA Compliance',
  },
];

const INITIAL_REVIEW_FORM = {
  rating: 5,
  category: 'General Performance',
  comment: '',
};

export const VendorRating = ({ vendorId, vendorName = 'Apex Global Logistics' }) => {
  const [metrics, setMetrics] = useState(MOCK_PERFORMANCE_METRICS);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState(INITIAL_REVIEW_FORM);

  const handleOpenModal = () => {
    setReviewForm(INITIAL_REVIEW_FORM);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;

    const newReview = {
      id: Date.now(),
      evaluator: 'Current User', // Adaptable to logged-in user context
      role: 'Internal Auditor',
      rating: Number(reviewForm.rating),
      date: new Date().toISOString().split('T')[0],
      comment: reviewForm.comment,
      category: reviewForm.category,
    };

    setReviews((prev) => [newReview, ...prev]);
    handleCloseModal();
  };

  const modalActions = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="outlined" color="inherit" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button variant="contained" color="primary" onClick={handleSubmitReview}>
        Submit Evaluation
      </Button>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Vendor Rating & Performance KPIs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Scorecards based on procurement history, delivery speed, and internal evaluations
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Add Rating
        </Button>
      </Box>

      {/* Main Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Overall Score Summary */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%', py: 3 }}>
              <Typography variant="h2" fontWeight={800} color="primary.main">
                {metrics.overallScore}
              </Typography>
              <Rating
                value={metrics.overallScore}
                precision={0.1}
                readOnly
                size="large"
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Based on {metrics.totalReviews} internal evaluations
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1} sx={{ textAlign: 'left', px: 1 }}>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = metrics.ratingBreakdown[stars] || 0;
                  const pct = (count / metrics.totalReviews) * 100;
                  return (
                    <Box key={stars} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ minWidth: 20 }}>
                        {stars}★
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 24, textAlign: 'right' }}>
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed KPI Progress Bars */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Performance Metrics Breakdown
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShippingIcon color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          On-Time Delivery
                        </Typography>
                      </Box>
                      <Chip label={`${metrics.kpis.onTimeDelivery}%`} color="success" size="small" fontWeight={700} />
                    </Box>
                    <LinearProgress variant="determinate" value={metrics.kpis.onTimeDelivery} color="success" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedUserIcon color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          Quality Compliance
                        </Typography>
                      </Box>
                      <Chip label={`${metrics.kpis.qualityCompliance}%`} color="success" size="small" />
                    </Box>
                    <LinearProgress variant="determinate" value={metrics.kpis.qualityCompliance} color="success" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SpeedIcon color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          Response Rate
                        </Typography>
                      </Box>
                      <Chip label={`${metrics.kpis.responseTime}%`} color="info" size="small" />
                    </Box>
                    <LinearProgress variant="determinate" value={metrics.kpis.responseTime} color="info" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          Price Competitiveness
                        </Typography>
                      </Box>
                      <Chip label={`${metrics.kpis.priceCompetitiveness}%`} color="warning" size="small" />
                    </Box>
                    <LinearProgress variant="determinate" value={metrics.kpis.priceCompetitiveness} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reviews & Evaluations List */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Recent Evaluation Records
      </Typography>

      <Stack spacing={2}>
        {reviews.map((rev) => (
          <Card key={rev.id} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                    {rev.evaluator.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {rev.evaluator}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rev.role} • {rev.date}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Rating value={rev.rating} readOnly size="small" />
                  <Typography variant="caption" display="block" color="text.secondary">
                    {rev.category}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
                "{rev.comment}"
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Add Rating Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={`Add Performance Evaluation for ${vendorName}`}
        maxWidth="sm"
        actions={modalActions}
      >
        <Box component="form" onSubmit={handleSubmitReview} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
              Rating Score
            </Typography>
            <Rating
              name="rating"
              value={Number(reviewForm.rating)}
              onChange={(e, newValue) => setReviewForm((prev) => ({ ...prev, rating: newValue }))}
              size="large"
            />
          </Box>

          <TextField
            select
            name="category"
            label="Evaluation Category"
            value={reviewForm.category}
            onChange={handleFormChange}
            fullWidth
            size="small"
          >
            <MenuItem value="General Performance">General Performance</MenuItem>
            <MenuItem value="Hardware Logistics">Hardware Logistics</MenuItem>
            <MenuItem value="SLA Compliance">SLA Compliance</MenuItem>
            <MenuItem value="Pricing & Billing">Pricing & Billing</MenuItem>
          </TextField>

          <TextField
            name="comment"
            label="Evaluation Comments & Notes"
            value={reviewForm.comment}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={4}
            required
            size="small"
            placeholder="Summarize key strengths, delays, or quality issues observed..."
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default VendorRating;