import { Route, Routes } from "react-router-dom";

import AdminDashboard from "../features/admin/AdminDashboard";
import FacultyAssignment from "../features/admin/FacultyAssignment";
import ViewComplaints from "../features/admin/ViewComplaints";
import ViewDepartments from "../features/admin/ViewDepartments";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import LandingPage from "../features/home/LandingPage";
import VerifyEmail from "../features/auth/VerifyEmail";
import ComplaintList from "../features/complaints/ComplaintList";
import CreateComplaint from "../pages/user/CreateComplaint";
import MyComplaints from "../pages/user/MyComplaints";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/faculty-assignment" element={<FacultyAssignment />} />
      <Route path="/admin/complaints" element={<ViewComplaints />} />
      <Route path="/admin/departments" element={<ViewDepartments />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/complaint/create" element={<CreateComplaint />} />
      <Route path="/dashboard" element={<ComplaintList />} />
      <Route path="/create-complaint" element={<CreateComplaint />} />
      <Route path="/my-complaints" element={<MyComplaints />} /> 
    </Routes>
  );
}

export default AppRoutes;
