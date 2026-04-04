import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ComplaintComposer from "./ComplaintComposer";
import ComplaintDetails from "./ComplaintDetails";
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

const heroCardStyles = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.25fr) minmax(280px, 0.9fr)",
  gap: "24px",
  padding: "32px",
  borderRadius: "32px",
  backgroundColor: "rgba(255, 255, 255, 0.92)",
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.12)",
  border: "1px solid rgba(15, 118, 110, 0.12)",
};

const navButtonBase = {
  padding: "12px 18px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};

const primaryButtonStyles = {
  ...navButtonBase,
  border: "none",
  background: "linear-gradient(135deg, #0f766e 0%, #14532d 100%)",
  color: "#ffffff",
};

const statCardStyles = {
  padding: "22px",
  borderRadius: "24px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
};

const initialFormState = {
  title: "",
  description: "",
  department_id: "",
  priority: "MEDIUM",
  file: null,
};

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString();
}

function getStatusCount(complaints, status) {
  return complaints.filter((complaint) => complaint.status === status).length;
}

function getDepartmentName(departments, departmentId) {
  return (
    departments.find((department) => department.id === departmentId)?.name ||
    departmentId ||
    "Not available"
  );
}

function StudentComplaintDashboard({ initialView = "overview" }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(initialView);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState("");
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState("");
  const [form, setForm] = useState(initialFormState);
  const storedUser = useMemo(() => authService.getStoredUser(), []);

  useEffect(() => {
    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (storedUser.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    setActiveView(initialView);
  }, [initialView, navigate, storedUser]);

  const loadComplaints = async () => {
    setLoadingComplaints(true);
    setListError("");

    try {
      const response = await complaintService.getMine();
      setComplaints(response);
      setSelectedComplaintId((currentId) => {
        if (currentId && response.some((complaint) => complaint._id === currentId)) {
          return currentId;
        }
        return response[0]?._id || "";
      });
    } catch (requestError) {
      setListError(
        getUserFacingApiError(
          requestError,
          "Unable to load your complaints right now. Please try again."
        )
      );
    } finally {
      setLoadingComplaints(false);
    }
  };

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

  useEffect(() => {
    if (storedUser && storedUser.role !== "admin" && initialView !== "create") {
      loadComplaints();
    }
  }, [initialView, storedUser]);

  useEffect(() => {
    if (storedUser && storedUser.role !== "admin" && initialView === "create") {
      loadDepartments();
    }
  }, [initialView, storedUser]);

  useEffect(() => {
    if (
      storedUser &&
      storedUser.role !== "admin" &&
      initialView !== "create" &&
      departments.length === 0
    ) {
      loadDepartments();
    }
  }, [departments.length, initialView, storedUser]);

  const goToOverview = () => {
    navigate("/dashboard");
  };

  const goToCreateComplaint = () => {
    navigate("/create-complaint");
  };

  const goToComplaintList = () => {
    navigate("/my-complaints");
  };

  const selectedComplaint = useMemo(
    () => complaints.find((complaint) => complaint._id === selectedComplaintId) || null,
    [complaints, selectedComplaintId]
  );

  const complaintStats = useMemo(() => {
    const total = complaints.length;
    const open = getStatusCount(complaints, "OPEN");
    const resolved = getStatusCount(complaints, "RESOLVED");
    const highPriority = complaints.filter(
      (complaint) => complaint.priority === "HIGH"
    ).length;

    return [
      {
        label: "Total complaints",
        value: total,
        caption: "Everything you have submitted so far.",
      },
      {
        label: "Open right now",
        value: open,
        caption: "Complaints still waiting for closure.",
      },
      {
        label: "Resolved",
        value: resolved,
        caption: "Items that already reached resolution.",
      },
      {
        label: "High priority",
        value: highPriority,
        caption: "Urgent issues flagged for faster attention.",
      },
    ];
  }, [complaints]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => {
      if (name === "department_id") {
        const selectedDepartment = departments.find(
          (department) => department.id === value
        );

        return {
          ...currentForm,
          department_id: value,
          priority: selectedDepartment?.default_priority || currentForm.priority,
        };
      }

      return { ...currentForm, [name]: value };
    });
  };

  const handleFileChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      file: event.target.files?.[0] || null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      const createdComplaint = await complaintService.create(formData);
      setSuccessMessage("Complaint submitted successfully.");
      setForm(initialFormState);
      await loadComplaints();
      setSelectedComplaintId(createdComplaint._id || createdComplaint.id || "");
      navigate("/my-complaints");
    } catch (requestError) {
      setFormError(
        getUserFacingApiError(
          requestError,
          "Unable to submit your complaint right now. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login", { replace: true });
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
            <div style={pillStyles}>Student Dashboard</div>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={goToOverview}
              style={activeView === "overview" ? primaryButtonStyles : navButtonBase}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={goToCreateComplaint}
              style={activeView === "create" ? primaryButtonStyles : navButtonBase}
            >
              Create Complaint
            </button>
            <button
              type="button"
              onClick={goToComplaintList}
              style={activeView === "list" ? primaryButtonStyles : navButtonBase}
            >
              View Complaints
            </button>
            <button type="button" onClick={handleLogout} style={navButtonBase}>
              Logout
            </button>
          </div>
        </header>

        <section style={heroCardStyles}>
          <div>
            <h1
              style={{
                margin: "0 0 16px",
                fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
                lineHeight: 1.02,
              }}
            >
              Welcome, {storedUser.name}
            </h1>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "18px",
                lineHeight: 1.75,
                color: "#475569",
                maxWidth: "640px",
              }}
            >
              This student workspace keeps complaint creation, complaint tracking,
              and complaint details in one flow so you can submit issues and follow
              progress without jumping across unrelated pages.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={goToCreateComplaint}
                style={primaryButtonStyles}
              >
                Raise a Complaint
              </button>
              <button
                type="button"
                onClick={goToComplaintList}
                style={navButtonBase}
              >
                Review My Complaints
              </button>
            </div>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "24px",
              background: "linear-gradient(180deg, #0f172a 0%, #134e4a 100%)",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                opacity: 0.76,
              }}
            >
              Student Flow
            </div>
            <div style={{ marginTop: "18px", fontSize: "28px", fontWeight: 800 }}>
              Create {"->"} Track {"->"} Review Details
            </div>
            <div
              style={{
                marginTop: "12px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              Submit a complaint, keep an eye on its status, and open a full detail
              view for deadlines, IDs, priorities, and updates.
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginTop: "24px",
          }}
        >
          {complaintStats.map((item) => (
            <article key={item.label} style={statCardStyles}>
              <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>
                {item.value}
              </div>
              <div style={{ color: "#475569", lineHeight: 1.6 }}>{item.caption}</div>
            </article>
          ))}
        </section>

        <section style={{ marginTop: "24px" }}>
          {activeView === "create" ? (
            <ComplaintComposer
              form={form}
              departments={departments}
              departmentsLoading={departmentsLoading}
              departmentsError={departmentsError}
              loading={submitting}
              error={formError}
              successMessage={successMessage}
              onChange={handleFormChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
            />
          ) : null}

          {activeView !== "create" ? (
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.8fr)",
                gap: "20px",
              }}
            >
              <article
                style={{
                  padding: "26px",
                  borderRadius: "28px",
                  backgroundColor: "rgba(255, 255, 255, 0.92)",
                  boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
                  border: "1px solid rgba(148, 163, 184, 0.16)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "22px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={pillStyles}>My Complaints</div>
                    <h2 style={{ margin: "14px 0 8px", fontSize: "34px" }}>
                      Complaint list
                    </h2>
                    <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
                      Open any complaint from the list to view its full details.
                    </p>
                  </div>
                  <button type="button" onClick={loadComplaints} style={navButtonBase}>
                    Refresh List
                  </button>
                </div>

                {listError ? (
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
                    {listError}
                  </div>
                ) : null}

                {loadingComplaints ? (
                  <div style={{ color: "#475569" }}>Loading complaints...</div>
                ) : null}

                {!loadingComplaints && complaints.length === 0 ? (
                  <div
                    style={{
                      padding: "20px",
                      borderRadius: "20px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      color: "#475569",
                    }}
                  >
                    You have not submitted any complaints yet.{" "}
                    <button
                      type="button"
                      onClick={goToCreateComplaint}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#0f766e",
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Create your first complaint
                    </button>
                    .
                  </div>
                ) : null}

                {!loadingComplaints && complaints.length > 0 ? (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {complaints.map((complaint) => {
                      const isSelected = complaint._id === selectedComplaintId;

                      return (
                        <button
                          key={complaint._id}
                          type="button"
                          onClick={() => setSelectedComplaintId(complaint._id)}
                          style={{
                            textAlign: "left",
                            padding: "20px",
                            borderRadius: "22px",
                            border: isSelected
                              ? "1px solid rgba(15, 118, 110, 0.3)"
                              : "1px solid rgba(148, 163, 184, 0.16)",
                            background: isSelected
                              ? "linear-gradient(135deg, rgba(15, 118, 110, 0.08) 0%, rgba(224, 242, 254, 0.7) 100%)"
                              : "rgba(255, 255, 255, 0.9)",
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
                            <span>
                              Department: {getDepartmentName(departments, complaint.department_id)}
                            </span>
                            <span>Deadline: {formatDate(complaint.deadline)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </article>

              <ComplaintDetails complaint={selectedComplaint} departments={departments} />
            </section>
          ) : null}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
            marginTop: "24px",
          }}
        >
          {[
            {
              title: "Quick creation",
              text: "Open the create view, submit your complaint, and return to the list automatically.",
            },
            {
              title: "Single place tracking",
              text: "Every submitted complaint stays visible inside the same dashboard flow.",
            },
            {
              title: "Clear detail view",
              text: "Review ticket ID, deadline, priority, status, and department reference side by side.",
            },
          ].map((item) => (
            <article key={item.title} style={statCardStyles}>
              <h2 style={{ margin: "0 0 10px", fontSize: "24px" }}>{item.title}</h2>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>{item.text}</p>
            </article>
          ))}
        </section>

        <div style={{ marginTop: "24px", color: "#475569" }}>
          <Link
            to="/"
            style={{
              color: "#0f766e",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Back to landing page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StudentComplaintDashboard;
