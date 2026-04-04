import { useState } from "react";
import { Link } from "react-router-dom";

import { authService } from "../../services/authService";
import { getUserFacingApiError } from "../../utils/apiErrors";

const initialFormState = {
  name: "",
  email: "",
  password: "",
  role: "student",
};

const pageStyles = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  background:
    "radial-gradient(circle at top, rgba(15, 118, 110, 0.24), transparent 30%), linear-gradient(135deg, #f4f9f7 0%, #dff4ec 52%, #fef7ed 100%)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const cardStyles = {
  width: "100%",
  maxWidth: "520px",
  padding: "32px",
  borderRadius: "24px",
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.14)",
  border: "1px solid rgba(15, 118, 110, 0.12)",
};

const inputStyles = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
};

const labelStyles = {
  display: "grid",
  gap: "8px",
  color: "#0f172a",
  fontWeight: 600,
  fontSize: "14px",
};

const buttonStyles = {
  width: "100%",
  padding: "14px 18px",
  border: "none",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #0f766e 0%, #14532d 100%)",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
};

function Register() {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const response = await authService.register(form);
      setSuccess(response);
      setForm(initialFormState);
    } catch (requestError) {
      setError(
        getUserFacingApiError(
          requestError,
          "Something went wrong while creating your account. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyles}>
      <div style={cardStyles}>
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: 0,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontSize: "12px",
              color: "#0f766e",
              fontWeight: 700,
            }}
          >
            Complaint Management System
          </p>
          <h1 style={{ margin: "10px 0 8px", fontSize: "32px", color: "#0f172a" }}>
            Create your account
          </h1>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
            Choose whether you are registering as a student or faculty member, then
            verify your email to continue the onboarding flow.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
          <label style={labelStyles}>
            Full name
            <input
              style={inputStyles}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              required
            />
          </label>

          <label style={labelStyles}>
            Email address
            <input
              style={inputStyles}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="rahul@example.com"
              required
            />
          </label>

          <label style={labelStyles}>
            Password
            <input
              style={inputStyles}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
            />
          </label>

          <label style={labelStyles}>
            Who are you?
            <select
              style={inputStyles}
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </label>

          {error ? (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          ) : null}

          {success ? (
            <div
              style={{
                padding: "14px",
                borderRadius: "16px",
                backgroundColor: "#ecfdf5",
                color: "#166534",
                border: "1px solid #bbf7d0",
                lineHeight: 1.7,
              }}
            >
              <strong>{success.message}</strong>
              <div style={{ marginTop: "8px" }}>
                Verification email sent: {success.verification_email_sent ? "Yes" : "No"}
              </div>
              <div style={{ marginTop: "8px" }}>
                {success.user.role === "faculty"
                  ? "Faculty accounts stay pending admin approval after email verification until a department is assigned."
                  : "Student accounts become active immediately after email verification."}
              </div>
            </div>
          ) : null}

          <button type="submit" disabled={loading} style={buttonStyles}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={{ margin: "22px 0 0", color: "#475569", textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#0f766e", fontWeight: 700 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
