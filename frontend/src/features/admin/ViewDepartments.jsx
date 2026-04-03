import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { adminService } from "../../services/adminService";
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
  maxWidth: "1120px",
  margin: "0 auto",
};

function ViewDepartments() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (storedUser.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    const loadDepartments = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await adminService.getDepartmentDetails();
        setDepartments(response);
      } catch (requestError) {
        setError(
          getUserFacingApiError(
            requestError,
            "Unable to load departments right now. Please try again."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, [navigate]);

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
            <div
              style={{
                display: "inline-block",
                padding: "8px 14px",
                borderRadius: "999px",
                backgroundColor: "rgba(15, 118, 110, 0.1)",
                color: "#0f766e",
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              Department Overview
            </div>
            <h1 style={{ margin: "14px 0 8px", fontSize: "38px" }}>
              View departments
            </h1>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, maxWidth: "720px" }}>
              Review each department, its description, and the faculty currently
              mapped to it.
            </p>
          </div>
          <Link
            to="/admin/dashboard"
            style={{
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
              minWidth: "160px",
            }}
          >
            Back Dashboard
          </Link>
        </header>

        {error ? (
          <div
            style={{
              marginBottom: "18px",
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

        {loading ? <div style={{ color: "#475569" }}>Loading departments...</div> : null}

        {!loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            {departments.map((department) => (
              <article
                key={department.id}
                style={{
                  padding: "24px",
                  borderRadius: "24px",
                  backgroundColor: "rgba(255, 255, 255, 0.92)",
                  boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
                  border: "1px solid rgba(148, 163, 184, 0.16)",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(15, 118, 110, 0.1)",
                    color: "#0f766e",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {department.default_priority} priority
                </div>
                <h2 style={{ margin: "14px 0 8px", fontSize: "24px" }}>
                  {department.name}
                </h2>
                <p style={{ margin: "0 0 18px", color: "#475569", lineHeight: 1.7 }}>
                  {department.description}
                </p>

                <div style={{ fontWeight: 700, marginBottom: "10px" }}>Faculty members</div>
                {department.faculty_members.length === 0 ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "14px",
                      backgroundColor: "#f8fafc",
                      color: "#64748b",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    No faculty assigned yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {department.faculty_members.map((faculty) => (
                      <div
                        key={faculty.id}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "14px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{faculty.name}</div>
                        <div style={{ color: "#64748b", marginTop: "4px" }}>
                          {faculty.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ViewDepartments;
