import React from 'react';
import { Box, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export const EmptyState = ({
  title = 'No records found',
  description = 'There are currently no items to display.',
  icon: Icon = InboxOutlinedIcon,
  action,
  minHeight = 240,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        p: 4,
        textAlign: 'center',
        borderRadius: 2,
        border: '1px dashed #cbd5e1',
        backgroundColor: '#f8fafc',
      }}
    >
      <Icon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
      <Typography variant="h6" color="text.primary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: action ? 2 : 0 }}>
        {description}
      </Typography>
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
};

export default EmptyState;
