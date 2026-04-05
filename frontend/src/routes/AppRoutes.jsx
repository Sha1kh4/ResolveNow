import { Route, Routes } from "react-router-dom";

import AdminDashboard from "../features/admin/AdminDashboard";
import FacultyAssignment from "../features/admin/FacultyAssignment";
import ViewComplaints from "../features/admin/ViewComplaints";
import AdminComplaintDetail from "../features/admin/AdminComplaintDetail";
import ViewDepartments from "../features/admin/ViewDepartments";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import LandingPage from "../features/home/LandingPage";
import VerifyEmail from "../features/auth/VerifyEmail";
import StudentComplaintDashboard from "../features/complaints/StudentComplaintDashboard";
import CreateComplaintPage from "../features/complaints/CreateComplaintPage";
import MyComplaintsPage from "../features/complaints/MyComplaintsPage";
import ComplaintDetailPage from "../features/complaints/ComplaintDetailPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/faculty-assignment" element={<FacultyAssignment />} />
      <Route path="/admin/complaints" element={<ViewComplaints />} />
      <Route path="/admin/complaints/:id" element={<AdminComplaintDetail />} />
      <Route path="/admin/departments" element={<ViewDepartments />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/dashboard" element={<StudentComplaintDashboard initialView="overview" />} />
      <Route path="/complaint/create" element={<CreateComplaintPage />} />
      <Route path="/create-complaint" element={<CreateComplaintPage />} />
      <Route path="/my-complaints" element={<MyComplaintsPage />} />
      <Route path="/my-complaints/:id" element={<ComplaintDetailPage />} />
    </Routes>
  );
}

export default AppRoutes;
