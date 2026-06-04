import Api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const getAllPackages = (params, config) =>
  Api.get(ENDPOINTS.packages.getAllPackages, { params, ...config });

export const getPackageById = (id) =>
  Api.get(ENDPOINTS.packages.getPackageById.replace(":id", id));

export const createPackage = (payload) =>
  Api.post(ENDPOINTS.packages.createPackage, payload);

export const updatePackage = (id, payload) =>
  Api.put(ENDPOINTS.packages.updatePackage.replace(":id", id), payload);

export const deletePackage = (id) =>
  Api.delete(ENDPOINTS.packages.deletePackage.replace(":id", id));
