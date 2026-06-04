import Api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const getAdminSettings = () =>
  Api.get(ENDPOINTS.settings.getAdminSettings);

export const updateProfile = (payload) =>
  Api.put(ENDPOINTS.settings.updateProfile, payload);

export const changePassword = (payload) =>
  Api.put(ENDPOINTS.settings.changePassword, payload);

export const toggleEmailNotifications = (payload) =>
  Api.put(ENDPOINTS.settings.toggleEmailNotifications, payload);
