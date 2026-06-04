import Api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const getAllInquiries = (params) =>
  Api.get(ENDPOINTS.inquiries.getAllInquiries, { params });

export const getInquiryById = (id) =>
  Api.get(ENDPOINTS.inquiries.getInquiryById.replace(":id", id));

export const deleteInquiry = (id) =>
  Api.delete(ENDPOINTS.inquiries.deleteInquiry.replace(":id", id));
