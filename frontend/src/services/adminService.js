import {
  getAdminComplaints,
  getAdminDepartmentDetails,
  assignFacultyToDepartment,
  getAdminDepartments,
  getAdminUsers,
} from "../api/adminApi";

export const adminService = {
  async getUsers(params) {
    return getAdminUsers(params);
  },

  async getDepartments() {
    return getAdminDepartments();
  },

  async getDepartmentDetails() {
    return getAdminDepartmentDetails();
  },

  async getComplaints(params) {
    return getAdminComplaints(params);
  },

  async assignFaculty(payload) {
    return assignFacultyToDepartment(payload);
  },
};
