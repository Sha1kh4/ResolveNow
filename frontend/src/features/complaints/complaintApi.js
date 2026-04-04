import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const createComplaint = async (formData, token) => {
  const res = await axios.post(
    `${API}/complaints/create`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ keep only this
      },
    }
  );
  return res.data;
};