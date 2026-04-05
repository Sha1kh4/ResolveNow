import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = useMemo(() => authService.getStoredUser(), []);
  const [departments, setDepartments] = useState([]);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDateTime = (value) => {
    if (!value) return "Not available";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Not available";
    return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

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
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [detail, depts] = await Promise.all([
          complaintService.getById(id),
          complaintService.getDepartments(),
        ]);
        setComplaint(detail);
        setDepartments(depts);
      } catch (requestError) {
        setError(
          getUserFacingApiError(
            requestError,
            "Unable to load the complaint right now. Please try again."
          )
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (!storedUser || storedUser.role === "admin") {
    return null;
  }

  const departmentName =
    (complaint &&
      departments.find((d) => d.id === complaint.department_id)?.name) ||
    "Not available";

  const imageUrls = (() => {
    if (!complaint) return [];
    // Support different shapes: single image_url, array image_urls, or attachments
    if (complaint.image_url) return [complaint.image_url];
    if (Array.isArray(complaint.image_urls)) return complaint.image_urls;
    if (Array.isArray(complaint.attachments)) {
      return complaint.attachments
        .map((a) => a?.file_url)
        .filter(Boolean);
    }
    return [];
  })();

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
            <div style={pillStyles}>Complaint Details</div>
            <h1 style={{ margin: "14px 0 8px", fontSize: "38px" }}>Detail view</h1>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
              Review ticket ID, status, priority, department, and timeline.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/my-complaints" style={navButtonBase}>
              Back to My Complaints
            </Link>
            <Link to="/dashboard" style={navButtonBase}>
              Dashboard
            </Link>
          </div>
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

        {loading ? <div style={{ color: "#475569" }}>Loading complaint...</div> : null}

        {!loading && complaint ? (
          <section
            style={{
              display: "grid",
              gap: "18px",
              padding: "26px",
              borderRadius: "28px",
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "13px" }}>Complaint ID</div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>
              {complaint.complaint_id || complaint._id}
            </div>

            <h2 style={{ margin: "6px 0 0", fontSize: "30px", color: "#0f172a" }}>
              {complaint.title}
            </h2>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
              {complaint.description}
            </p>

            {imageUrls.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "12px",
                }}
              >
                {imageUrls.map((src, idx) => (
                  <div
                    key={`${src}-${idx}`}
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                    }}
                  >
                    <img
                      src={src}
                      alt={`Attachment ${idx + 1}`}
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  borderRadius: "18px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: "#64748b", fontSize: "13px" }}>Created At</div>
                <div style={{ fontWeight: 700 }}>{formatDateTime(complaint.created_at)}</div>
              </div>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "18px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: "#64748b", fontSize: "13px" }}>Status</div>
                <div style={{ fontWeight: 700 }}>{complaint.status || "OPEN"}</div>
              </div>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "18px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: "#64748b", fontSize: "13px" }}>Department</div>
                <div style={{ fontWeight: 700 }}>{departmentName}</div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default ComplaintDetailPage;

