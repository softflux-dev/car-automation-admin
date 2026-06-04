import Api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const getAllCertificates = (params) =>
  Api.get(ENDPOINTS.certificates.getAllCertificates, { params });

export const getCertificateById = (id) =>
  Api.get(ENDPOINTS.certificates.getCertificateById.replace(":id", id));

export const createCertificate = (payload) =>
  Api.post(ENDPOINTS.certificates.createCertificate, payload);

export const updateCertificate = (id, payload) =>
  Api.put(ENDPOINTS.certificates.updateCertificate.replace(":id", id), payload);

export const deleteCertificate = (id) =>
  Api.delete(ENDPOINTS.certificates.deleteCertificate.replace(":id", id));
