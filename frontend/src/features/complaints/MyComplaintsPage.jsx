import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function MyComplaintsPage() {
  const navigate = useNavigate();
  const storedUser = useMemo(() => authService.getStoredUser(), []);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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
        const [mine, depts] = await Promise.all([
          complaintService.getMine(),
          complaintService.getDepartments(),
        ]);
        setComplaints(mine);
        setDepartments(depts);
      } catch (requestError) {
        setError(
          getUserFacingApiError(
            requestError,
            "Unable to load your complaints right now. Please try again."
          )
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived pagination values (client-side)
  const totalPages = Math.max(1, Math.ceil(complaints.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const visibleComplaints = complaints.slice(startIndex, endIndex);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    // scroll to top of list on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value) || 6;
    setPageSize(newSize);
    setPage(1);
  };

  const getDepartmentName = (departmentId) => {
    return (
      departments.find((d) => d.id === departmentId)?.name ||
      departmentId ||
      "Not available"
    );
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
            <div style={pillStyles}>My Complaints</div>
            <h1 style={{ margin: "14px 0 8px", fontSize: "38px" }}>Complaint list</h1>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
              Open any complaint to view a clean detail page.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/dashboard" style={navButtonBase}>
              Back to Dashboard
            </Link>
            <Link to="/create-complaint" style={navButtonBase}>
              Raise Complaint
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

        {loading ? <div style={{ color: "#475569" }}>Loading complaints...</div> : null}

        {!loading && complaints.length === 0 ? (
          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              color: "#475569",
            }}
          >
            You have not submitted any complaints yet.{" "}
            <Link to="/create-complaint" style={{ color: "#0f766e", fontWeight: 700 }}>
              Create your first complaint
            </Link>
            .
          </div>
        ) : null}

        {!loading && complaints.length > 0 ? (
          <div style={{ display: "grid", gap: "14px" }}>
            {visibleComplaints.map((complaint) => (
              <Link
                key={complaint._id}
                to={`/my-complaints/${complaint._id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <article
                  style={{
                    padding: "20px",
                    borderRadius: "22px",
                    border: "1px solid rgba(148, 163, 184, 0.16)",
                    background: "rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        backgroundColor: "rgba(14, 116, 144, 0.08)",
                        color: "#0e7490",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {complaint.priority || "MEDIUM"}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        backgroundColor: "rgba(15, 118, 110, 0.1)",
                        color: "#0f766e",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {complaint.status || "OPEN"}
                    </span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
                    {complaint.complaint_id || complaint._id}
                  </div>
                  <h3 style={{ margin: "0 0 10px", fontSize: "22px", color: "#0f172a" }}>
                    {complaint.title}
                  </h3>
                  <p style={{ margin: "0 0 14px", color: "#475569", lineHeight: 1.7 }}>
                    {complaint.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      color: "#334155",
                      fontSize: "14px",
                    }}
                  >
                    <span>Department: {getDepartmentName(complaint.department_id)}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : null}

        {!loading && complaints.length > 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginTop: "24px",
              flexWrap: "wrap",
              padding: "18px 20px",
              borderRadius: "20px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ color: "#475569", lineHeight: 1.7 }}>
              Page {page} of {totalPages} - {complaints.length} complaints
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ color: "#64748b", fontSize: "13px" }}>
                Per page{" "}
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={loading || page >= totalPages}
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #0f172a 0%, #0e7490 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MyComplaintsPage;

