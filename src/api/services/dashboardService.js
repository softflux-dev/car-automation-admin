import Api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const getDashboardStats = () =>
  Api.get(ENDPOINTS.dashboard.getStats);

export const getRecentInquiries = (params, config) =>
  Api.get(ENDPOINTS.dashboard.getRecentInquiries, { params, ...config });
