import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, Typography, IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export default function BudgetTable({ budgets = [], page = 0, rowsPerPage = 10, onPageChange, onRowsPerPageChange, onEdit }) {
  const display = budgets;
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
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(b => (
              <TableRow key={b.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{b.department?.name || b.department || '—'}</Typography>
                </TableCell>
                <TableCell>{b.allocatedAmount}</TableCell>
                <TableCell>{b.spentAmount}</TableCell>
                <TableCell>{b.remainingAmount}</TableCell>
                <TableCell align="right"><Tooltip title="Edit budget"><IconButton size="small" color="primary" onClick={() => onEdit?.(b)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip></TableCell>
              </TableRow>
            ))}
            {!paginated.length && <TableRow><TableCell colSpan={4} align="center">No budgets found.</TableCell></TableRow>}
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
