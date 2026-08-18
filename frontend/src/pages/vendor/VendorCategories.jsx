import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  TextField,
  Breadcrumbs,
  Link,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CategoryIcon from '@mui/icons-material/Category';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Modal from '../../components/common/Modal';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'IT & Hardware', description: 'Computers, servers, networking gear, and peripherals', vendorCount: 24, status: 'Active' },
  { id: 2, name: 'Software & SaaS', description: 'Cloud subscriptions, enterprise licenses, and tools', vendorCount: 18, status: 'Active' },
  { id: 3, name: 'Office Supplies', description: 'Stationery, furniture, and daily office consumables', vendorCount: 12, status: 'Active' },
  { id: 4, name: 'Logistics & Freight', description: 'Shipping, warehousing, and transportation providers', vendorCount: 9, status: 'Active' },
  { id: 5, name: 'Consulting & Legal', description: 'Professional services, legal counsel, and auditing', vendorCount: 6, status: 'Active' },
  { id: 6, name: 'Facilities & Maintenance', description: 'Janitorial, HVAC, utility, and building services', vendorCount: 15, status: 'Active' },
];

export const VendorCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const handleOpenModal = () => {
    setNewCategory({ name: '', description: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    const created = {
      id: Date.now(),
      name: newCategory.name,
      description: newCategory.description,
      vendorCount: 0,
      status: 'Active',
    };

    setCategories((prev) => [created, ...prev]);
    handleCloseModal();
  };

  const modalActions = (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="outlined" color="inherit" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button variant="contained" color="primary" onClick={handleCreateCategory}>
        Add Category
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header & Navigation */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">
            Dashboard
          </Link>
          <Link component={RouterLink} underline="hover" color="inherit" to="/vendors">
            Vendors
          </Link>
          <Typography color="text.primary">Vendor Categories</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Vendor Categories
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Organize and classify suppliers across procurement sectors
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {/* Grid List of Categories */}
      <Grid container spacing={2.5}>
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} key={cat.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'divider',
                boxShadow: 'none',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight={600} fontSize="1.05rem">
                      {cat.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${cat.vendorCount} Vendors`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, mb: 2 }}>
                  {cat.description || 'No description provided.'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Chip
                    label={cat.status}
                    size="small"
                    color={cat.status === 'Active' ? 'success' : 'default'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit Category">
                      <IconButton size="small" color="default">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Category">
                      <IconButton size="small" color="error">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Category Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="Add Vendor Category"
        maxWidth="xs"
        actions={modalActions}
      >
        <Box component="form" onSubmit={handleCreateCategory} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Category Name"
            value={newCategory.name}
            onChange={(e) => {
              setNewCategory({ ...newCategory, name: e.target.value });
              if (error) setError('');
            }}
            error={Boolean(error)}
            helperText={error}
            fullWidth
            required
            size="small"
          />
          <TextField
            label="Description"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            size="small"
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default VendorCategories;