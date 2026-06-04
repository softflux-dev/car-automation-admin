import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  pagination: { total: 0, page: 1, limit: 10, total_pages: 1 },
  loading: {
    fetch: false,
    create: false,
    update: {},
    delete: {},
  },
  error: null,
};

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    fetchProjectsStart(state) {
      state.loading.fetch = true;
      state.error = null;
    },
    fetchProjectsSuccess(state, action) {
      state.loading.fetch = false;
      state.projects = action.payload.portfolios;
      state.pagination = action.payload.pagination;
    },
    fetchProjectsFailure(state, action) {
      state.loading.fetch = false;
      state.error = action.payload ?? null;
    },

    createProjectStart(state) {
      state.loading.create = true;
    },
    createProjectSuccess(state, action) {
      state.loading.create = false;
      state.projects.unshift(action.payload);
      state.pagination.total += 1;
    },
    createProjectFailure(state) {
      state.loading.create = false;
    },

    updateProjectStart(state, action) {
      state.loading.update[action.payload] = true;
    },
    updateProjectSuccess(state, action) {
      const { id, project } = action.payload;
      state.loading.update[id] = false;
      const index = state.projects.findIndex((p) => p._id === id);
      if (index !== -1) state.projects[index] = project;
    },
    updateProjectFailure(state, action) {
      state.loading.update[action.payload] = false;
    },

    deleteProjectStart(state, action) {
      state.loading.delete[action.payload] = true;
    },
    deleteProjectSuccess(state, action) {
      const id = action.payload;
      state.loading.delete[id] = false;
      state.projects = state.projects.filter((p) => p._id !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    deleteProjectFailure(state, action) {
      state.loading.delete[action.payload] = false;
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  updateProjectStart,
  updateProjectSuccess,
  updateProjectFailure,
  deleteProjectStart,
  deleteProjectSuccess,
  deleteProjectFailure,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
