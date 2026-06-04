import Api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const getAllServices = (params) =>
  Api.get(ENDPOINTS.services.getAllServices, { params });

export const getServicesDropdown = () =>
  Api.get(ENDPOINTS.services.getServicesDropdown);

export const getServiceById = (id) =>
  Api.get(ENDPOINTS.services.getServiceById.replace(":id", id));

export const createService = (payload) =>
  Api.post(ENDPOINTS.services.createService, payload);

export const updateService = (id, payload) =>
  Api.put(ENDPOINTS.services.updateService.replace(":id", id), payload);

export const deleteService = (id) =>
  Api.delete(ENDPOINTS.services.deleteService.replace(":id", id));
