import React, { useState } from 'react'
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
} from '@mui/material'

import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'

import { useNavigate } from 'react-router-dom'

export const VendorTable = ({
  vendors = [],
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
  isDeleting = false,
  isAdmin = false,
}) => {
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedVendorId, setSelectedVendorId] =
    useState(null)

  const handleMenuOpen = (event, id) => {
    if (!id) return

    setAnchorEl(event.currentTarget)
    setSelectedVendorId(id)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedVendorId(null)
  }

  const handleView = () => {
    if (selectedVendorId) {
      navigate(`/vendors/${selectedVendorId}`)
    }

    handleMenuClose()
  }

  const handleEdit = () => {
    if (selectedVendorId) {
      navigate(`/vendors/${selectedVendorId}/edit`)
    }

    handleMenuClose()
  }

  const handleDelete = () => {
    if (
      selectedVendorId &&
      onDelete &&
      isAdmin &&
      !isDeleting
    ) {
      onDelete(selectedVendorId)
    }

    handleMenuClose()
  }

  const getStatusChip = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Chip
            label="Active"
            color="success"
            size="small"
            sx={{
              fontWeight: 600,
              height: 22,
            }}
          />
        )

      case 'PENDING':
        return (
          <Chip
            label="Pending Review"
            color="warning"
            size="small"
            sx={{
              fontWeight: 600,
              height: 22,
            }}
          />
        )

      case 'SUSPENDED':
        return (
          <Chip
            label="Suspended"
            color="warning"
            size="small"
            sx={{
              fontWeight: 600,
              height: 22,
            }}
          />
        )

      case 'INACTIVE':
        return (
          <Chip
            label="Inactive"
            color="default"
            size="small"
            sx={{
              fontWeight: 600,
              height: 22,
            }}
          />
        )

      case 'BLACKLISTED':
        return (
          <Chip
            label="Blacklisted"
            color="error"
            size="small"
            sx={{
              fontWeight: 600,
              height: 22,
            }}
          />
        )

      default:
        return (
          <Chip
            label={
              status
                ? String(status)
                : 'Unknown'
            }
            size="small"
            sx={{ height: 22 }}
          />
        )
    }
  }

  /*
   * The backend already paginates the vendors.
   *
   * DO NOT use Array.slice() here.
   *
   * The previous implementation was effectively doing:
   *
   * API page 2 → received 10 vendors → slice page 2 again
   *
   * which could produce an empty table.
   */

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'divider',
      }}
    >
      <TableContainer
        sx={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Table
          sx={{
            minWidth: 800,
          }}
          aria-label="vendor table"
        >
          <TableHead
            sx={{
              bgcolor: 'action.hover',
            }}
          >
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Vendor Name
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Category
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Contact Person
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Rating
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Status
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    py: 8,
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="text.primary"
                  >
                    No vendors found
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Try changing your search or
                    filter criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => {
                const vendorId =
                  vendor.id ||
                  vendor._id

                const vendorName =
                  vendor.name ||
                  vendor.companyName ||
                  'Unnamed Vendor'

                const rawCategories = Array.isArray(
                  vendor.categories
                )
                  ? vendor.categories
                  : vendor.category
                    ? [vendor.category]
                    : []

                const categories = rawCategories
                  .map((cat) => {
                    if (!cat) return ''
                    if (typeof cat === 'string') return cat.trim()
                    if (typeof cat === 'object') {
                      return cat.name || cat.title || cat.label || ''
                    }
                    return String(cat)
                  })
                  .filter(Boolean)

                const primaryCategory =
                  categories[0] ||
                  'General'

                const contactPerson =
                  vendor.contactPerson ||
                  vendor.companyInfo
                    ?.contactPerson?.name ||
                  'N/A'

                const email =
                  vendor.email ||
                  vendor.companyInfo
                    ?.contactPerson?.email ||
                  ''

                const phone =
                  vendor.phone ||
                  vendor.companyInfo
                    ?.contactPerson?.phone ||
                  ''

                const rating = Number(
                  vendor.averageRating ??
                    vendor.rating ??
                    0
                )

                return (
                  <TableRow
                    key={vendorId}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th':
                        {
                          border: 0,
                        },
                    }}
                  >
                    {/* ------------------------------------------------ */}
                    {/* Vendor Name */}
                    {/* ------------------------------------------------ */}

                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor:
                              'primary.light',
                            width: 34,
                            height: 34,
                            fontSize:
                              '0.875rem',
                            fontWeight: 700,
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
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              cursor: vendorId
                                ? 'pointer'
                                : 'default',
                              '&:hover': vendorId
                                ? {
                                    color:
                                      'primary.main',
                                    textDecoration:
                                      'underline',
                                  }
                                : {},
                            }}
                            onClick={() => {
                              if (vendorId) {
                                navigate(
                                  `/vendors/${vendorId}`
                                )
                              }
                            }}
                          >
                            {vendorName}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{
                              wordBreak:
                                'break-all',
                            }}
                          >
                            ID: #{vendorId || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* ------------------------------------------------ */}
                    {/* Category */}
                    {/* ------------------------------------------------ */}

                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          flexWrap: 'wrap',
                        }}
                      >
                        {categories.length > 0 ? (
                          categories
                            .slice(0, 2)
                            .map((categoryName, idx) => (
                              <Chip
                                key={`${vendorId || 'v'}-cat-${idx}`}
                                label={categoryName}
                                variant="outlined"
                                size="small"
                                sx={{
                                  fontSize:
                                    '0.75rem',
                                  borderRadius: 1.5,
                                }}
                              />
                            ))
                        ) : (
                          <Chip
                            label={
                              primaryCategory
                            }
                            variant="outlined"
                            size="small"
                            sx={{
                              fontSize:
                                '0.75rem',
                              borderRadius: 1.5,
                            }}
                          />
                        )}

                        {categories.length >
                          2 && (
                          <Tooltip
                            title={categories
                              .slice(2)
                              .join(', ')}
                          >
                            <Chip
                              label={`+${
                                categories.length -
                                2
                              }`}
                              size="small"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* ------------------------------------------------ */}
                    {/* Contact */}
                    {/* ------------------------------------------------ */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                      >
                        {contactPerson}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 1,
                          mt: 0.3,
                          minWidth: 0,
                        }}
                      >
                        {email && (
                          <Tooltip
                            title={`Email: ${email}`}
                          >
                            <EmailIcon
                              fontSize="inherit"
                              color="action"
                            />
                          </Tooltip>
                        )}

                        {phone && (
                          <Tooltip
                            title={`Phone: ${phone}`}
                          >
                            <PhoneIcon
                              fontSize="inherit"
                              color="action"
                            />
                          </Tooltip>
                        )}

                        {email && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{
                              maxWidth: 160,
                            }}
                          >
                            {email}
                          </Typography>
                        )}

                        {!email && !phone && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            No contact
                            information
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* ------------------------------------------------ */}
                    {/* Rating */}
                    {/* ------------------------------------------------ */}

                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 0.5,
                        }}
                      >
                        <Rating
                          value={
                            Number.isFinite(
                              rating
                            )
                              ? Math.min(
                                  Math.max(
                                    rating,
                                    0
                                  ),
                                  5
                                )
                              : 0
                          }
                          precision={0.5}
                          readOnly
                          size="small"
                        />

                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          ({rating.toFixed(1)})
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* ------------------------------------------------ */}
                    {/* Status */}
                    {/* ------------------------------------------------ */}

                    <TableCell>
                      {getStatusChip(
                        vendor.status
                      )}
                    </TableCell>

                    {/* ------------------------------------------------ */}
                    {/* Actions */}
                    {/* ------------------------------------------------ */}

                    <TableCell align="right">
                      <Tooltip title="More actions">
                        <span>
                          <IconButton
                            size="small"
                            onClick={(event) =>
                              handleMenuOpen(
                                event,
                                vendorId
                              )
                            }
                            disabled={!vendorId}
                            aria-label={`Actions for ${vendorName}`}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* -------------------------------------------------------------- */}
      {/* Pagination */}
      {/* -------------------------------------------------------------- */}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Rows per page:"
        sx={{
          '.MuiTablePagination-toolbar': {
            flexWrap: {
              xs: 'wrap',
              sm: 'nowrap',
            },
            justifyContent: {
              xs: 'center',
              sm: 'flex-end',
            },
            py: 1,
          },
        }}
      />

      {/* -------------------------------------------------------------- */}
      {/* Context Action Menu */}
      {/* -------------------------------------------------------------- */}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            minWidth: 160,
            borderRadius: 1.5,
          },
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon
              fontSize="small"
              color="action"
            />
          </ListItemIcon>

          <ListItemText primary="View Details" />
        </MenuItem>

        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon
              fontSize="small"
              color="action"
            />
          </ListItemIcon>

          <ListItemText primary="Edit Vendor" />
        </MenuItem>

        {isAdmin && (
          <MenuItem
            onClick={handleDelete}
            disabled={isDeleting}
            sx={{
              color: 'error.main',
            }}
          >
            <ListItemIcon>
              <DeleteIcon
                fontSize="small"
                color="error"
              />
            </ListItemIcon>

            <ListItemText
              primary={
                isDeleting
                  ? 'Deleting...'
                  : 'Delete'
              }
            />
          </MenuItem>
        )}
      </Menu>
    </Paper>
  )
}

export default VendorTable