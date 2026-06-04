import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  loading: {
    fetch: false,
    markRead: {}, // { [id]: true }
  },
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    fetchNotificationsStart(state) {
      state.loading.fetch = true;
      state.error = null;
    },
    fetchNotificationsSuccess(state, action) {
      state.loading.fetch = false;
      state.notifications = action.payload;
    },
    fetchNotificationsFailure(state) {
      state.loading.fetch = false;
    },

    markReadStart(state, action) {
      state.loading.markRead[action.payload] = true;
    },
    markReadSuccess(state, action) {
      const id = action.payload;
      state.loading.markRead[id] = false;
      const n = state.notifications.find((n) => n._id === id);
      if (n) n.isRead = true;
    },
    markReadFailure(state, action) {
      state.loading.markRead[action.payload] = false;
    },

    markAllReadLocally(state) {
      state.notifications.forEach((n) => { n.isRead = true; });
    },
  },
});

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markReadStart,
  markReadSuccess,
  markReadFailure,
  markAllReadLocally,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
