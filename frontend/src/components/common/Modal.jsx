import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const Modal = ({
  open = false,
  onClose,
  title = '',
  children,
  actions = null,
  maxWidth = 'sm', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth = true,
  disableBackdropClick = false,
  sx = {},
  ...props
}) => {
  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    if (onClose) {
      onClose(event, reason);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          ...sx,
        },
      }}
      {...props}
    >
      {/* Modal Header */}
      {title && (
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
          }}
        >
          <Typography variant="h6" component="div" fontWeight={600}>
            {title}
          </Typography>
          {onClose && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
                '&:hover': {
                  color: (theme) => theme.palette.grey[800],
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      {/* Modal Body */}
      <DialogContent dividers={Boolean(title)} sx={{ p: 2 }}>
        {children}
      </DialogContent>

      {/* Modal Footer Actions */}
      {actions && (
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;