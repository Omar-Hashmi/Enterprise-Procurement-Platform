import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Typography, IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function ContractTable({ contracts = [], page = 0, rowsPerPage = 10, onPageChange, onRowsPerPageChange, onEdit, onDelete }) {
  const display = contracts;
  const paginated = display.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Expires</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(c => (
              <TableRow key={c.id} hover>
                <TableCell><Typography fontWeight={600}>{c.title}</Typography></TableCell>
                <TableCell>{c.vendor?.companyName || c.vendor?.name || c.vendor || '—'}</TableCell>
                <TableCell>{c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}</TableCell>
                <TableCell align="right"><Tooltip title="Edit contract"><IconButton size="small" color="primary" onClick={() => onEdit?.(c)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete contract"><IconButton size="small" color="error" onClick={() => onDelete?.(c)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip></TableCell>
              </TableRow>
            ))}
            {!paginated.length && <TableRow><TableCell colSpan={3} align="center">No contracts found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={display.length} rowsPerPage={rowsPerPage} page={page} onPageChange={onPageChange} onRowsPerPageChange={onRowsPerPageChange} />
    </Paper>
  );
}
