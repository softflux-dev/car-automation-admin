import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  certificates: [],
  pagination: { total: 0, page: 1, limit: 10, total_pages: 1 },
  loading: {
    fetch: false,
    create: false,
    update: {},
    delete: {},
  },
  error: null,
};

const certificatesSlice = createSlice({
  name: "certificates",
  initialState,
  reducers: {
    fetchCertificatesStart(state) {
      state.loading.fetch = true;
      state.error = null;
    },
    fetchCertificatesSuccess(state, action) {
      state.loading.fetch = false;
      state.certificates = action.payload.certificates;
      state.pagination = action.payload.pagination;
    },
    fetchCertificatesFailure(state, action) {
      state.loading.fetch = false;
      state.error = action.payload ?? null;
    },

    createCertificateStart(state) {
      state.loading.create = true;
    },
    createCertificateSuccess(state, action) {
      state.loading.create = false;
      state.certificates.unshift(action.payload);
      state.pagination.total += 1;
    },
    createCertificateFailure(state) {
      state.loading.create = false;
    },

    updateCertificateStart(state, action) {
      state.loading.update[action.payload] = true;
    },
    updateCertificateSuccess(state, action) {
      const { id, certificate } = action.payload;
      state.loading.update[id] = false;
      const index = state.certificates.findIndex((c) => c._id === id);
      if (index !== -1) state.certificates[index] = certificate;
    },
    updateCertificateFailure(state, action) {
      state.loading.update[action.payload] = false;
    },

    deleteCertificateStart(state, action) {
      state.loading.delete[action.payload] = true;
    },
    deleteCertificateSuccess(state, action) {
      const id = action.payload;
      state.loading.delete[id] = false;
      state.certificates = state.certificates.filter((c) => c._id !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    deleteCertificateFailure(state, action) {
      state.loading.delete[action.payload] = false;
    },
  },
});

export const {
  fetchCertificatesStart,
  fetchCertificatesSuccess,
  fetchCertificatesFailure,
  createCertificateStart,
  createCertificateSuccess,
  createCertificateFailure,
  updateCertificateStart,
  updateCertificateSuccess,
  updateCertificateFailure,
  deleteCertificateStart,
  deleteCertificateSuccess,
  deleteCertificateFailure,
} = certificatesSlice.actions;

export default certificatesSlice.reducer;
