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
import { Link as RouterLink } from 'react-router-dom';
import Modal from '../../components/common/Modal';

const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: 'IT & Hardware',
    description:
      'Computers, servers, networking gear, and peripherals',
    vendorCount: 24,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Software & SaaS',
    description:
      'Cloud subscriptions, enterprise licenses, and tools',
    vendorCount: 18,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Office Supplies',
    description:
      'Stationery, furniture, and daily office consumables',
    vendorCount: 12,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Logistics & Freight',
    description:
      'Shipping, warehousing, and transportation providers',
    vendorCount: 9,
    status: 'Active',
  },
  {
    id: 5,
    name: 'Consulting & Legal',
    description:
      'Professional services, legal counsel, and auditing',
    vendorCount: 6,
    status: 'Active',
  },
  {
    id: 6,
    name: 'Facilities & Maintenance',
    description:
      'Janitorial, HVAC, utility, and building services',
    vendorCount: 15,
    status: 'Active',
  },
];

export const VendorCategories = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [error, setError] = useState('');

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================
  const handleOpenAddModal = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setEditingCategory(null);

    setFormData({
      name: '',
      description: '',
    });

    setError('');
    setIsModalOpen(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const handleOpenEditModal = (event, category) => {
    // Prevent parent click handlers / navigation
    event.preventDefault();
    event.stopPropagation();

    setEditingCategory(category);

    setFormData({
      name: category.name,
      description: category.description || '',
    });

    setError('');
    setIsModalOpen(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================
  const handleCloseModal = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setIsModalOpen(false);
    setEditingCategory(null);

    setFormData({
      name: '',
      description: '',
    });

    setError('');
  };

  // ==========================================
  // HANDLE FORM INPUT
  // ==========================================
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  // ==========================================
  // SAVE / UPDATE CATEGORY
  // ==========================================
  const handleSaveCategory = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName) {
      setError('Category name is required');
      return;
    }

    // UPDATE EXISTING CATEGORY
    if (editingCategory) {
      setCategories((previousCategories) =>
        previousCategories.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                name: trimmedName,
                description: trimmedDescription,
              }
            : category
        )
      );
    }

    // ADD NEW CATEGORY
    else {
      const newCategory = {
        id: Date.now(),
        name: trimmedName,
        description: trimmedDescription,
        vendorCount: 0,
        status: 'Active',
      };

      setCategories((previousCategories) => [
        newCategory,
        ...previousCategories,
      ]);
    }

    handleCloseModal();
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================
  const handleDeleteCategory = (event, categoryId) => {
    event.preventDefault();
    event.stopPropagation();

    setCategories((previousCategories) =>
      previousCategories.filter(
        (category) => category.id !== categoryId
      )
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* ==========================================
          HEADER / BREADCRUMBS
      ========================================== */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            to="/dashboard"
          >
            Dashboard
          </Link>

          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            to="/vendors"
          >
            Vendors
          </Link>

          <Typography color="text.primary">
            Vendor Categories
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
            >
              Vendor Categories
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Organize and classify suppliers across procurement
              sectors
            </Typography>
          </Box>

          <Button
            type="button"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={handleOpenAddModal}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {/* ==========================================
          CATEGORY GRID
      ========================================== */}
      <Grid container spacing={2.5}>
        {categories.map((category) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={category.id}
          >
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'divider',
                boxShadow: 'none',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s',

                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Category Name + Vendor Count */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <CategoryIcon
                      color="primary"
                      fontSize="small"
                    />

                    <Typography
                      variant="h6"
                      fontWeight={600}
                      fontSize="1.05rem"
                    >
                      {category.name}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${category.vendorCount} Vendors`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    minHeight: 40,
                    mb: 2,
                  }}
                >
                  {category.description ||
                    'No description provided.'}
                </Typography>

                {/* Bottom Section */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {/* Status */}
                  <Chip
                    label={category.status}
                    size="small"
                    color={
                      category.status === 'Active'
                        ? 'success'
                        : 'default'
                    }
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                    }}
                  />

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.5,
                    }}
                  >
                    {/* ======================================
                        EDIT BUTTON
                    ====================================== */}
                    <Tooltip title="Edit Category">
                      <IconButton
                        type="button"
                        size="small"
                        color="default"
                        aria-label={`Edit ${category.name}`}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          handleOpenEditModal(
                            event,
                            category
                          );
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* ======================================
                        DELETE BUTTON
                    ====================================== */}
                    <Tooltip title="Delete Category">
                      <IconButton
                        type="button"
                        size="small"
                        color="error"
                        aria-label={`Delete ${category.name}`}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          handleDeleteCategory(
                            event,
                            category.id
                          );
                        }}
                      >
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

      {/* ==========================================
          ADD / EDIT MODAL
      ========================================== */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingCategory
            ? 'Edit Vendor Category'
            : 'Add Vendor Category'
        }
        maxWidth="xs"
        actions={
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              width: '100%',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="vendor-category-form"
              variant="contained"
              color="primary"
            >
              {editingCategory
                ? 'Update Category'
                : 'Add Category'}
            </Button>
          </Box>
        }
      >
        <Box
          id="vendor-category-form"
          component="form"
          onSubmit={handleSaveCategory}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 1,
          }}
        >
          <TextField
            name="name"
            label="Category Name"
            value={formData.name}
            onChange={handleInputChange}
            error={Boolean(error)}
            helperText={error}
            fullWidth
            required
            size="small"
            autoFocus
          />

          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleInputChange}
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