import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  services: [],
  pagination: { total: 0, page: 1, limit: 10, total_pages: 1 },
  loading: {
    fetch: false,
    create: false,
    update: {},
    delete: {},
  },
  error: null,
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    fetchServicesStart(state) {
      state.loading.fetch = true;
      state.error = null;
    },
    fetchServicesSuccess(state, action) {
      state.loading.fetch = false;
      state.services = action.payload.services;
      state.pagination = action.payload.pagination;
    },
    fetchServicesFailure(state, action) {
      state.loading.fetch = false;
      state.error = action.payload ?? null;
    },

    createServiceStart(state) {
      state.loading.create = true;
    },
    createServiceSuccess(state, action) {
      state.loading.create = false;
      state.services.unshift(action.payload);
      state.pagination.total += 1;
    },
    createServiceFailure(state) {
      state.loading.create = false;
    },

    updateServiceStart(state, action) {
      state.loading.update[action.payload] = true;
    },
    updateServiceSuccess(state, action) {
      const { id, service } = action.payload;
      state.loading.update[id] = false;
      const index = state.services.findIndex((s) => s._id === id);
      if (index !== -1) state.services[index] = service;
    },
    updateServiceFailure(state, action) {
      state.loading.update[action.payload] = false;
    },

    deleteServiceStart(state, action) {
      state.loading.delete[action.payload] = true;
    },
    deleteServiceSuccess(state, action) {
      const id = action.payload;
      state.loading.delete[id] = false;
      state.services = state.services.filter((s) => s._id !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    deleteServiceFailure(state, action) {
      state.loading.delete[action.payload] = false;
    },
  },
});

export const {
  fetchServicesStart,
  fetchServicesSuccess,
  fetchServicesFailure,
  createServiceStart,
  createServiceSuccess,
  createServiceFailure,
  updateServiceStart,
  updateServiceSuccess,
  updateServiceFailure,
  deleteServiceStart,
  deleteServiceSuccess,
  deleteServiceFailure,
} = servicesSlice.actions;

export default servicesSlice.reducer;
