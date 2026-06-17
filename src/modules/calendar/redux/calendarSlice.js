

import { createSlice } from "@reduxjs/toolkit";
import { fetchAllEvents, createCalendarEvent } from "./calendarThunks";

const initialState = {
  events: [],
  loading: false,
  error: null,
  selectedEvent: null,
  isCreateModalOpen: false,
  isEventModalOpen: false,
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setSelectedEvent(state, action) {
      state.selectedEvent = action.payload;
    },
    openCreateModal(state) {
      state.isCreateModalOpen = true;
    },
    closeCreateModal(state) {
      state.isCreateModalOpen = false;
    },
    openEventModal(state) {
      state.isEventModalOpen = true;
    },
    closeEventModal(state) {
      state.isEventModalOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message;
      })
      .addCase(createCalendarEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCalendarEvent.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCalendarEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message;
      });
  },
});

export const {
  setSelectedEvent,
  openCreateModal,
  closeCreateModal,
  openEventModal,
  closeEventModal,
} = calendarSlice.actions;

export default calendarSlice.reducer;