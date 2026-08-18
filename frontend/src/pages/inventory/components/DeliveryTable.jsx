import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Typography } from '@mui/material';

const MOCK = [
  { id: 1, ref: 'DEL-1001', status: 'Pending', eta: '2026-08-20' },
  { id: 2, ref: 'DEL-1002', status: 'Received', eta: '2026-08-15' },
];

export default function DeliveryTable({ deliveries = MOCK, page = 0, rowsPerPage = 10, onPageChange, onRowsPerPageChange }) {
  const display = deliveries && deliveries.length ? deliveries : MOCK;
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
                <TableCell><Typography fontWeight={600}>{d.ref}</Typography></TableCell>
                <TableCell>{d.status}</TableCell>
                <TableCell>{d.eta}</TableCell>
              </TableRow>
            ))}
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
