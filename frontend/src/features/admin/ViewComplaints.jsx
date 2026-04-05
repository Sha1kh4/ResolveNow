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

function ViewComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ priority: "", title: "" });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 6,
    total: 0,
    totalPages: 0,
  });

  const loadComplaints = async ({ page = 1, priority = filters.priority, title = filters.title } = {}) => {
    setLoading(true);
    setError("");
    try {
      const response = await adminService.getComplaints({
        page,
        pageSize: pagination.pageSize,
        priority,
        title,
      });
      setComplaints(response.items);
      setPagination({
        page: response.page,
        pageSize: response.page_size,
        total: response.total,
        totalPages: response.total_pages,
      });
    } catch (requestError) {
      setError(
        getUserFacingApiError(
          requestError,
          "Unable to load complaints right now. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

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

    loadComplaints();
  }, [navigate]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadComplaints({ page: 1, priority: filters.priority, title: filters.title });
  };

  const handlePageChange = async (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage === pagination.page ||
      (pagination.totalPages > 0 && nextPage > pagination.totalPages)
    ) {
      return;
    }
    await loadComplaints({ page: nextPage });
  };

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
              Complaint Overview
            </div>
            <h1 style={{ margin: "14px 0 8px", fontSize: "38px" }}>View complaints</h1>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, maxWidth: "720px" }}>
              Search complaints by title, filter by priority, and browse paginated complaint records.
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

        <form
          onSubmit={handleSearch}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1.5fr) minmax(180px, 0.8fr) auto",
            gap: "14px",
            marginBottom: "24px",
            padding: "24px",
            borderRadius: "24px",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
            border: "1px solid rgba(148, 163, 184, 0.16)",
          }}
        >
          <input
            style={inputStyles}
            type="text"
            name="title"
            value={filters.title}
            onChange={handleFilterChange}
            placeholder="Search by complaint title"
          />
          <select
            style={inputStyles}
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <button
            type="submit"
            style={{
              padding: "14px 20px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #0f766e 0%, #14532d 100%)",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Apply Filters
          </button>
        </form>

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
              padding: "22px",
              borderRadius: "22px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
            }}
          >
            No complaints matched the selected filters.
          </div>
        ) : null}

        {!loading && complaints.length > 0 ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "18px",
              }}
            >
              {complaints.map((complaint) => (
                <Link
                  to={`/admin/complaints/${complaint.id}`}
                  key={complaint.id}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      padding: "24px",
                      borderRadius: "24px",
                      backgroundColor: "rgba(255, 255, 255, 0.92)",
                      boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
                      border: "1px solid rgba(148, 163, 184, 0.16)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "999px",
                          backgroundColor: "rgba(14, 116, 144, 0.08)",
                          color: "#0e7490",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {complaint.priority}
                      </span>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: "999px",
                          backgroundColor: "rgba(15, 118, 110, 0.1)",
                          color: "#0f766e",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
                      {complaint.complaint_id}
                    </div>
                    <h2 style={{ margin: "0 0 10px", fontSize: "24px" }}>{complaint.title}</h2>
                    <div style={{ display: "grid", gap: "8px", color: "#334155" }}>
                      <div>
                        <strong>Department:</strong> {complaint.department_name || "Not assigned"}
                      </div>
                      <div>
                        <strong>Assigned to:</strong> {complaint.assigned_to_name || "Unassigned"}
                      </div>
                      <div>
                        <strong>Created by:</strong> {complaint.created_by_name || "Unknown"}
                      </div>
                      <div>
                        <strong>Created at:</strong>{" "}
                        {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : "Not available"}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

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
                Page {pagination.page} of {pagination.totalPages || 1} {"-"} {pagination.total} complaints
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
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
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={
                    loading ||
                    pagination.totalPages === 0 ||
                    pagination.page >= pagination.totalPages
                  }
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
          </>
        ) : null}
      </div>
    </div>
  );
}

export default ViewComplaints;
