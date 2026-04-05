import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ComplaintComposer from "./ComplaintComposer";
import { complaintService } from "../../services/complaintService";
import { authService } from "../../services/authService";
import { getUserFacingApiError } from "../../utils/apiErrors";

const pageStyles = {
  minHeight: "100vh",
  padding: "24px",
  background:
    "radial-gradient(circle at top left, rgba(15, 118, 110, 0.24), transparent 26%), radial-gradient(circle at bottom right, rgba(14, 116, 144, 0.18), transparent 28%), linear-gradient(140deg, #f4f9f7 0%, #e0f2fe 50%, #fff7ed 100%)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  color: "#0f172a",
};

const shellStyles = {
  maxWidth: "1180px",
  margin: "0 auto",
};

const pillStyles = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  backgroundColor: "rgba(15, 118, 110, 0.1)",
  color: "#0f766e",
  fontSize: "12px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
};

const navButtonBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 20px",
  borderRadius: "14px",
  backgroundColor: "#ffffff",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 700,
  border: "1px solid #cbd5e1",
};

const initialFormState = {
  title: "",
  description: "",
  department_id: "",
  priority: "MEDIUM",
  file: null,
};

function CreateComplaintPage() {
  const navigate = useNavigate();
  const storedUser = useMemo(() => authService.getStoredUser(), []);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState("");
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }
    if (storedUser.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
  }, [navigate, storedUser]);

  useEffect(() => {
    const loadDepartments = async () => {
      setDepartmentsLoading(true);
      setDepartmentsError("");
      try {
        const response = await complaintService.getDepartments();
        setDepartments(response);
      } catch (requestError) {
        setDepartmentsError(
          getUserFacingApiError(
            requestError,
            "Unable to load departments right now. Please try again."
          )
        );
      } finally {
        setDepartmentsLoading(false);
      }
    };
    loadDepartments();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    setForm((current) => ({ ...current, file: event.target.files?.[0] || null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    try {
      await complaintService.create(formData);
      setSuccessMessage("Complaint submitted successfully.");
      setForm(initialFormState);
      navigate("/my-complaints", { replace: true });
    } catch (requestError) {
      setError(
        getUserFacingApiError(
          requestError,
          "Unable to submit your complaint right now. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (!storedUser || storedUser.role === "admin") {
    return null;
  }

  return (
    <div style={pageStyles}>
      <div style={shellStyles}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={pillStyles}>Raise Complaint</div>
            <h1 style={{ margin: "14px 0 8px", fontSize: "38px" }}>Create complaint</h1>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
              Fill out the form below to submit a new complaint.
            </p>
          </div>
          <Link to="/dashboard" style={navButtonBase}>
            Back to Dashboard
          </Link>
        </header>

        <ComplaintComposer
          form={form}
          departments={departments}
          departmentsLoading={departmentsLoading}
          departmentsError={departmentsError}
          loading={loading}
          error={error}
          successMessage={successMessage}
          onChange={handleFormChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default CreateComplaintPage;

