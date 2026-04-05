import apiClient from "./axios";

export const getAdminUsers = async ({ page, pageSize }) => {
  const response = await apiClient.get("/admins/users", {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return response.data;
};

export const getAdminDepartments = async () => {
  const response = await apiClient.get("/admins/departments");
  return response.data;
};

export const getAdminDepartmentDetails = async () => {
  const response = await apiClient.get("/admins/departments/details");
  return response.data;
};

export const getAdminComplaints = async ({ page, pageSize, priority, title }) => {
  const response = await apiClient.get("/admins/complaints", {
    params: {
      page,
      page_size: pageSize,
      priority: priority || undefined,
      title: title || undefined,
    },
  });
  return response.data;
};

export const assignFacultyToDepartment = async (payload) => {
  const response = await apiClient.post("/admins/faculty-assignments", payload);
  return response.data;
};

export const getAdminComplaintDetail = async (id) => {
  const response = await apiClient.get(`/admins/complaints/${id}`);
  return response.data;
};
