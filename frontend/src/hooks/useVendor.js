import { useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/api'

export const useVendor = () => {
  const queryClient = useQueryClient()

  const {
    data: vendors = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/vendors')
      return response.data?.data ?? response.data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  const fetchVendors = async () => {
    return queryClient.invalidateQueries({ queryKey: ['vendors'] })
  }

  const getVendorById = async (id) => {
    const response = await apiClient.get(`/vendors/${id}`)
    return response.data?.data ?? response.data
  }

  const createVendor = async (payload) => {
    const body = {
      companyName: payload.companyName || payload.name || '',
      companyInfo: {
        registrationNumber: payload.registrationNumber || payload.regNumber || 'N/A',
        website: payload.website || '',
        industry: payload.industry || '',
        address: {
          street: payload.street || payload.address || 'N/A',
          city: payload.city || '',
          state: payload.state || '',
          country: payload.country || 'N/A',
          postalCode: payload.postalCode || '',
        },
        contactPerson: {
          name: payload.contactPerson || payload.contactName || '',
          email: payload.email || '',
          phone: payload.phone || '',
          designation: payload.contactDesignation || '',
        },
      },
      taxInfo: {
        taxId: payload.taxId || '',
        vatNumber: payload.vatNumber || '',
        taxDocumentUrl: payload.taxDocumentUrl || '',
      },
      categories: Array.isArray(payload.categories)
        ? payload.categories
        : payload.category
        ? [payload.category]
        : [],
      paymentTerms: payload.paymentTerms,
      notes: payload.notes,
    }

    const response = await apiClient.post('/vendors', body)
    await queryClient.invalidateQueries({ queryKey: ['vendors'] })
    return response.data
  }

  const updateVendor = async (id, payload) => {
    const response = await apiClient.put(`/vendors/${id}`, payload)
    await queryClient.invalidateQueries({ queryKey: ['vendors'] })
    return response.data
  }

  const deleteVendor = async (id) => {
    const response = await apiClient.delete(`/vendors/${id}`)
    await queryClient.invalidateQueries({ queryKey: ['vendors'] })
    return response.data
  }

  return {
    vendors,
    fetchVendors,
    getVendorById,
    createVendor,
    updateVendor,
    deleteVendor,
    isLoading,
    isError,
    error,
  }
}

export default useVendor
