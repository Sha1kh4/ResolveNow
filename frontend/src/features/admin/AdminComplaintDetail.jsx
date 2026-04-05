import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function AdminComplaintDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
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
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await adminService.getComplaintDetail(id);
        setDetail(response);
      } catch (requestError) {
        setError(getUserFacingApiError(requestError, "Unable to load complaint details."));
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

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
              Complaint Detail
            </div>
            <h1 style={{ margin: "14px 0 8px", fontSize: "38px" }}>
              {detail?.title || "Detail view"}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to="/admin/complaints"
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
              Back to list
            </Link>
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

        {!loading && detail ? (
          <section
            style={{
              display: "grid",
              gap: "18px",
              padding: "26px",
              borderRadius: "24px",
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "13px" }}>Complaint ID</div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>{detail.complaint_id}</div>

            <h2 style={{ margin: 0, fontSize: "28px", color: "#0f172a" }}>{detail.title}</h2>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>{detail.description}</p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              {[
                ["Department", detail.department_name || "Not assigned"],
                ["Priority", detail.priority],
                ["Status", detail.status],
                ["Deadline", detail.deadline ? new Date(detail.deadline).toLocaleString() : "Not available"],
                ["Created at", detail.created_at ? new Date(detail.created_at).toLocaleString() : "Not available"],
                ["Created by", detail.created_by_name || "Unknown"],
                ["Assigned to", detail.assigned_to_name || "Unassigned"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: "16px",
                    borderRadius: "18px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ color: "#64748b", fontSize: "13px" }}>{label}</div>
                  <div style={{ fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>

            {detail.image_urls?.length ? (
              <div>
                <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
                  Attachments
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {detail.image_urls.map((src, idx) => (
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
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}

