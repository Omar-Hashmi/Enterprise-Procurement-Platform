import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Breadcrumbs,
  Link,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import BlockIcon from '@mui/icons-material/Block'
import RefreshIcon from '@mui/icons-material/Refresh'

import {
  useNavigate,
  Link as RouterLink,
} from 'react-router-dom'

import { useAuthStore } from '../../stores/authStore'
import { USER_ROLES } from '../../utils/constants'
import { useVendor } from '../../hooks/useVendor'
import VendorTable from './components/VendorTable'

const VENDOR_CATEGORIES = [
  'All Categories',
  'IT & Hardware',
  'Software & SaaS',
  'Office Supplies',
  'Logistics & Freight',
  'Consulting & Professional Services',
  'Facilities & Maintenance',
]

const STATUS_OPTIONS = [
  'All Statuses',
  'ACTIVE',
  'PENDING',
  'SUSPENDED',
  'BLACKLISTED',
]

const VendorList = () => {
  const navigate = useNavigate()

  /*
   * --------------------------------------------------------------------------
   * Authentication
   * --------------------------------------------------------------------------
   */

  const user = useAuthStore((state) => state.user)

  const isAdmin =
    user?.role === USER_ROLES.ADMIN

  /*
   * --------------------------------------------------------------------------
   * Filter state
   * --------------------------------------------------------------------------
   */

  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedCategory, setSelectedCategory] =
    useState('All Categories')

  const [selectedStatus, setSelectedStatus] =
    useState('All Statuses')

  /*
   * Backend pagination is 1-based.
   * The MUI TablePagination component is 0-based.
   */
  const [page, setPage] = useState(0)

  const [rowsPerPage, setRowsPerPage] =
    useState(10)

  /*
   * --------------------------------------------------------------------------
   * Search debounce
   * --------------------------------------------------------------------------
   *
   * Prevents an API request on every single keystroke.
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm.trim())
      setPage(0)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchTerm])

  /*
   * --------------------------------------------------------------------------
   * Vendor query
   * --------------------------------------------------------------------------
   */

  const {
    vendors = [],
    pagination,
    fetchVendors,
    deleteVendor,
    isLoading,
    isFetching,
    isDeleting,
    isError,
    error,
  } = useVendor({
    page: page + 1,
    limit: rowsPerPage,
    search: searchQuery,
    status:
      selectedStatus === 'All Statuses'
        ? ''
        : selectedStatus,
    category:
      selectedCategory === 'All Categories'
        ? ''
        : selectedCategory,
  })

  /*
   * --------------------------------------------------------------------------
   * KPI calculations
   * --------------------------------------------------------------------------
   *
   * These values are calculated from the currently returned backend page.
   *
   * IMPORTANT:
   * The backend list endpoint is paginated, so these are NOT guaranteed to
   * represent the entire database.
   *
   * Until the backend exposes a dedicated statistics endpoint, we should not
   * pretend these are global totals.
   */

  const pageStatistics = useMemo(() => {
    return {
      active: vendors.filter(
        (vendor) => vendor.status === 'ACTIVE'
      ).length,

      pending: vendors.filter(
        (vendor) => vendor.status === 'PENDING'
      ).length,

      blacklisted: vendors.filter(
        (vendor) =>
          vendor.status === 'BLACKLISTED'
      ).length,
    }
  }, [vendors])

  const totalVendors =
    pagination?.total ?? 0

  /*
   * --------------------------------------------------------------------------
   * Handlers
   * --------------------------------------------------------------------------
   */

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value)
    setPage(0)
  }

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value)
    setPage(0)
  }

  const handleRefresh = () => {
    fetchVendors()
  }

  const handleDeleteVendor = async (id) => {
    if (!id || isDeleting) {
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this vendor? This action cannot be undone.'
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteVendor(id)
    } catch (deleteError) {
      /*
       * The mutation error is handled by the hook.
       * We intentionally don't silently swallow it.
       */
      console.error(
        'Failed to delete vendor:',
        deleteError
      )
    }
  }

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          sm: 3,
        },
        maxWidth: 1400,
        margin: '0 auto',
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}

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

          <Typography color="text.primary">
            Vendors
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'flex',
            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },
            justifyContent: 'space-between',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
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
              Vendor Directory
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Manage suppliers, view active contracts,
              and monitor vendor performance
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              width: {
                xs: '100%',
                sm: 'auto',
              },
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={() =>
                navigate('/vendors/categories')
              }
            >
              Categories
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isFetching}
            >
              Refresh
            </Button>

            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() =>
                  navigate('/vendors/new')
                }
              >
                Add Vendor
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards */}
      {/* ------------------------------------------------------------------ */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        {/* Total */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: 'divider',
              boxShadow: 'none',
            }}
          >
            <CardContent
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  display: 'flex',
                }}
              >
                <StorefrontIcon />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  Total Vendors
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {totalVendors}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: 'divider',
              boxShadow: 'none',
            }}
          >
            <CardContent
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'success.50',
                  color: 'success.main',
                  display: 'flex',
                }}
              >
                <CheckCircleOutlineIcon />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  Active Suppliers
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {pageStatistics.active}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: 'divider',
              boxShadow: 'none',
            }}
          >
            <CardContent
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'warning.50',
                  color: 'warning.main',
                  display: 'flex',
                }}
              >
                <PendingActionsIcon />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  Pending Review
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {pageStatistics.pending}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Blacklisted */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: 'divider',
              boxShadow: 'none',
            }}
          >
            <CardContent
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'error.50',
                  color: 'error.main',
                  display: 'flex',
                }}
              >
                <BlockIcon />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  Blacklisted
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {pageStatistics.blacklisted}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ------------------------------------------------------------------ */}
      {/* Filters */}
      {/* ------------------------------------------------------------------ */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: 'divider',
          boxShadow: 'none',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Grid
            container
            spacing={2}
            alignItems="center"
          >
            {/* Search */}
            <Grid item xs={12} md={6}>
              <TextField
                placeholder="Search vendor by name, email, or contact person..."
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        color="action"
                        fontSize="small"
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                value={selectedCategory}
                onChange={handleCategoryChange}
                fullWidth
                size="small"
                label="Category"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon
                        color="action"
                        fontSize="small"
                      />
                    </InputAdornment>
                  ),
                }}
              >
                {VENDOR_CATEGORIES.map(
                  (category) => (
                    <MenuItem
                      key={category}
                      value={category}
                    >
                      {category}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                value={selectedStatus}
                onChange={handleStatusChange}
                fullWidth
                size="small"
                label="Status"
              >
                {STATUS_OPTIONS.map(
                  (status) => (
                    <MenuItem
                      key={status}
                      value={status}
                    >
                      {status}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Error */}
      {/* ------------------------------------------------------------------ */}

      {isError && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          }
        >
          {error?.response?.data?.message ||
            error?.message ||
            'Unable to load vendors. Please try again.'}
        </Alert>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Loading */}
      {/* ------------------------------------------------------------------ */}

      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 240,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Table */}
      {/* ------------------------------------------------------------------ */}

      {!isLoading && !isError && (
        <VendorTable
          vendors={vendors}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={
            pagination?.total ?? 0
          }
          onPageChange={(_, newPage) => {
            setPage(newPage)
          }}
          onRowsPerPageChange={(event) => {
            const newRowsPerPage = parseInt(
              event.target.value,
              10
            )

            setRowsPerPage(
              Number.isNaN(newRowsPerPage)
                ? 10
                : newRowsPerPage
            )

            setPage(0)
          }}
          onDelete={handleDeleteVendor}
          isDeleting={isDeleting}
          isAdmin={isAdmin}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Background refresh indicator */}
      {/* ------------------------------------------------------------------ */}

      {!isLoading &&
        isFetching && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 2,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Updating vendor data...
            </Typography>
          </Box>
        )}
    </Box>
  )
}

export { VendorList }

export default VendorList