import React, { useCallback, useEffect, useState } from 'react'

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  Avatar,
  Tab,
  Tabs,
  Alert,
  AlertTitle,
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BusinessIcon from '@mui/icons-material/Business'
import ReceiptIcon from '@mui/icons-material/Receipt'
import RefreshIcon from '@mui/icons-material/Refresh'

import {
  useNavigate,
  useParams,
  Link as RouterLink,
} from 'react-router-dom'

import { useVendor } from '../../hooks/useVendor'

import VendorStatusSummary from './components/VendorStatusSummary'
import VendorRating from './components/VendorRating'
import VendorBankAccounts from './components/VendorBankAccounts'
import VendorCertifications from './components/VendorCertifications'

function TabPanel({
  children,
  value,
  index,
  ...other
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'

    case 'PENDING':
      return 'warning'

    case 'SUSPENDED':
      return 'warning'

    case 'BLACKLISTED':
      return 'error'

    case 'INACTIVE':
      return 'default'

    default:
      return 'default'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'Active'

    case 'PENDING':
      return 'Pending Review'

    case 'SUSPENDED':
      return 'Suspended'

    case 'BLACKLISTED':
      return 'Blacklisted'

    case 'INACTIVE':
      return 'Inactive'

    default:
      return status || 'Unknown'
  }
}

const formatAddress = (vendor) => {
  if (!vendor) return 'N/A'

  if (vendor.address) {
    return vendor.address
  }

  const address = vendor.companyInfo?.address

  if (!address) {
    return 'N/A'
  }

  return [
    address.street,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ') || 'N/A'
}

export const VendorDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { getVendorById, addBankAccount, updateBankAccount, deleteBankAccount, setPrimaryBankAccount } = useVendor()

  const [vendor, setVendor] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchVendor = useCallback(async () => {
    if (!id) {
      setVendor(null)
      setError('Vendor ID is missing from the URL.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getVendorById(id)

      if (!data) {
        throw new Error(
          'Vendor profile was not found.'
        )
      }

      setVendor(data)
    } catch (err) {
      console.error(
        'Failed to load vendor details:',
        err
      )

      const status =
        err?.response?.status

      if (status === 404) {
        setError(
          'Vendor profile was not found.'
        )
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to load vendor details. Please try again.'
        )
      }

      setVendor(null)
    } finally {
      setLoading(false)
    }
  }, [id, getVendorById])

  useEffect(() => {
    fetchVendor()
  }, [fetchVendor])

  const handleTabChange = (
    event,
    newValue
  ) => {
    setTabValue(newValue)
  }

  const vendorId =
    vendor?.id ||
    vendor?._id ||
    id

  const vendorName =
    vendor?.name ||
    vendor?.companyName ||
    'Unnamed Vendor'

  const categories =
    Array.isArray(vendor?.categories)
      ? vendor.categories
      : vendor?.category
        ? [vendor.category]
        : []

  const contactPerson =
    vendor?.contactPerson ||
    vendor?.companyInfo?.contactPerson?.name ||
    'N/A'

  const email =
    vendor?.email ||
    vendor?.companyInfo?.contactPerson?.email ||
    ''

  const phone =
    vendor?.phone ||
    vendor?.companyInfo?.contactPerson?.phone ||
    ''

  const taxId =
    vendor?.taxId ||
    vendor?.taxInfo?.taxId ||
    ''

  const paymentTerms =
    vendor?.paymentTerms || ''

  const rating = Number(
    vendor?.averageRating ??
      vendor?.rating ??
      0
  )

  /*
   * --------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------
   */

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
          p: 3,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  /*
   * --------------------------------------------------------------
   * Error
   * --------------------------------------------------------------
   */

  if (error || !vendor) {
    return (
      <Box
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          maxWidth: 800,
          margin: '0 auto',
          mt: 4,
        }}
      >
        <Alert
          severity={
            error?.includes('not found')
              ? 'warning'
              : 'error'
          }
          action={
            !error?.includes(
              'not found'
            ) ? (
              <Button
                color="inherit"
                size="small"
                startIcon={
                  <RefreshIcon />
                }
                onClick={fetchVendor}
              >
                Retry
              </Button>
            ) : null
          }
          sx={{
            borderRadius: 2,
          }}
        >
          <AlertTitle>
            {error?.includes('not found')
              ? 'Vendor Not Found'
              : 'Error Loading Vendor'}
          </AlertTitle>

          {error ||
            'No records match the requested vendor ID.'}
        </Alert>

        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={
              <ArrowBackIcon />
            }
            onClick={() =>
              navigate('/vendors')
            }
            color="inherit"
          >
            Back to Vendor Directory
          </Button>
        </Box>
      </Box>
    )
  }

  /*
   * --------------------------------------------------------------
   * Main details page
   * --------------------------------------------------------------
   */

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          sm: 3,
        },
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* ---------------------------------------------------------- */}
      {/* Breadcrumbs */}
      {/* ---------------------------------------------------------- */}

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

          <Typography
            color="text.primary"
            sx={{
              maxWidth: {
                xs: 160,
                sm: 'none',
              },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {vendorName}
          </Typography>
        </Breadcrumbs>

        {/* -------------------------------------------------------- */}
        {/* Header */}
        {/* -------------------------------------------------------- */}

        <Box
          sx={{
            display: 'flex',
            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },
            justifyContent:
              'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: {
                xs: 'flex-start',
                sm: 'center',
              },
              gap: 1.5,
              minWidth: 0,
            }}
          >
            <Button
              startIcon={
                <ArrowBackIcon />
              }
              onClick={() =>
                navigate('/vendors')
              }
              color="inherit"
              size="small"
              sx={{
                flexShrink: 0,
              }}
            >
              Back
            </Button>

            <Avatar
              sx={{
                bgcolor:
                  'primary.main',
                width: 44,
                height: 44,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {vendorName
                .charAt(0)
                .toUpperCase()}
            </Avatar>

            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: {
                    xs: 'flex-start',
                    sm: 'center',
                  },
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="text.primary"
                  sx={{
                    wordBreak:
                      'break-word',
                  }}
                >
                  {vendorName}
                </Typography>

                <Chip
                  label={getStatusLabel(
                    vendor.status
                  )}
                  size="small"
                  color={getStatusColor(
                    vendor.status
                  )}
                  sx={{
                    height: 22,
                    fontSize:
                      '0.72rem',
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Categories */}

              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: 'wrap',
                  mt: 0.5,
                }}
              >
                {categories.length > 0 ? (
                  categories.map(
                    (category) => (
                      <Typography
                        key={category}
                        variant="body2"
                        color="text.secondary"
                      >
                        {category}
                      </Typography>
                    )
                  )
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No category assigned
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={
              <EditIcon />
            }
            disabled={!vendorId}
            onClick={() =>
              navigate(
                `/vendors/edit/${vendorId}`
              )
            }
            sx={{
              alignSelf: {
                xs: 'stretch',
                sm: 'center',
              },
            }}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>

      {/* ---------------------------------------------------------- */}
      {/* Vendor Status Summary */}
      {/* ---------------------------------------------------------- */}

      <Box sx={{ mb: 3 }}>
        <VendorStatusSummary
          vendorId={vendorId}
        />
      </Box>

      {/* ---------------------------------------------------------- */}
      {/* Main Tabs */}
      {/* ---------------------------------------------------------- */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: {
              xs: 1,
              sm: 3,
            },
            pt: 1,
            overflowX: 'auto',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="vendor details tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" />

            <Tab label="Bank Accounts" />

            <Tab label="Certifications & Compliance" />

            <Tab label="Performance & Ratings" />
          </Tabs>
        </Box>

        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          {/* ====================================================== */}
          {/* TAB 0: OVERVIEW */}
          {/* ====================================================== */}

          <TabPanel
            value={tabValue}
            index={0}
          >
            <Grid
              container
              spacing={3}
            >
              {/* -------------------------------------------------- */}
              {/* Contact Information */}
              {/* -------------------------------------------------- */}

              <Grid
                item
                xs={12}
                md={6}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="primary"
                  sx={{ mb: 2 }}
                >
                  Contact Information
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection:
                      'column',
                    gap: 2,
                  }}
                >
                  {/* Contact Person */}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 1.5,
                    }}
                  >
                    <BusinessIcon
                      color="action"
                      fontSize="small"
                    />

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Primary Contact
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={500}
                      >
                        {contactPerson}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Email */}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 1.5,
                    }}
                  >
                    <EmailIcon
                      color="action"
                      fontSize="small"
                    />

                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Email Address
                      </Typography>

                      {email ? (
                        <Typography
                          component="a"
                          href={`mailto:${email}`}
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            color:
                              'primary.main',
                            textDecoration:
                              'none',
                            wordBreak:
                              'break-word',
                            '&:hover': {
                              textDecoration:
                                'underline',
                            },
                          }}
                        >
                          {email}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          fontWeight={500}
                        >
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Phone */}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 1.5,
                    }}
                  >
                    <PhoneIcon
                      color="action"
                      fontSize="small"
                    />

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Phone Number
                      </Typography>

                      {phone ? (
                        <Typography
                          component="a"
                          href={`tel:${phone}`}
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            color:
                              'primary.main',
                            textDecoration:
                              'none',
                            '&:hover': {
                              textDecoration:
                                'underline',
                            },
                          }}
                        >
                          {phone}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          fontWeight={500}
                        >
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Address */}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems:
                        'flex-start',
                      gap: 1.5,
                    }}
                  >
                    <LocationOnIcon
                      color="action"
                      fontSize="small"
                      sx={{
                        mt: 0.3,
                      }}
                    />

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Business Address
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={500}
                      >
                        {formatAddress(
                          vendor
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* -------------------------------------------------- */}
              {/* Financial Information */}
              {/* -------------------------------------------------- */}

              <Grid
                item
                xs={12}
                md={6}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="primary"
                  sx={{ mb: 2 }}
                >
                  Financial & Accounting Terms
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection:
                      'column',
                    gap: 2,
                  }}
                >
                  {/* Tax ID */}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 1.5,
                    }}
                  >
                    <ReceiptIcon
                      color="action"
                      fontSize="small"
                    />

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Tax ID / NTN
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={500}
                      >
                        {taxId || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Payment Terms */}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 1.5,
                    }}
                  >
                    <BusinessIcon
                      color="action"
                      fontSize="small"
                    />

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Payment Terms
                      </Typography>

                      {paymentTerms ? (
                        <Chip
                          label={paymentTerms}
                          size="small"
                          variant="outlined"
                          sx={{
                            mt: 0.5,
                            fontWeight: 600,
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          fontWeight={500}
                        >
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Divider
                    sx={{ my: 1 }}
                  />

                  {/* Rating */}

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Current Rating
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ mt: 0.5 }}
                    >
                      {Number.isFinite(
                        rating
                      )
                        ? `${Math.min(
                            Math.max(
                              rating,
                              0
                            ),
                            5
                          ).toFixed(1)} / 5`
                        : 'N/A'}
                    </Typography>
                  </Box>

                  {/* Notes */}

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Internal Notes
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{
                        mt: 0.5,
                        whiteSpace:
                          'pre-wrap',
                        wordBreak:
                          'break-word',
                      }}
                    >
                      {vendor.notes ||
                        'No internal notes recorded for this vendor.'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* ====================================================== */}
          {/* TAB 1: BANK ACCOUNTS */}
          {/* ====================================================== */}

          <TabPanel
            value={tabValue}
            index={1}
          >
            <VendorBankAccounts
              vendorId={vendorId}
              getAccounts={async (id) => (await getVendorById(id)).bankAccounts || []}
              createAccount={addBankAccount}
              updateAccount={updateBankAccount}
              deleteAccount={deleteBankAccount}
              setPrimaryAccount={setPrimaryBankAccount}
            />
          </TabPanel>

          {/* ====================================================== */}
          {/* TAB 2: CERTIFICATIONS */}
          {/* ====================================================== */}

          <TabPanel
            value={tabValue}
            index={2}
          >
            <VendorCertifications
              vendorId={vendorId}
            />
          </TabPanel>

          {/* ====================================================== */}
          {/* TAB 3: RATINGS */}
          {/* ====================================================== */}

          <TabPanel
            value={tabValue}
            index={3}
          >
            <VendorRating
              vendorId={vendorId}
              rating={rating}
            />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  )
}

export default VendorDetails
