import Api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const getAllProjects = (params, config) =>
  Api.get(ENDPOINTS.portfolio.getAllProjects, { params, ...config });

export const getProjectById = (id) =>
  Api.get(ENDPOINTS.portfolio.getProjectById.replace(":id", id));

export const createProject = (payload) =>
  Api.post(ENDPOINTS.portfolio.createProject, payload);

export const updateProject = (id, payload) =>
  Api.put(ENDPOINTS.portfolio.updateProject.replace(":id", id), payload);

export const deleteProject = (id) =>
  Api.delete(ENDPOINTS.portfolio.deleteProject.replace(":id", id));
