import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  emailNotification: false,
  loading: {
    fetch: false,
    profile: false,
    password: false,
    notifications: false,
  },
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    fetchSettingsStart(state) {
      state.loading.fetch = true;
      state.error = null;
    },
    fetchSettingsSuccess(state, action) {
      state.loading.fetch = false;
      state.emailNotification = action.payload.emailNotification ?? false;
    },
    fetchSettingsFailure(state) {
      state.loading.fetch = false;
    },

    updateProfileStart(state) {
      state.loading.profile = true;
    },
    updateProfileSuccess(state) {
      state.loading.profile = false;
    },
    updateProfileFailure(state) {
      state.loading.profile = false;
    },

    changePasswordStart(state) {
      state.loading.password = true;
    },
    changePasswordSuccess(state) {
      state.loading.password = false;
    },
    changePasswordFailure(state) {
      state.loading.password = false;
    },

    toggleNotificationsStart(state) {
      state.loading.notifications = true;
    },
    toggleNotificationsSuccess(state, action) {
      state.loading.notifications = false;
      state.emailNotification = action.payload;
    },
    toggleNotificationsFailure(state) {
      state.loading.notifications = false;
    },
  },
});

export const {
  fetchSettingsStart, fetchSettingsSuccess, fetchSettingsFailure,
  updateProfileStart, updateProfileSuccess, updateProfileFailure,
  changePasswordStart, changePasswordSuccess, changePasswordFailure,
  toggleNotificationsStart, toggleNotificationsSuccess, toggleNotificationsFailure,
} = settingsSlice.actions;

export default settingsSlice.reducer;
