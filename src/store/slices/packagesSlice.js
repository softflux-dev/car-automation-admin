import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  packages: [],
  pagination: { total: 0, page: 1, limit: 10, total_pages: 1 },
  loading: {
    fetch: false,
    create: false,
    update: {},
    delete: {},
  },
  error: null,
};

const packagesSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {
    fetchPackagesStart(state) {
      state.loading.fetch = true;
      state.error = null;
    },
    fetchPackagesSuccess(state, action) {
      state.loading.fetch = false;
      state.packages = action.payload.packages;
      state.pagination = action.payload.pagination;
    },
    fetchPackagesFailure(state, action) {
      state.loading.fetch = false;
      state.error = action.payload ?? null;
    },

    createPackageStart(state) {
      state.loading.create = true;
    },
    createPackageSuccess(state, action) {
      state.loading.create = false;
      state.packages.unshift(action.payload);
      state.pagination.total += 1;
    },
    createPackageFailure(state) {
      state.loading.create = false;
    },

    updatePackageStart(state, action) {
      state.loading.update[action.payload] = true;
    },
    updatePackageSuccess(state, action) {
      const { id, pkg } = action.payload;
      state.loading.update[id] = false;
      const index = state.packages.findIndex((p) => p._id === id);
      if (index !== -1) state.packages[index] = pkg;
    },
    updatePackageFailure(state, action) {
      state.loading.update[action.payload] = false;
    },

    deletePackageStart(state, action) {
      state.loading.delete[action.payload] = true;
    },
    deletePackageSuccess(state, action) {
      const id = action.payload;
      state.loading.delete[id] = false;
      state.packages = state.packages.filter((p) => p._id !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    deletePackageFailure(state, action) {
      state.loading.delete[action.payload] = false;
    },
  },
});

export const {
  fetchPackagesStart,
  fetchPackagesSuccess,
  fetchPackagesFailure,
  createPackageStart,
  createPackageSuccess,
  createPackageFailure,
  updatePackageStart,
  updatePackageSuccess,
  updatePackageFailure,
  deletePackageStart,
  deletePackageSuccess,
  deletePackageFailure,
} = packagesSlice.actions;

export default packagesSlice.reducer;
