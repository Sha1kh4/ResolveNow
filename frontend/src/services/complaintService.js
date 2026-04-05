import {
  createComplaint,
  getComplaintDepartments,
  getMyComplaints,
  getComplaintById,
} from "../api/complaintApi";

export const complaintService = {
  async create(payload) {
    return createComplaint(payload);
  },

  async getMine() {
    return getMyComplaints();
  },

  async getDepartments() {
    return getComplaintDepartments();
  },

  async getById(id) {
    return getComplaintById(id);
  },
};
