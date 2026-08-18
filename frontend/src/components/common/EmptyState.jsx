import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export const EmptyState = ({
  icon: Icon = InboxOutlinedIcon,
  title = 'No Data Found',
  description = 'There is no information to display at this time.',
  actionLabel = '',
  onAction = null,
  actionButton = null,
  size = 'medium', // 'small' | 'medium' | 'large'
  sx = {},
  ...props
}) => {
  const iconSizes = {
    small: 40,
    medium: 64,
    large: 88,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: size === 'small' ? 3 : size === 'large' ? 8 : 5,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: '1px dashed',
        borderColor: 'divider',
        width: '100%',
        ...sx,
      }}
      {...props}
    >
      {Icon && (
        <Box
          sx={{
            mb: 2,
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: iconSizes[size] || 64 }} />
        </Box>
      )}

      <Typography
        variant={size === 'small' ? 'subtitle1' : 'h6'}
        fontWeight={600}
        color="text.primary"
        gutterBottom
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400, mb: actionLabel || actionButton ? 3 : 0 }}
        >
          {description}
        </Typography>
      )}

      {actionButton ? (
        actionButton
      ) : (
        actionLabel &&
        onAction && (
          <Button variant="contained" color="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </Box>
  );
};

export default EmptyState;