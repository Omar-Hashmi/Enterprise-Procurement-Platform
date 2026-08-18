import React from 'react';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export const Button = ({
  children,
  type = 'button',
  variant = 'contained', // 'contained' | 'outlined' | 'text'
  color = 'primary',     // 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  size = 'medium',       // 'small' | 'medium' | 'large'
  isLoading = false,
  disabled = false,
  startIcon = null,
  endIcon = null,
  fullWidth = false,
  onClick,
  sx = {},
  ...props
}) => {
  return (
    <MuiButton
      type={type}
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || isLoading}
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={!isLoading && startIcon ? startIcon : null}
      endIcon={!isLoading && endIcon ? endIcon : null}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        position: 'relative',
        ...sx,
      }}
      {...props}
    >
      {isLoading ? (
        <CircularProgress
          size={size === 'small' ? 18 : size === 'large' ? 26 : 22}
          color="inherit"
        />
      ) : (
        children
      )}
    </MuiButton>
  );
};

export default Button;