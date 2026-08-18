import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Typography } from '@mui/material';

export default function WarehouseTable({ warehouses = [], page = 0, rowsPerPage = 10, onPageChange, onRowsPerPageChange }) {
  const display = warehouses;
  const paginated = display.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(w => (
              <TableRow key={w.id} hover>
                <TableCell><Typography fontWeight={600}>{w.name}</Typography></TableCell>
                <TableCell>{w.location}</TableCell>
              </TableRow>
            ))}
            {!paginated.length && <TableRow><TableCell colSpan={2} align="center">No warehouses found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={display.length} rowsPerPage={rowsPerPage} page={page} onPageChange={onPageChange} onRowsPerPageChange={onRowsPerPageChange} />
    </Paper>
  );
}
