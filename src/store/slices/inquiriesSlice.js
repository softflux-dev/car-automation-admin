import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  inquiries: [],
  pagination: { total: 0, page: 1, limit: 10, total_pages: 1 },
  servicesDropdown: [],
  loading: {
    fetch: false,
    delete: {},
    addingToCalendar: {},
  },
  error: null,
};

const inquiriesSlice = createSlice({
  name: "inquiries",
  initialState,
  reducers: {
    fetchInquiriesStart(state) {
      state.loading.fetch = true;
      state.error = null;
    },
    fetchInquiriesSuccess(state, action) {
      state.loading.fetch = false;
      state.inquiries = action.payload.inquiries;
      state.pagination = action.payload.pagination;
    },
    fetchInquiriesFailure(state, action) {
      state.loading.fetch = false;
      state.error = action.payload ?? null;
    },

    setServicesDropdown(state, action) {
      state.servicesDropdown = action.payload;
    },

    deleteInquiryStart(state, action) {
      state.loading.delete[action.payload] = true;
    },
    deleteInquirySuccess(state, action) {
      const id = action.payload;
      state.loading.delete[id] = false;
      state.inquiries = state.inquiries.filter((i) => i._id !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    deleteInquiryFailure(state, action) {
      state.loading.delete[action.payload] = false;
    },

    setInquiryCalendarStatus(state, action) {
      const { inquiryId, isAddedToCalendar } = action.payload;
      const idx = state.inquiries.findIndex((i) => i._id === inquiryId);
      if (idx !== -1) {
        state.inquiries[idx].isAddedToCalendar = isAddedToCalendar;
      }
    },
    setAddingToCalendarLoading(state, action) {
      const { inquiryId, loading } = action.payload;
      state.loading.addingToCalendar[inquiryId] = loading;
    },
  },
});

export const {
  fetchInquiriesStart,
  fetchInquiriesSuccess,
  fetchInquiriesFailure,
  setServicesDropdown,
  deleteInquiryStart,
  deleteInquirySuccess,
  deleteInquiryFailure,
  setInquiryCalendarStatus,
  setAddingToCalendarLoading,
} = inquiriesSlice.actions;

export default inquiriesSlice.reducer;
