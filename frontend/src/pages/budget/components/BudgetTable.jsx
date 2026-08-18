import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Box, Typography } from '@mui/material';

const MOCK = [
  { id: 1, name: 'Marketing', amount: 5000, spent: 1200 },
  { id: 2, name: 'R&D', amount: 10000, spent: 4200 },
];

export default function BudgetTable({ budgets = MOCK, page = 0, rowsPerPage = 10, onPageChange, onRowsPerPageChange }) {
  const display = budgets && budgets.length ? budgets : MOCK;
  const paginated = display.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Spent</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Remaining</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(b => (
              <TableRow key={b.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{b.name}</Typography>
                </TableCell>
                <TableCell>{b.amount}</TableCell>
                <TableCell>{b.spent}</TableCell>
                <TableCell>{b.amount - b.spent}</TableCell>
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
