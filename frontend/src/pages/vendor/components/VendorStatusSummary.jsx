import React from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Skeleton,
} from '@mui/material'

import AssignmentIcon from '@mui/icons-material/Assignment'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

const EMPTY_VALUE = 'N/A'

const getRiskChip = (level) => {
  const normalizedLevel = String(
    level || ''
  ).toUpperCase()

  switch (normalizedLevel) {
    case 'LOW':
      return (
        <Chip
          label="Low Risk"
          color="success"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )

    case 'MEDIUM':
      return (
        <Chip
          label="Medium Risk"
          color="warning"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )

    case 'HIGH':
      return (
        <Chip
          label="High Risk"
          color="error"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )

    default:
      return (
        <Chip
          label="Risk Unknown"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
  }
}

const normalizeNumber = (value) => {
  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : null
}

const formatCurrency = (
  amount,
  currency
) => {
  const numericAmount =
    normalizeNumber(amount)

  if (
    numericAmount === null ||
    !currency
  ) {
    return EMPTY_VALUE
  }

  try {
    return new Intl.NumberFormat(
      'en-PK',
      {
        style: 'currency',
        currency: String(currency).toUpperCase(),
        maximumFractionDigits: 0,
      }
    ).format(numericAmount)
  } catch {
    return `${String(currency).toUpperCase()} ${numericAmount.toLocaleString(
      'en-PK'
    )}`
  }
}

const SummaryCard = ({
  icon,
  iconColor,
  iconBackground,
  label,
  value,
  valueColor,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: 2,
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <CardContent
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: iconBackground,
            color: iconColor,
            display: 'flex',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={500}
            display="block"
          >
            {label}
          </Typography>

          <Typography
            variant="h6"
            fontWeight={700}
            color={
              valueColor || 'text.primary'
            }
            sx={{
              wordBreak: 'break-word',
            }}
          >
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export const VendorStatusSummary = ({
  vendorId,
  summaryData,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
}) => {
  /*
   * --------------------------------------------------------------
   * Loading state
   * --------------------------------------------------------------
   */

  if (isLoading) {
    return (
      <Grid
        container
        spacing={2.5}
      >
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={index}
            >
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  borderColor:
                    'divider',
                  boxShadow: 'none',
                }}
              >
                <CardContent
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems:
                      'center',
                    gap: 2,
                  }}
                >
                  <Skeleton
                    variant="rounded"
                    width={52}
                    height={52}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Skeleton
                      width="70%"
                      height={20}
                    />

                    <Skeleton
                      width="45%"
                      height={32}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>
    )
  }

  /*
   * --------------------------------------------------------------
   * Error state
   * --------------------------------------------------------------
   */

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
            >
              Retry
            </Button>
          ) : null
        }
        sx={{
          borderRadius: 2,
        }}
      >
        Unable to load vendor status
        information
        {error?.message
          ? `: ${error.message}`
          : '.'}
      </Alert>
    )
  }

  /*
   * --------------------------------------------------------------
   * Empty state
   * --------------------------------------------------------------
   */

  if (!summaryData) {
    return (
      <Alert
        severity="info"
        sx={{
          borderRadius: 2,
        }}
      >
        Vendor status information is
        currently unavailable.
      </Alert>
    )
  }

  /*
   * --------------------------------------------------------------
   * Normalize backend values
   * --------------------------------------------------------------
   */

  const activeContracts =
    normalizeNumber(
      summaryData.activeContracts
    )

  const totalOrders =
    normalizeNumber(
      summaryData.totalOrders
    )

  const pendingInvoices =
    normalizeNumber(
      summaryData.pendingInvoices
    )

  const outstandingBalance =
    normalizeNumber(
      summaryData.outstandingBalance
    )

  const currency =
    summaryData.currency ||
    'PKR'

  const rawComplianceScore =
    normalizeNumber(
      summaryData.complianceScore
    )

  const complianceScore =
    rawComplianceScore === null
      ? null
      : Math.min(
          Math.max(
            rawComplianceScore,
            0
          ),
          100
        )

  /*
   * --------------------------------------------------------------
   * Render
   * --------------------------------------------------------------
   */

  return (
    <Grid
      container
      spacing={2.5}
    >
      {/* -------------------------------------------------------- */}
      {/* Active Contracts */}
      {/* -------------------------------------------------------- */}

      <Grid
        item
        xs={12}
        sm={6}
        md={3}
      >
        <SummaryCard
          icon={<AssignmentIcon />}
          iconColor="primary.main"
          iconBackground="primary.50"
          label="Active Contracts"
          value={
            activeContracts === null
              ? EMPTY_VALUE
              : activeContracts
          }
        />
      </Grid>

      {/* -------------------------------------------------------- */}
      {/* Total Purchase Orders */}
      {/* -------------------------------------------------------- */}

      <Grid
        item
        xs={12}
        sm={6}
        md={3}
      >
        <SummaryCard
          icon={<ReceiptLongIcon />}
          iconColor="info.main"
          iconBackground="info.50"
          label="Total Purchase Orders"
          value={
            totalOrders === null
              ? EMPTY_VALUE
              : totalOrders
          }
        />
      </Grid>

      {/* -------------------------------------------------------- */}
      {/* Outstanding Balance */}
      {/* -------------------------------------------------------- */}

      <Grid
        item
        xs={12}
        sm={6}
        md={3}
      >
        <SummaryCard
          icon={
            <AccountBalanceWalletIcon />
          }
          iconColor="warning.main"
          iconBackground="warning.50"
          label="Outstanding Balance"
          value={formatCurrency(
            outstandingBalance,
            currency
          )}
          valueColor={
            outstandingBalance !== null
              ? 'warning.main'
              : 'text.primary'
          }
        />
      </Grid>

      {/* -------------------------------------------------------- */}
      {/* Compliance & Risk */}
      {/* -------------------------------------------------------- */}

      <Grid
        item
        xs={12}
        sm={6}
        md={3}
      >
        <Card
          variant="outlined"
          sx={{
            height: '100%',
            borderRadius: 2,
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: 1,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <VerifiedUserIcon
                  fontSize="small"
                  color="success"
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  Compliance Score
                </Typography>
              </Box>

              {getRiskChip(
                summaryData.riskLevel
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems:
                  'center',
                gap: 1.5,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  minWidth: 48,
                }}
              >
                {complianceScore ===
                null
                  ? EMPTY_VALUE
                  : `${complianceScore}%`}
              </Typography>

              <Box
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={
                    complianceScore ??
                    0
                  }
                  color={
                    complianceScore !==
                      null &&
                    complianceScore > 80
                      ? 'success'
                      : 'warning'
                  }
                  sx={{
                    height: 6,
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* -------------------------------------------------------- */}
      {/* Pending Invoices */}
      {/* -------------------------------------------------------- */}

      {pendingInvoices !== null && (
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            icon={
              <ReceiptLongIcon />
            }
            iconColor="error.main"
            iconBackground="error.50"
            label="Pending Invoices"
            value={pendingInvoices}
            valueColor={
              pendingInvoices > 0
                ? 'error.main'
                : 'success.main'
            }
          />
        </Grid>
      )}

      {/* Vendor ID is intentionally not rendered.
          It is used to identify the API resource. */}
      {!vendorId && (
        <Grid item xs={12}>
          <Alert severity="warning">
            Vendor ID is missing. Status
            information may be unavailable.
          </Alert>
        </Grid>
      )}
    </Grid>
  )
}

export default VendorStatusSummary