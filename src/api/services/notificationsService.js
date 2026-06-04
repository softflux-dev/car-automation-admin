import Api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const fetchNotifications = (config) =>
  Api.get(ENDPOINTS.notifications.getAdminNotifications, config);

export const markNotificationRead = (id) =>
  Api.put(ENDPOINTS.notifications.markAsRead.replace(":id", id));
