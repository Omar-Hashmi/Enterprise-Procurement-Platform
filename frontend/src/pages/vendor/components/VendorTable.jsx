import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Rating,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';

const MOCK_VENDORS = [
  {
    id: '1',
    name: 'Apex Global Logistics',
    category: 'Logistics & Freight',
    contactPerson: 'Sarah Jenkins',
    email: 's.jenkins@apexlogistics.com',
    phone: '+1 (555) 019-2834',
    status: 'ACTIVE',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'TechCraft Solutions',
    category: 'IT Hardware',
    contactPerson: 'Zaid Khan',
    email: 'z.khan@techcraft.io',
    phone: '+92 300 1234567',
    status: 'ACTIVE',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Paper & Ink Supplies',
    category: 'Office Supplies',
    contactPerson: 'Maria Garcia',
    email: 'm.garcia@paperink.com',
    phone: '+1 (555) 014-9921',
    status: 'PENDING',
    rating: 3.5,
  },
  {
    id: '4',
    name: 'Global Freight Forwarders',
    category: 'Logistics & Freight',
    contactPerson: 'Ahmed Hassan',
    email: 'a.hassan@globalfreight.com',
    phone: '+92 321 9876543',
    status: 'BLACK_LISTED',
    rating: 2.1,
  },
];

export const VendorTable = ({
  vendors = MOCK_VENDORS,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedVendorId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVendorId(null);
  };

  const handleView = () => {
    if (selectedVendorId) {
      navigate(`/vendors/${selectedVendorId}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedVendorId) {
      navigate(`/vendors/edit/${selectedVendorId}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedVendorId && onDelete) {
      onDelete(selectedVendorId);
    }
    handleMenuClose();
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Chip label="Active" color="success" size="small" sx={{ fontWeight: 600, height: 22 }} />;
      case 'PENDING':
        return <Chip label="Pending Review" color="warning" size="small" sx={{ fontWeight: 600, height: 22 }} />;
      case 'INACTIVE':
        return <Chip label="Inactive" color="default" size="small" sx={{ fontWeight: 600, height: 22 }} />;
      case 'BLACK_LISTED':
        return <Chip label="Blacklisted" color="error" size="small" sx={{ fontWeight: 600, height: 22 }} />;
      default:
        return <Chip label={status} size="small" sx={{ height: 22 }} />;
    }
  };

  const displayVendors = vendors.length > 0 ? vendors : MOCK_VENDORS;
  const paginatedVendors = displayVendors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: 'divider' }}>
      <TableContainer>
        <Table sx={{ minWidth: 800 }} aria-label="vendor table">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Vendor Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact Person</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVendors.map((vendor) => (
              <TableRow key={vendor.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {/* Vendor Name */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 34, height: 34, fontSize: '0.875rem', fontWeight: 700 }}>
                      {vendor.name ? vendor.name.charAt(0) : 'V'}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                        onClick={() => navigate(`/vendors/${vendor.id}`)}
                      >
                        {vendor.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ID: #{vendor.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <Chip
                    label={vendor.category || 'General'}
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.75rem', borderRadius: 1.5 }}
                  />
                </TableCell>

                {/* Contact Info */}
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {vendor.contactPerson || 'N/A'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                    {vendor.email && (
                      <Tooltip title={vendor.email}>
                        <EmailIcon fontSize="inherit" color="action" />
                      </Tooltip>
                    )}
                    {vendor.phone && (
                      <Tooltip title={vendor.phone}>
                        <PhoneIcon fontSize="inherit" color="action" />
                      </Tooltip>
                    )}
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 160 }}>
                      {vendor.email}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Rating */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={Number(vendor.rating) || 0} precision={0.5} readOnly size="small" />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      ({vendor.rating || 0})
                    </Typography>
                  </Box>
                </TableCell>

                {/* Status */}
                <TableCell>{getStatusChip(vendor.status)}</TableCell>

                {/* Action Menu */}
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, vendor.id)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={displayVendors.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      {/* Context Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 2,
          sx: { minWidth: 140, borderRadius: 1.5 },
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText primary="Edit Vendor" />
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default VendorTable;