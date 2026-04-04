import {
  createComplaint,
  getComplaintDepartments,
  getMyComplaints,
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
};
