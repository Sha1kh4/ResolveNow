import apiClient from "../api/axios"; // adjust path if needed

export const createComplaint = async (formData) => {
  const res = await apiClient.post(
    "/complaints/create",
    formData
  );
  return res.data;
};
