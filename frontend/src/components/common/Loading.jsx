import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Skeleton,
} from '@mui/material';

export const Loading = ({
  mode = 'spinner',   // 'spinner' | 'fullscreen' | 'overlay' | 'skeleton'
  message = '',
  size = 40,
  color = 'primary',
  open = true,        // Used when mode is 'fullscreen' or 'overlay'
  skeletonRows = 3,
  skeletonHeight = 40,
  sx = {},
  ...props
}) => {
  // Fullscreen modal loading backdrop
  if (mode === 'fullscreen') {
    return (
      <Backdrop
        open={open}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          ...sx,
        }}
        {...props}
      >
        <CircularProgress color="inherit" size={size} />
        {message && (
          <Typography variant="body1" fontWeight={500}>
            {message}
          </Typography>
        )}
      </Backdrop>
    );
  }

  // Semi-transparent overlay for specific containers (parent must have position: relative)
  if (mode === 'overlay') {
    if (!open) return null;
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10,
          gap: 1.5,
          borderRadius: 'inherit',
          ...sx,
        }}
        {...props}
      >
        <CircularProgress color={color} size={size} />
        {message && (
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // Skeleton layout loader
  if (mode === 'skeleton') {
    return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1, ...sx }}>
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <Skeleton
            key={`loading-skeleton-${index}`}
            variant="rounded"
            height={skeletonHeight}
            animation="wave"
          />
        ))}
      </Box>
    );
  }

  // Default centered inline spinner
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        gap: 1.5,
        ...sx,
      }}
      {...props}
    >
      <CircularProgress color={color} size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;