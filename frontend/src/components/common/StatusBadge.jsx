import React from 'react';
import { Chip } from '@mui/material';

// Default status mapping for colors and standard labels
const DEFAULT_STATUS_MAP = {
  active: { color: 'success', label: 'Active' },
  completed: { color: 'success', label: 'Completed' },
  success: { color: 'success', label: 'Success' },
  pending: { color: 'warning', label: 'Pending' },
  processing: { color: 'info', label: 'Processing' },
  inactive: { color: 'default', label: 'Inactive' },
  disabled: { color: 'default', label: 'Disabled' },
  failed: { color: 'error', label: 'Failed' },
  error: { color: 'error', label: 'Error' },
  rejected: { color: 'error', label: 'Rejected' },
};

export const StatusBadge = ({
  status = '',
  label,
  variant = 'filled', // 'filled' | 'outlined'
  size = 'small',     // 'small' | 'medium'
  customMap = {},
  icon = null,
  sx = {},
  ...props
}) => {
  const normalizedStatus = String(status).toLowerCase();
  const statusConfig = {
    ...DEFAULT_STATUS_MAP,
    ...customMap,
  }[normalizedStatus] || {
    color: 'default',
    label: status || 'Unknown',
  };

  const badgeLabel = label || statusConfig.label;

  return (
    <Chip
      label={badgeLabel}
      color={statusConfig.color}
      variant={variant}
      size={size}
      icon={icon}
      sx={{
        fontWeight: 600,
        textTransform: 'capitalize',
        borderRadius: 1.5,
        ...sx,
      }}
      {...props}
    />
  );
};

export default StatusBadge;