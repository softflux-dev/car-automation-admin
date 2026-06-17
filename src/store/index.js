import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import calendarReducer from '../modules/calendar/redux/calendarSlice';
import authReducer from "./slices/authSlice";
import servicesReducer from "./slices/servicesSlice";
import certificatesReducer from "./slices/certificatesSlice";
import inquiriesReducer from "./slices/inquiriesSlice";
import portfolioReducer from "./slices/portfolioSlice";
import packagesReducer from "./slices/packagesSlice";
import settingsReducer from "./slices/settingsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import uiReducer from "./slices/uiSlice"

// Custom storage wrapper to avoid Vite/Rollup CJS import issues with redux-persist
const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve(value);
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["accessToken", "user", "isAuthenticated"],
};

const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  ui: uiReducer,
  services: servicesReducer,
  certificates: certificatesReducer,
  inquiries: inquiriesReducer,
  portfolio: portfolioReducer,
  packages: packagesReducer,
  settings: settingsReducer,
  calendar: calendarReducer,
  notifications: notificationsReducer,
}); 

const rootReducer = (state, action) => {
  if (action.type === "auth/clearAuth") {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/FLUSH",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
