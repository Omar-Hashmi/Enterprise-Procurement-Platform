import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Typography } from '@mui/material';

const MOCK = [
  { id: 1, title: 'Office Supplies', vendor: 'Vendor A', expires: '2026-12-01' },
  { id: 2, title: 'Maintenance', vendor: 'Vendor B', expires: '2026-09-15' },
];

export default function ContractTable({ contracts = MOCK, page = 0, rowsPerPage = 10, onPageChange, onRowsPerPageChange }) {
  const display = contracts && contracts.length ? contracts : MOCK;
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
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(c => (
              <TableRow key={c.id} hover>
                <TableCell><Typography fontWeight={600}>{c.title}</Typography></TableCell>
                <TableCell>{c.vendor}</TableCell>
                <TableCell>{c.expires}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={display.length} rowsPerPage={rowsPerPage} page={page} onPageChange={onPageChange} onRowsPerPageChange={onRowsPerPageChange} />
    </Paper>
  );
}
