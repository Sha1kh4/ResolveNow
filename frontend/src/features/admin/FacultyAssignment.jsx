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

const panelStyles = {
  borderRadius: "28px",
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.12)",
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

function FacultyAssignment() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 6,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submittingUserId, setSubmittingUserId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async (pageToLoad = pagination.page) => {
    setLoading(true);
    setError("");

    try {
      const [usersResponse, departmentsResponse] = await Promise.all([
        adminService.getUsers({
          page: pageToLoad,
          pageSize: pagination.pageSize,
        }),
        adminService.getDepartments(),
      ]);

      setUsers(usersResponse.items);
      setDepartments(departmentsResponse);
      setPagination({
        page: usersResponse.page,
        pageSize: usersResponse.page_size,
        total: usersResponse.total,
        totalPages: usersResponse.total_pages,
      });
      setSelectedDepartments((currentSelection) => {
        const nextSelection = { ...currentSelection };
        usersResponse.items.forEach((user) => {
          if (!nextSelection[user.id] && departmentsResponse[0]) {
            nextSelection[user.id] = departmentsResponse[0].id;
          }
        });
        return nextSelection;
      });
    } catch (requestError) {
      setError(
        getUserFacingApiError(
          requestError,
          "Unable to load the faculty assignment workflow right now."
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

    loadData();
  }, [navigate]);

  const handleDepartmentChange = (userId, departmentId) => {
    setSelectedDepartments((currentSelection) => ({
      ...currentSelection,
      [userId]: departmentId,
    }));
  };

  const handleAssignFaculty = async (user) => {
    const departmentId = selectedDepartments[user.id];
    if (!departmentId) {
      setError("Please choose a department before assigning faculty.");
      return;
    }

    setSubmittingUserId(user.id);
    setError("");
    setMessage("");

    try {
      const response = await adminService.assignFaculty({
        user_id: user.id,
        department_id: departmentId,
      });
      setMessage(
        `${response.user.name} is now faculty and mapped to ${response.department.name}.`
      );
      const nextPage =
        users.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await loadData(nextPage);
    } catch (requestError) {
      setError(
        getUserFacingApiError(
          requestError,
          "Unable to assign the selected user as faculty right now."
        )
      );
    } finally {
      setSubmittingUserId("");
    }
  };

  const handlePageChange = async (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage === pagination.page ||
      (pagination.totalPages > 0 && nextPage > pagination.totalPages)
    ) {
      return;
    }
    await loadData(nextPage);
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
              Admin Workflow
            </div>
            <h1 style={{ margin: "14px 0 8px", fontSize: "38px" }}>
              Assign faculty to departments
            </h1>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, maxWidth: "720px" }}>
              Review every registered user with the <strong>user</strong> role, promote the
              right person to <strong>faculty</strong>, and map them to one department from
              the dropdown.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
          </div>
        </header>

        <section style={{ ...panelStyles, padding: "32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "18px",
                borderRadius: "20px",
                backgroundColor: "#f8fafc",
                border: "1px solid #dbeafe",
              }}
            >
              <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
                Pending users
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800 }}>{pagination.total}</div>
            </div>
            <div
              style={{
                padding: "18px",
                borderRadius: "20px",
                backgroundColor: "#f8fafc",
                border: "1px solid #d1fae5",
              }}
            >
              <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
                Available departments
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800 }}>{departments.length}</div>
            </div>
          </div>

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

          {message ? (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "14px",
                backgroundColor: "#ecfdf5",
                color: "#166534",
                border: "1px solid #bbf7d0",
              }}
            >
              {message}
            </div>
          ) : null}

          {loading ? (
            <div style={{ color: "#475569" }}>Loading admin workflow...</div>
          ) : null}

          {!loading && users.length === 0 ? (
            <div
              style={{
                padding: "22px",
                borderRadius: "22px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
              }}
            >
              No regular users are waiting for faculty assignment right now.
            </div>
          ) : null}

          {!loading && users.length > 0 ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "18px",
                }}
              >
                {users.map((user) => (
                  <article
                    key={user.id}
                    style={{
                      padding: "22px",
                      borderRadius: "24px",
                      backgroundColor: "rgba(255, 255, 255, 0.88)",
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
                        backgroundColor: "rgba(14, 116, 144, 0.08)",
                        color: "#0e7490",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {user.role}
                    </div>
                    <h2 style={{ margin: "14px 0 8px", fontSize: "24px" }}>{user.name}</h2>
                    <p style={{ margin: "0 0 18px", color: "#475569", lineHeight: 1.7 }}>
                      {user.email}
                    </p>

                    <label
                      style={{
                        display: "grid",
                        gap: "8px",
                        color: "#0f172a",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      Choose department
                      <select
                        style={inputStyles}
                        value={selectedDepartments[user.id] || ""}
                        onChange={(event) =>
                          handleDepartmentChange(user.id, event.target.value)
                        }
                      >
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name} - {department.description}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleAssignFaculty(user)}
                      disabled={submittingUserId === user.id || departments.length === 0}
                      style={{
                        width: "100%",
                        marginTop: "18px",
                        padding: "14px 18px",
                        border: "none",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #0f766e 0%, #14532d 100%)",
                        color: "#ffffff",
                        fontSize: "16px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {submittingUserId === user.id
                        ? "Assigning faculty..."
                        : "Make Faculty"}
                    </button>
                  </article>
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
                  Page {pagination.page} of {pagination.totalPages || 1}
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
        </section>
      </div>
    </div>
  );
}

export default FacultyAssignment;
