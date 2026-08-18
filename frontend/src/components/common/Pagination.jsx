import React from 'react';
import {
  Box,
  Pagination as MuiPagination,
  TablePagination,
  Typography,
} from '@mui/material';

export const Pagination = ({
  count = 1,              // Total number of pages
  page = 1,               // Current page (1-based index)
  onChange,               // (event, pageNumber) => void
  rowsPerPage,            // Optional: if provided, renders TablePagination layout
  totalCount,             // Total number of items/rows
  rowsPerPageOptions = [5, 10, 25, 50],
  onRowsPerPageChange,
  variant = 'outlined',   // 'text' | 'outlined'
  shape = 'rounded',      // 'circular' | 'rounded'
  size = 'medium',        // 'small' | 'medium' | 'large'
  showFirstButton = true,
  showLastButton = true,
  sx = {},
  ...props
}) => {
  // Render TablePagination format when rowsPerPage management is needed
  if (rowsPerPage !== undefined && totalCount !== undefined) {
    return (
      <TablePagination
        component="div"
        count={totalCount}
        page={page - 1} // Mui TablePagination uses 0-based index
        onPageChange={(e, newPage) => onChange && onChange(e, newPage + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          ...sx,
        }}
        {...props}
      />
    );
  }

  // Standard standalone pagination controls
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        py: 2,
        px: 1,
        ...sx,
      }}
    >
      {totalCount !== undefined && (
        <Typography variant="body2" color="text.secondary">
          Total items: <strong>{totalCount}</strong>
        </Typography>
      )}

      <MuiPagination
        count={count}
        page={page}
        onChange={onChange}
        variant={variant}
        shape={shape}
        size={size}
        showFirstButton={showFirstButton}
        showLastButton={showLastButton}
        color="primary"
        {...props}
      />
    </Box>
  );
};

export default Pagination;