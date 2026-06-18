import { createSlice } from "@reduxjs/toolkit";
import { fetchAllEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "./calendarThunks";

const initialState = {
  events: [],
  eventsLoading: false,
  creatingLoading: false,
  updatingLoading: false,
  deletingLoading: false,
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
        state.eventsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.eventsLoading = false;
        state.error = action.error?.message || "Fout bij het laden van evenementen";
      })
      .addCase(createCalendarEvent.pending, (state) => {
        state.creatingLoading = true;
      })
      .addCase(createCalendarEvent.fulfilled, (state) => {
        state.creatingLoading = false;
      })
      .addCase(createCalendarEvent.rejected, (state, action) => {
        state.creatingLoading = false;
        state.error = action.payload?.message || "Fout bij het aanmaken van evenement";
      })
      .addCase(updateCalendarEvent.pending, (state) => {
        state.updatingLoading = true;
      })
      .addCase(updateCalendarEvent.fulfilled, (state) => {
        state.updatingLoading = false;
      })
      .addCase(updateCalendarEvent.rejected, (state, action) => {
        state.updatingLoading = false;
        state.error = action.payload?.message || "Fout bij het bijwerken van evenement";
      })
      .addCase(deleteCalendarEvent.pending, (state) => {
        state.deletingLoading = true;
      })
      .addCase(deleteCalendarEvent.fulfilled, (state) => {
        state.deletingLoading = false;
      })
      .addCase(deleteCalendarEvent.rejected, (state, action) => {
        state.deletingLoading = false;
        state.error = action.payload?.message || "Fout bij het verwijderen van evenement";
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
