import { api } from './index';

export const customerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: '/customers',
        params: { page, limit, search },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.customers.map(({ id }) => ({ type: 'Customers', id })),
              { type: 'Customers', id: 'LIST' },
            ]
          : [{ type: 'Customers', id: 'LIST' }],
    }),
    getCustomerById: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customers', id }],
    }),
    createCustomer: builder.mutation({
      query: (customerData) => ({
        url: '/customers',
        method: 'POST',
        body: customerData,
      }),
      invalidatesTags: [{ type: 'Customers', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customers', id },
        { type: 'Customers', id: 'LIST' },
      ],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Customers', id },
        { type: 'Customers', id: 'LIST' },
      ],
    }),
    uploadDocument: builder.mutation({
      query: ({ customerId, file }) => {
        const formData = new FormData();
        formData.append('document', file);
        
        return {
          url: `/customers/${customerId}/documents`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Customers', id: customerId },
      ],
    }),
    deleteDocument: builder.mutation({
      query: (documentId) => ({
        url: `/customers/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, documentId) => [
        { type: 'Customers', id: 'DOCUMENT' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = customerApi;
