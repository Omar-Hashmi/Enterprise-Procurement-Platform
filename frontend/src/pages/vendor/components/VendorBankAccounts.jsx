import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Skeleton,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'

const INITIAL_FORM = {
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  swiftCode: '',
  branchCode: '',
  currency: 'PKR',
  isPrimary: false,
}

const CURRENCIES = [
  { value: 'PKR', label: 'PKR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
]

const normalizeAccount = (account) => {
  if (!account) return null

  return {
    ...account,
    id: account.id || account._id,
    bankName:
      account.bankName ||
      account.bank ||
      '',
    accountTitle:
      account.accountTitle ||
      account.accountName ||
      account.title ||
      '',
    accountNumber:
      account.accountNumber ||
      '',
    iban:
      account.iban ||
      account.IBAN ||
      '',
    swiftCode:
      account.swiftCode ||
      account.swift ||
      account.bic ||
      '',
    branchCode:
      account.branchCode ||
      '',
    currency:
      account.currency ||
      'PKR',
    isPrimary:
      Boolean(
        account.isPrimary ??
          account.primary
      ),
  }
}

const validateForm = (form) => {
  const errors = {}

  if (!form.bankName.trim()) {
    errors.bankName =
      'Bank name is required.'
  }

  if (!form.accountTitle.trim()) {
    errors.accountTitle =
      'Account title is required.'
  }

  if (!form.accountNumber.trim()) {
    errors.accountNumber =
      'Account number is required.'
  }

  if (
    form.iban.trim() &&
    !/^[A-Z]{2}[0-9A-Z]{10,34}$/i.test(
      form.iban.replace(/\s/g, '')
    )
  ) {
    errors.iban =
      'Enter a valid IBAN.'
  }

  if (
    form.swiftCode.trim() &&
    !/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i.test(
      form.swiftCode.trim()
    )
  ) {
    errors.swiftCode =
      'Enter a valid SWIFT/BIC code.'
  }

  return errors
}

export const VendorBankAccounts = ({
  vendorId,

  /*
   * These functions should be connected to the
   * actual Vendor API hook/service.
   *
   * Example:
   * getAccounts(vendorId)
   * createAccount(vendorId, payload)
   * updateAccount(vendorId, accountId, payload)
   * deleteAccount(vendorId, accountId)
   * setPrimaryAccount(vendorId, accountId)
   */
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  setPrimaryAccount,
}) => {
  const [accounts, setAccounts] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState(null)

  const [dialogOpen, setDialogOpen] =
    useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false)

  const [editingAccount, setEditingAccount] =
    useState(null)

  const [accountToDelete, setAccountToDelete] =
    useState(null)

  const [formData, setFormData] =
    useState(INITIAL_FORM)

  const [formErrors, setFormErrors] =
    useState({})

  const [copiedField, setCopiedField] =
    useState(null)

  const [snackbar, setSnackbar] =
    useState({
      open: false,
      message: '',
      severity: 'success',
    })

  /*
   * --------------------------------------------------------------
   * Notifications
   * --------------------------------------------------------------
   */

  const showMessage = (
    message,
    severity = 'success'
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  const closeSnackbar = () => {
    setSnackbar((previous) => ({
      ...previous,
      open: false,
    }))
  }

  /*
   * --------------------------------------------------------------
   * Load accounts
   * --------------------------------------------------------------
   */

  const loadAccounts =
    useCallback(async () => {
      if (!vendorId) {
        setAccounts([])
        setError(
          'Vendor ID is missing.'
        )
        setLoading(false)
        return
      }

      if (
        typeof getAccounts !==
        'function'
      ) {
        setAccounts([])
        setError(
          'Bank account API integration has not been configured.'
        )
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response =
          await getAccounts(vendorId)

        const data =
          response?.data ??
          response ??
          []

        const normalizedAccounts =
          Array.isArray(data)
            ? data
                .map(normalizeAccount)
                .filter(Boolean)
            : []

        setAccounts(
          normalizedAccounts
        )
      } catch (err) {
        console.error(
          'Failed to load vendor bank accounts:',
          err
        )

        setAccounts([])

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to load bank accounts.'
        )
      } finally {
        setLoading(false)
      }
    }, [vendorId, getAccounts])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  /*
   * --------------------------------------------------------------
   * Derived state
   * --------------------------------------------------------------
   */

  const primaryAccount = useMemo(
    () =>
      accounts.find(
        (account) =>
          account.isPrimary
      ),
    [accounts]
  )

  /*
   * --------------------------------------------------------------
   * Dialog helpers
   * --------------------------------------------------------------
   */

  const openAddDialog = () => {
    setEditingAccount(null)
    setFormData({
      ...INITIAL_FORM,
      isPrimary:
        accounts.length === 0,
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  const openEditDialog = (
    account
  ) => {
    setEditingAccount(account)

    setFormData({
      bankName:
        account.bankName || '',
      accountTitle:
        account.accountTitle ||
        '',
      accountNumber:
        account.accountNumber ||
        '',
      iban:
        account.iban || '',
      swiftCode:
        account.swiftCode ||
        '',
      branchCode:
        account.branchCode ||
        '',
      currency:
        account.currency || 'PKR',
      isPrimary:
        Boolean(
          account.isPrimary
        ),
    })

    setFormErrors({})
    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (saving) return

    setDialogOpen(false)
    setEditingAccount(null)
    setFormData(INITIAL_FORM)
    setFormErrors({})
  }

  /*
   * --------------------------------------------------------------
   * Form
   * --------------------------------------------------------------
   */

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target

    setFormData(
      (previous) => ({
        ...previous,
        [name]:
          name === 'swiftCode'
            ? value.toUpperCase()
            : value,
      })
    )

    setFormErrors(
      (previous) => ({
        ...previous,
        [name]: undefined,
      })
    )
  }

  const handlePrimaryChange = (
    event
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        isPrimary:
          event.target.checked,
      })
    )
  }

  /*
   * --------------------------------------------------------------
   * Create / Update
   * --------------------------------------------------------------
   */

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      const validationErrors =
        validateForm(formData)

      if (
        Object.keys(
          validationErrors
        ).length > 0
      ) {
        setFormErrors(
          validationErrors
        )
        return
      }

      if (!vendorId) {
        showMessage(
          'Vendor ID is missing.',
          'error'
        )
        return
      }

      const payload = {
        bankName:
          formData.bankName.trim(),
        accountTitle:
          formData.accountTitle.trim(),
        accountNumber:
          formData.accountNumber.trim(),
        iban:
          formData.iban
            .replace(/\s/g, '')
            .toUpperCase(),
        swiftCode:
          formData.swiftCode
            .trim()
            .toUpperCase(),
        branchCode:
          formData.branchCode.trim(),
        currency:
          formData.currency,
        isPrimary:
          Boolean(
            formData.isPrimary
          ),
      }

      setSaving(true)

      try {
        if (
          editingAccount
        ) {
          if (
            typeof updateAccount !==
            'function'
          ) {
            throw new Error(
              'Update bank account API is not configured.'
            )
          }

          await updateAccount(
            vendorId,
            editingAccount.id,
            payload
          )

          showMessage(
            'Bank account updated successfully.'
          )
        } else {
          if (
            typeof createAccount !==
            'function'
          ) {
            throw new Error(
              'Create bank account API is not configured.'
            )
          }

          await createAccount(
            vendorId,
            payload
          )

          showMessage(
            'Bank account added successfully.'
          )
        }

        closeDialog()

        await loadAccounts()
      } catch (err) {
        console.error(
          'Failed to save bank account:',
          err
        )

        showMessage(
          err?.response?.data
            ?.message ||
            err?.message ||
            'Unable to save bank account.',
          'error'
        )
      } finally {
        setSaving(false)
      }
    }

  /*
   * --------------------------------------------------------------
   * Delete
   * --------------------------------------------------------------
   */

  const openDeleteDialog = (
    account
  ) => {
    setAccountToDelete(account)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    if (saving) return

    setAccountToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleDelete =
    async () => {
      if (
        !accountToDelete ||
        !vendorId
      ) {
        return
      }

      if (
        typeof deleteAccount !==
        'function'
      ) {
        showMessage(
          'Delete bank account API is not configured.',
          'error'
        )
        return
      }

      setSaving(true)

      try {
        await deleteAccount(
          vendorId,
          accountToDelete.id
        )

        showMessage(
          'Bank account deleted successfully.'
        )

        closeDeleteDialog()

        await loadAccounts()
      } catch (err) {
        console.error(
          'Failed to delete bank account:',
          err
        )

        showMessage(
          err?.response?.data
            ?.message ||
            err?.message ||
            'Unable to delete bank account.',
          'error'
        )
      } finally {
        setSaving(false)
      }
    }

  /*
   * --------------------------------------------------------------
   * Set primary
   * --------------------------------------------------------------
   */

  const handleSetPrimary =
    async (account) => {
      if (
        !vendorId ||
        !account?.id
      ) {
        return
      }

      if (
        typeof setPrimaryAccount !==
        'function'
      ) {
        showMessage(
          'Set-primary bank account API is not configured.',
          'error'
        )
        return
      }

      setSaving(true)

      try {
        await setPrimaryAccount(
          vendorId,
          account.id
        )

        showMessage(
          'Primary bank account updated successfully.'
        )

        await loadAccounts()
      } catch (err) {
        console.error(
          'Failed to set primary bank account:',
          err
        )

        showMessage(
          err?.response?.data
            ?.message ||
            err?.message ||
            'Unable to update primary bank account.',
          'error'
        )
      } finally {
        setSaving(false)
      }
    }

  /*
   * --------------------------------------------------------------
   * Clipboard
   * --------------------------------------------------------------
   */

  const handleCopy =
    async (
      value,
      field
    ) => {
      if (!value) return

      try {
        if (
          !navigator?.clipboard
        ) {
          throw new Error(
            'Clipboard access is unavailable in this browser.'
          )
        }

        await navigator.clipboard.writeText(
          String(value)
        )

        setCopiedField(field)

        showMessage(
          'Copied to clipboard.'
        )

        window.setTimeout(
          () => {
            setCopiedField(null)
          },
          1500
        )
      } catch (err) {
        console.error(
          'Clipboard copy failed:',
          err
        )

        showMessage(
          'Unable to copy this value.',
          'error'
        )
      }
    }

  /*
   * --------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------
   */

  if (loading) {
    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Skeleton
            width={220}
            height={32}
          />

          <Skeleton
            width={130}
            height={40}
          />
        </Box>

        <Skeleton
          variant="rounded"
          height={120}
          sx={{ mb: 2 }}
        />

        <Skeleton
          variant="rounded"
          height={120}
        />
      </Box>
    )
  }

  /*
   * --------------------------------------------------------------
   * Error
   * --------------------------------------------------------------
   */

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={loadAccounts}
          >
            Retry
          </Button>
        }
        sx={{
          borderRadius: 2,
        }}
      >
        {error}
      </Alert>
    )
  }

  /*
   * --------------------------------------------------------------
   * Main UI
   * --------------------------------------------------------------
   */

  return (
    <Box>
      {/* Header */}

      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          justifyContent:
            'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Bank Accounts
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Manage the vendor's registered
            bank accounts.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          disabled={
            !vendorId || saving
          }
        >
          Add Account
        </Button>
      </Box>

      {/* Primary account summary */}

      {primaryAccount && (
        <Alert
          severity="success"
          icon={
            <AccountBalanceIcon />
          }
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
          >
            Primary Account:{' '}
            {primaryAccount.bankName}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {primaryAccount.accountTitle ||
              'Account'}{' '}
            •{' '}
            {primaryAccount.currency}
          </Typography>
        </Alert>
      )}

      {/* Empty state */}

      {accounts.length === 0 ? (
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
              py: 6,
              textAlign: 'center',
            }}
          >
            <AccountBalanceIcon
              sx={{
                fontSize: 48,
                color:
                  'text.secondary',
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              fontWeight={600}
            >
              No Bank Accounts
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              No bank accounts have been
              registered for this vendor.
            </Typography>

            <Button
              variant="outlined"
              startIcon={
                <AddIcon />
              }
              onClick={
                openAddDialog
              }
            >
              Add First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection:
              'column',
            gap: 2,
          }}
        >
          {accounts.map(
            (account) => (
              <Card
                key={account.id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor:
                    account.isPrimary
                      ? 'success.main'
                      : 'divider',
                  boxShadow: 'none',
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: {
                        xs: 'flex-start',
                        sm: 'center',
                      },
                      justifyContent:
                        'space-between',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Account info */}

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems:
                          'flex-start',
                        gap: 1.5,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          bgcolor:
                            'action.hover',
                          display: 'flex',
                          flexShrink: 0,
                        }}
                      >
                        <AccountBalanceIcon
                          color="primary"
                        />
                      </Box>

                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap: 1,
                            flexWrap:
                              'wrap',
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                          >
                            {
                              account.bankName
                            }
                          </Typography>

                          {account.isPrimary && (
                            <Chip
                              icon={
                                <StarIcon />
                              }
                              label="Primary"
                              color="success"
                              size="small"
                              sx={{
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {
                            account.accountTitle ||
                            'N/A'
                          }
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems:
                          'center',
                        gap: 0.5,
                        flexShrink: 0,
                      }}
                    >
                      {!account.isPrimary && (
                        <Tooltip title="Set as primary">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleSetPrimary(
                                account
                              )
                            }
                            disabled={
                              saving
                            }
                          >
                            <StarBorderIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Edit account">
                        <IconButton
                          size="small"
                          onClick={() =>
                            openEditDialog(
                              account
                            )
                          }
                          disabled={
                            saving
                          }
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete account">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            openDeleteDialog(
                              account
                            )
                          }
                          disabled={
                            saving
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider
                    sx={{ my: 2 }}
                  />

                  {/* Account details */}

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                      },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Account Number
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            wordBreak:
                              'break-all',
                          }}
                        >
                          {account.accountNumber ||
                            'N/A'}
                        </Typography>

                        {account.accountNumber && (
                          <Tooltip
                            title={
                              copiedField ===
                              `account-${account.id}`
                                ? 'Copied'
                                : 'Copy'
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleCopy(
                                  account.accountNumber,
                                  `account-${account.id}`
                                )
                              }
                            >
                              <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        IBAN
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          wordBreak:
                            'break-all',
                        }}
                      >
                        {account.iban ||
                          'N/A'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        SWIFT / BIC
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        {account.swiftCode ||
                          'N/A'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Currency
                      </Typography>

                      <Chip
                        label={
                          account.currency ||
                          'N/A'
                        }
                        size="small"
                        variant="outlined"
                        sx={{
                          mt: 0.25,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>

                  {account.branchCode && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Branch Code
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        {
                          account.branchCode
                        }
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </Box>
      )}

      {/* ========================================================== */}
      {/* Add / Edit Dialog */}
      {/* ========================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <form
          onSubmit={
            handleSubmit
          }
        >
          <DialogTitle>
            {editingAccount
              ? 'Edit Bank Account'
              : 'Add Bank Account'}
          </DialogTitle>

          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: 2,
                pt: 1,
              }}
            >
              <TextField
                label="Bank Name"
                name="bankName"
                value={
                  formData.bankName
                }
                onChange={
                  handleFormChange
                }
                error={Boolean(
                  formErrors.bankName
                )}
                helperText={
                  formErrors.bankName
                }
                required
                fullWidth
                autoFocus
              />

              <TextField
                label="Account Title"
                name="accountTitle"
                value={
                  formData.accountTitle
                }
                onChange={
                  handleFormChange
                }
                error={Boolean(
                  formErrors.accountTitle
                )}
                helperText={
                  formErrors.accountTitle
                }
                required
                fullWidth
              />

              <TextField
                label="Account Number"
                name="accountNumber"
                value={
                  formData.accountNumber
                }
                onChange={
                  handleFormChange
                }
                error={Boolean(
                  formErrors.accountNumber
                )}
                helperText={
                  formErrors.accountNumber
                }
                required
                fullWidth
              />

              <TextField
                label="IBAN"
                name="iban"
                value={formData.iban}
                onChange={
                  handleFormChange
                }
                error={Boolean(
                  formErrors.iban
                )}
                helperText={
                  formErrors.iban ||
                  'Optional'
                }
                fullWidth
              />

              <TextField
                label="SWIFT / BIC"
                name="swiftCode"
                value={
                  formData.swiftCode
                }
                onChange={
                  handleFormChange
                }
                error={Boolean(
                  formErrors.swiftCode
                )}
                helperText={
                  formErrors.swiftCode ||
                  'Optional'
                }
                inputProps={{
                  maxLength: 11,
                }}
                fullWidth
              />

              <TextField
                label="Branch Code"
                name="branchCode"
                value={
                  formData.branchCode
                }
                onChange={
                  handleFormChange
                }
                fullWidth
              />

              <TextField
                select
                label="Currency"
                name="currency"
                value={
                  formData.currency
                }
                onChange={
                  handleFormChange
                }
                fullWidth
              >
                {CURRENCIES.map(
                  (currency) => (
                    <MenuItem
                      key={
                        currency.value
                      }
                      value={
                        currency.value
                      }
                    >
                      {currency.label}
                    </MenuItem>
                  )
                )}
              </TextField>

              <Box>
                <Button
                  type="button"
                  variant={
                    formData.isPrimary
                      ? 'contained'
                      : 'outlined'
                  }
                  color="success"
                  startIcon={
                    formData.isPrimary ? (
                      <StarIcon />
                    ) : (
                      <StarBorderIcon />
                    )
                  }
                  onClick={() =>
                    handlePrimaryChange(
                      {
                        target: {
                          checked:
                            !formData.isPrimary,
                        },
                      }
                    )
                  }
                >
                  {formData.isPrimary
                    ? 'Primary Account'
                    : 'Set as Primary'}
                </Button>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{ px: 3, pb: 2 }}
          >
            <Button
              onClick={closeDialog}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={
                saving ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : null
              }
            >
              {saving
                ? 'Saving...'
                : editingAccount
                  ? 'Save Changes'
                  : 'Add Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ========================================================== */}
      {/* Delete Confirmation */}
      {/* ========================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onClose={
          closeDeleteDialog
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Bank Account?
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Are you sure you want to delete
            this bank account?
          </Typography>

          {accountToDelete && (
            <Alert
              severity="warning"
              sx={{
                mt: 2,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
              >
                {
                  accountToDelete.bankName
                }
              </Typography>

              <Typography
                variant="caption"
              >
                {
                  accountToDelete.accountNumber ||
                  'Account number unavailable'
                }
              </Typography>
            </Alert>
          )}

          {accountToDelete?.isPrimary && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                borderRadius: 2,
              }}
            >
              This is the primary bank
              account. Make another account
              primary before deleting it.
            </Alert>
          )}
        </DialogContent>

        <DialogActions
          sx={{ px: 3, pb: 2 }}
        >
          <Button
            onClick={
              closeDeleteDialog
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={
              saving ||
              accountToDelete?.isPrimary
            }
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {saving
              ? 'Deleting...'
              : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================== */}
      {/* Snackbar */}
      {/* ========================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={closeSnackbar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default VendorBankAccounts