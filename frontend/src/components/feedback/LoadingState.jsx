import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingState = ({ message = 'Loading...', minHeight = 200 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress size={36} thickness={4} color="primary" />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState;
