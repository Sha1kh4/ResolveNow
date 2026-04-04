import apiClient from "./axios";

export const createComplaint = async (formData) => {
  const response = await apiClient.post("/complaints/create", formData);
  return response.data;
};

export const getMyComplaints = async () => {
  const response = await apiClient.get("/complaints/my");
  return response.data;
};

export const getComplaintDepartments = async () => {
  const response = await apiClient.get("/complaints/departments");
  return response.data;
};
