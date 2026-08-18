import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Typography } from '@mui/material';

const MOCK = [
  { id: 1, name: 'Main Warehouse', location: 'City A' },
  { id: 2, name: 'Overflow', location: 'City B' },
];

export default function WarehouseTable({ warehouses = MOCK, page = 0, rowsPerPage = 10, onPageChange, onRowsPerPageChange }) {
  const display = warehouses && warehouses.length ? warehouses : MOCK;
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
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={display.length} rowsPerPage={rowsPerPage} page={page} onPageChange={onPageChange} onRowsPerPageChange={onRowsPerPageChange} />
    </Paper>
  );
}
