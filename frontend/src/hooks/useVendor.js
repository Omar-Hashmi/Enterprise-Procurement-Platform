import { useCallback } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import apiClient from '../lib/api'
import { demoVendors } from '../data/demoData'

/**
 * Normalize backend vendor status values into
 * the consistent values used throughout the frontend.
 */
const normalizeStatus = (status) => {
  if (!status) return 'PENDING'

  const normalized = String(status)
    .toLowerCase()
    .replace(/[-\s]/g, '_')

  const statusMap = {
    pending: 'PENDING',
    active: 'ACTIVE',
    inactive: 'INACTIVE',
    suspended: 'SUSPENDED',
    blacklisted: 'BLACKLISTED',
    black_listed: 'BLACKLISTED',
  }

  return (
    statusMap[normalized] ||
    String(status).toUpperCase()
  )
}

/**
 * Normalize a vendor returned by the backend
 * into the structure expected by the frontend.
 */
const normalizeVendor = (vendor) => {
  if (!vendor) return null

  const companyInfo =
    vendor.companyInfo || {}

  const contactPerson =
    companyInfo.contactPerson || {}

  const address =
    companyInfo.address || {}

  const taxInfo =
    vendor.taxInfo || {}

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

  const bankAccounts = Array.isArray(
    vendor.bankAccounts
  )
    ? vendor.bankAccounts.map(
        (account) => ({
          ...account,

          // Support both MongoDB and frontend IDs.
          id:
            account?._id ||
            account?.id,

          bankName:
            account?.bankName || '',

          accountTitle:
            account?.accountTitle || '',

          accountNumber:
            account?.accountNumber || '',

          iban:
            account?.iban || '',

          swiftCode:
            account?.swiftCode || '',

          branchCode:
            account?.branchCode || '',

          isPrimary:
            Boolean(
              account?.isPrimary
            ),
        })
      )
    : []

  return {
    ...vendor,

    // ----------------------------------------------------------
    // IDs
    // ----------------------------------------------------------

    id:
      vendor._id ||
      vendor.id,

    // ----------------------------------------------------------
    // Company information
    // ----------------------------------------------------------

    name:
      vendor.companyName ||
      vendor.name ||
      '',

    companyName:
      vendor.companyName ||
      vendor.name ||
      '',

    registrationNumber:
      companyInfo.registrationNumber ||
      vendor.registrationNumber ||
      '',

    website:
      companyInfo.website ||
      vendor.website ||
      '',

    industry:
      companyInfo.industry ||
      vendor.industry ||
      '',

    // ----------------------------------------------------------
    // Contact information
    // ----------------------------------------------------------

    contactPerson:
      contactPerson.name ||
      vendor.contactPerson ||
      vendor.contactName ||
      '',

    contactName:
      contactPerson.name ||
      vendor.contactPerson ||
      vendor.contactName ||
      '',

    email:
      contactPerson.email ||
      vendor.email ||
      '',

    phone:
      contactPerson.phone ||
      vendor.phone ||
      '',

    contactDesignation:
      contactPerson.designation ||
      vendor.contactDesignation ||
      '',

    // ----------------------------------------------------------
    // Address
    // ----------------------------------------------------------

    address:
      address.street ||
      vendor.address ||
      '',

    street:
      address.street ||
      vendor.street ||
      '',

    city:
      address.city ||
      vendor.city ||
      '',

    state:
      address.state ||
      vendor.state ||
      '',

    country:
      address.country ||
      vendor.country ||
      '',

    postalCode:
      address.postalCode ||
      vendor.postalCode ||
      '',

    // ----------------------------------------------------------
    // Tax information
    // ----------------------------------------------------------

    taxId:
      taxInfo.taxId ||
      vendor.taxId ||
      '',

    vatNumber:
      taxInfo.vatNumber ||
      vendor.vatNumber ||
      '',

    taxDocumentUrl:
      taxInfo.taxDocumentUrl ||
      vendor.taxDocumentUrl ||
      '',

    // ----------------------------------------------------------
    // Categories
    // ----------------------------------------------------------

    categories,

    category:
      categories[0] || '',

    // ----------------------------------------------------------
    // Rating
    // ----------------------------------------------------------

    rating:
      vendor.averageRating ??
      vendor.rating ??
      0,

    averageRating:
      vendor.averageRating ??
      vendor.rating ??
      0,

    // ----------------------------------------------------------
    // Status
    // ----------------------------------------------------------

    status: normalizeStatus(
      vendor.status
    ),

    // ----------------------------------------------------------
    // Preserve backend objects
    // ----------------------------------------------------------

    companyInfo,

    taxInfo,

    bankAccounts,

    paymentTerms:
      vendor.paymentTerms || '',

    notes:
      vendor.notes || '',
  }
}

/**
 * Extract vendor records from different
 * possible API response structures.
 */
const extractVendors = (
  responseData
) => {
  const data =
    responseData?.data ??
    responseData

  if (Array.isArray(data)) {
    return data
  }

  if (
    Array.isArray(data?.vendors)
  ) {
    return data.vendors
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data
  }

  return []
}

/**
 * Extract pagination information.
 */
const extractPagination = (
  responseData
) => {
  const data =
    responseData?.data ??
    responseData

  const pagination =
    data?.pagination ||
    responseData?.pagination

  if (!pagination) {
    return {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    }
  }

  return {
    page:
      Number(pagination.page) ||
      1,

    limit:
      Number(pagination.limit) ||
      20,

    total:
      Number(pagination.total) ||
      0,

    totalPages:
      Number(
        pagination.totalPages
      ) || 0,
  }
}

/**
 * Vendor hook.
 *
 * Current backend integration:
 *
 * GET    /vendors
 * GET    /vendors/:id
 * POST   /vendors
 * PATCH  /vendors/:id
 * DELETE /vendors/:id
 *
 * Bank accounts:
 *
 * POST /vendors/:id/bank-accounts
 *
 * Bank accounts are returned as part of:
 *
 * GET /vendors/:id
 */
export const useVendor = ({
  page = 1,
  limit = 20,
  search = '',
  status = '',
  category = '',
  enabled = true,
} = {}) => {
  const queryClient =
    useQueryClient()

  // ==========================================================
  // Vendors list
  // ==========================================================

  const vendorQuery = useQuery({
    queryKey: [
      'vendors',
      {
        page,
        limit,
        search,
        status,
        category,
      },
    ],

    queryFn: async () => {
      const params = {
        page,
        limit,
      }

      if (search?.trim()) {
        params.search =
          search.trim()
      }

      if (status) {
        params.status =
          String(status).toLowerCase()
      }

      if (category) {
        params.category =
          category
      }

      const response =
        await apiClient.get(
          '/vendors',
          { params }
        )

      const records = extractVendors(response.data)
      const vendors = (records.length ? records : demoVendors).map(normalizeVendor)

      const pagination = records.length ? extractPagination(response.data) : { page: 1, limit, total: demoVendors.length, totalPages: 1 }

      return {
        vendors,
        pagination,
      }
    },

    staleTime:
      5 * 60 * 1000,

    enabled,

    // Keep existing data visible while
    // another page/filter is loading.
    placeholderData:
      (previousData) =>
        previousData,
  })

  // ==========================================================
  // Create vendor
  // ==========================================================

  const createVendorMutation =
    useMutation({
      mutationFn:
        async (payload) => {
          const body = {
            companyName:
              payload.companyName ||
              payload.name ||
              '',

            companyInfo: {
              registrationNumber:
                payload.registrationNumber ||
                payload.regNumber ||
                'N/A',

              website:
                payload.website ||
                '',

              industry:
                payload.industry ||
                '',

              address: {
                street:
                  payload.street ||
                  payload.address ||
                  'N/A',

                city:
                  payload.city ||
                  '',

                state:
                  payload.state ||
                  '',

                country:
                  payload.country ||
                  'N/A',

                postalCode:
                  payload.postalCode ||
                  '',
              },

              contactPerson: {
                name:
                  payload.contactPerson ||
                  payload.contactName ||
                  '',

                email:
                  payload.email ||
                  '',

                phone:
                  payload.phone ||
                  '',

                designation:
                  payload.contactDesignation ||
                  '',
              },
            },

            taxInfo: {
              taxId:
                payload.taxId ||
                '',

              vatNumber:
                payload.vatNumber ||
                '',

              taxDocumentUrl:
                payload.taxDocumentUrl ||
                '',
            },

            categories:
              Array.isArray(
                payload.categories
              )
                ? payload.categories
                : payload.category
                  ? [payload.category]
                  : [],

            paymentTerms:
              payload.paymentTerms,

            notes:
              payload.notes,
          }

          const response =
            await apiClient.post(
              '/vendors',
              body
            )

          return normalizeVendor(
            response.data?.data ??
              response.data
          )
        },

      onSuccess:
        async (createdVendor) => {
          await queryClient.invalidateQueries(
            {
              queryKey: [
                'vendors',
              ],
            }
          )

          if (
            createdVendor?.id
          ) {
            queryClient.setQueryData(
              [
                'vendor',
                createdVendor.id,
              ],
              createdVendor
            )
          }
        },
    })

  // ==========================================================
  // Update vendor
  // ==========================================================

  const updateVendorMutation =
    useMutation({
      mutationFn:
        async ({
          id,
          payload,
        }) => {
          if (!id) {
            throw new Error(
              'Vendor ID is required'
            )
          }

          const response =
            await apiClient.patch(
              `/vendors/${id}`,
              payload
            )

          return normalizeVendor(
            response.data?.data ??
              response.data
          )
        },

      onSuccess:
        async (
          updatedVendor,
          variables
        ) => {
          await queryClient.invalidateQueries(
            {
              queryKey: [
                'vendors',
              ],
            }
          )

          if (
            variables?.id
          ) {
            queryClient.setQueryData(
              [
                'vendor',
                variables.id,
              ],
              updatedVendor
            )
          }
        },
    })

  // ==========================================================
  // Delete vendor
  // ==========================================================

  const deleteVendorMutation =
    useMutation({
      mutationFn:
        async (id) => {
          if (!id) {
            throw new Error(
              'Vendor ID is required'
            )
          }

          const response =
            await apiClient.delete(
              `/vendors/${id}`
            )

          return response.data
        },

      onSuccess:
        async (_, id) => {
          await queryClient.invalidateQueries(
            {
              queryKey: [
                'vendors',
              ],
            }
          )

          if (id) {
            queryClient.removeQueries(
              {
                queryKey: [
                  'vendor',
                  id,
                ],
              }
            )
          }
        },
    })

  // ==========================================================
  // Get single vendor
  // ==========================================================

  const getVendorById =
    useCallback(
      async (id) => {
        if (!id) {
          throw new Error(
            'Vendor ID is required'
          )
        }

        const response =
          await apiClient.get(
            `/vendors/${id}`
          )

        const vendor =
          normalizeVendor(
            response.data?.data ??
              response.data
          )

        /*
         * Store the normalized vendor in
         * React Query so other components
         * can use the same data.
         */
        if (vendor?.id) {
          queryClient.setQueryData(
            [
              'vendor',
              vendor.id,
            ],
            vendor
          )
        }

        return vendor
      },
      [queryClient]
    )

  // ==========================================================
  // Add bank account
  // ==========================================================

  const addBankAccountMutation =
    useMutation({
      mutationFn:
        async ({
          vendorId,
          payload,
        }) => {
          if (!vendorId) {
            throw new Error(
              'Vendor ID is required'
            )
          }

          const body = {
            bankName:
              payload.bankName?.trim() ||
              '',

            accountTitle:
              payload.accountTitle?.trim() ||
              '',

            accountNumber:
              payload.accountNumber?.trim() ||
              '',

            /*
             * Remove spaces and normalize
             * IBAN to uppercase.
             */
            iban:
              payload.iban?.trim()
                ? payload.iban
                    .replace(
                      /\s/g,
                      ''
                    )
                    .toUpperCase()
                : undefined,

            swiftCode:
              payload.swiftCode?.trim()
                ? payload.swiftCode
                    .trim()
                    .toUpperCase()
                : undefined,

            branchCode:
              payload.branchCode?.trim() ||
              undefined,

            isPrimary:
              Boolean(
                payload.isPrimary
              ),
          }

          const response =
            await apiClient.post(
              `/vendors/${vendorId}/bank-accounts`,
              body
            )

          return response.data
        },

      onSuccess:
        async (_, variables) => {
          const vendorId =
            variables?.vendorId

          /*
           * The bank account is stored inside
           * the vendor document, so invalidate
           * the vendor query after creation.
           */
          if (vendorId) {
            queryClient.removeQueries(
              {
                queryKey: [
                  'vendor',
                  vendorId,
                ],
              }
            )
          }

          await queryClient.invalidateQueries(
            {
              queryKey: [
                'vendors',
              ],
            }
          )
        },
    })

  const updateBankAccount = useCallback((vendorId, accountId, payload) =>
    apiClient.patch(`/vendors/${vendorId}/bank-accounts/${accountId}`, payload), []);
  const deleteBankAccount = useCallback((vendorId, accountId) =>
    apiClient.delete(`/vendors/${vendorId}/bank-accounts/${accountId}`), []);
  const setPrimaryBankAccount = useCallback((vendorId, accountId) =>
    apiClient.patch(`/vendors/${vendorId}/bank-accounts/${accountId}/primary`), []);

  // ==========================================================
  // Public API
  // ==========================================================

  return {
    // --------------------------------------------------------
    // Vendor list
    // --------------------------------------------------------

    vendors:
      vendorQuery.data
        ?.vendors || [],

    pagination:
      vendorQuery.data
        ?.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },

    // --------------------------------------------------------
    // Query state
    // --------------------------------------------------------

    isLoading:
      vendorQuery.isLoading ||
      createVendorMutation.isPending ||
      updateVendorMutation.isPending ||
      deleteVendorMutation.isPending ||
      addBankAccountMutation.isPending,

    isFetching:
      vendorQuery.isFetching,

    isError:
      vendorQuery.isError,

    error:
      vendorQuery.error,

    // --------------------------------------------------------
    // Refetch
    // --------------------------------------------------------

    fetchVendors:
      vendorQuery.refetch,

    // --------------------------------------------------------
    // Single vendor
    // --------------------------------------------------------

    getVendorById,

    // --------------------------------------------------------
    // Vendor mutations
    // --------------------------------------------------------

    createVendor:
      createVendorMutation.mutateAsync,

    updateVendor:
      (id, payload) =>
        updateVendorMutation.mutateAsync(
          {
            id,
            payload,
          }
        ),

    deleteVendor:
      deleteVendorMutation.mutateAsync,

    // --------------------------------------------------------
    // Bank account
    // --------------------------------------------------------

    addBankAccount:
      (
        vendorId,
        payload
      ) =>
        addBankAccountMutation.mutateAsync(
          {
            vendorId,
            payload,
          }
        ),
    updateBankAccount,
    deleteBankAccount,
    setPrimaryBankAccount,

    // --------------------------------------------------------
    // Individual mutation states
    // --------------------------------------------------------

    isCreating:
      createVendorMutation.isPending,

    isUpdating:
      updateVendorMutation.isPending,

    isDeleting:
      deleteVendorMutation.isPending,

    isAddingBankAccount:
      addBankAccountMutation.isPending,

    // --------------------------------------------------------
    // Mutation errors
    // --------------------------------------------------------

    createError:
      createVendorMutation.error,

    updateError:
      updateVendorMutation.error,

    deleteError:
      deleteVendorMutation.error,

    addBankAccountError:
      addBankAccountMutation.error,
  }
}

export default useVendor
