import { get } from "react-hook-form";

export const apiHeaders = {
  contentType: "Content-Type",
  application_json: "application/json",
  multipart_data: "multipart/form-data",
  language: "LANG",
  authorization: "Authorization",
};

export const ENDPOINTS = {
  auth: {
    login: "admin/login",
    forgotPassword: "admin/forgot-password",
    resetPassword: "admin/reset-password",
    verifyOtp: "admin/verify-reset-otp",
    resendOtp: "admin/resend-otp",
  },

  // dashboard: {
  //   getStats: "admin/dashboard/stats",
  // },
  services: {
    getAllServices: "admin/services",
    getServiceById: "admin/services/:id",
    getServicesDropdown: "admin/services/dropdown",
    createService: "admin/services/create",
    updateService: "admin/services/:id",
    deleteService: "admin/services/:id",
  },

  inquiries: {
    getAllInquiries: "admin/inquiries",
    getInquiryById: "admin/inquiries/:id",
    deleteInquiry: "admin/inquiries/:id",
  },

  certificates: {
    getAllCertificates: "admin/certificates",
    getCertificateById: "admin/certificates/:id",
    createCertificate: "admin/certificates/create",
    updateCertificate: "admin/certificates/:id",
    deleteCertificate: "admin/certificates/:id",
  },

  portfolio: {
    createProject: "admin/portfolio/create",
    getAllProjects: "admin/portfolio",
    getProjectById: "admin/portfolio/:id",
    updateProject: "admin/portfolio/:id",
    deleteProject: "admin/portfolio/:id",
  },

  packages: {
    createPackage: "admin/packages/create",
    getAllPackages: "admin/packages",
    getPackageById: "admin/packages/:id",
    updatePackage: "admin/packages/:id",
    deletePackage: "admin/packages/:id",
  },
  dashboard: {
    getStats: "admin/dashboard/stats",
    getRecentInquiries: "admin/dashboard/inquiries",
  },
  settings: {
    getAdminSettings: "admin/settings",
    updateProfile: "admin/settings/profile",
    changePassword: "admin/settings/change-password",
    toggleEmailNotifications: "admin/settings/email-notification",
  },
  notifications: {
    getAdminNotifications: "admin/notifications",
    markAsRead: "admin/notifications/:id/read",
  },
};
