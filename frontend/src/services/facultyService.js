import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("cms_access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAssignedComplaints = async () => {
  const res = await axios.get(`${API_BASE_URL}/api/v1/faculty/complaints`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getComplaintDetail = async (complaintId) => {
  const res = await axios.get(
    `${API_BASE_URL}/faculty/complaints/${complaintId}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return res.data;
};

export const startComplaintWork = async (complaintId) => {
  const res = await axios.patch(
    `${API_BASE_URL}/faculty/complaints/${complaintId}/start`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return res.data;
};

export const resolveComplaint = async (complaintId, payload) => {
  const res = await axios.patch(
    `${API_BASE_URL}/faculty/complaints/${complaintId}/resolve`,
    payload,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};
