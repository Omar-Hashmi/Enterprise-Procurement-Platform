import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Typography } from '@mui/material';

export default function DeliveryTable({ deliveries = [], page = 0, rowsPerPage = 10, onPageChange, onRowsPerPageChange }) {
  const display = deliveries;
  const paginated = display.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ETA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(d => (
              <TableRow key={d.id} hover>
                <TableCell><Typography fontWeight={600}>{d._id || d.id}</Typography></TableCell>
                <TableCell>{d.deliveryStatus || '—'}</TableCell>
                <TableCell>{d.expectedDeliveryDate ? new Date(d.expectedDeliveryDate).toLocaleDateString() : '—'}</TableCell>
              </TableRow>
            ))}
            {!paginated.length && <TableRow><TableCell colSpan={3} align="center">No deliveries found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={display.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
}
