import React from 'react';
import { Snackbar, Alert, AlertTitle, Button, Box, Slide } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../stores/notificationStore';

const SlideTransition = (props) => {
  return <Slide {...props} direction="left" />;
};

export const NotificationToast = () => {
  const navigate = useNavigate();
  const latestToast = useNotificationStore((state) => state.latestToast);
  const dismissToast = useNotificationStore((state) => state.dismissToast);
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  if (!latestToast) return null;

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return;
    dismissToast();
  };

  const handleActionClick = () => {
    if (latestToast?.id) {
      markAsRead(latestToast.id);
    }
    dismissToast();

    const entityType = latestToast?.relatedEntityType?.toLowerCase() || latestToast?.type?.toLowerCase() || '';
    const entityId = latestToast?.relatedEntity;

    if (entityType.includes('purchaserequest') || entityType.includes('request')) {
      if (entityId) navigate(`/purchase-requests/${entityId}`);
      else navigate('/purchase-requests');
    } else if (entityType.includes('approval')) {
      if (entityId) navigate(`/purchase-requests/${entityId}`);
      else navigate('/approvals');
    } else if (entityType.includes('purchaseorder') || entityType.includes('purchase_order')) {
      if (entityId) navigate(`/purchase-orders/${entityId}`);
      else navigate('/purchase-orders');
    } else if (entityType.includes('vendor')) {
      if (entityId) navigate(`/vendors/${entityId}`);
      else navigate('/vendors');
    }
  };

  const getSeverity = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('rejected') || t.includes('cancelled') || t.includes('warning') || t.includes('exhausted')) {
      return 'warning';
    }
    if (t.includes('approved') || t.includes('completed') || t.includes('delivered')) {
      return 'success';
    }
    return 'info';
  };

  return (
    <Snackbar
      open={Boolean(latestToast)}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ mb: 2, mr: 2 }}
    >
      <Alert
        onClose={handleClose}
        severity={getSeverity(latestToast.type)}
        variant="filled"
        sx={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          borderRadius: 2,
          alignItems: 'center',
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {latestToast.relatedEntity && (
              <Button
                color="inherit"
                size="small"
                onClick={handleActionClick}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                }}
              >
                View
              </Button>
            )}
          </Box>
        }
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 0.25 }}>
          {latestToast.title}
        </AlertTitle>
        <Box sx={{ fontSize: '0.8125rem' }}>{latestToast.message}</Box>
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;
