import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";

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

const featureCardStyles = {
  padding: "26px",
  borderRadius: "26px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  display: "grid",
  gap: "16px",
};

const primaryActionStyles = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 20px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #0f766e 0%, #14532d 100%)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
};

const secondaryActionStyles = {
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

const adminCards = [
  {
    title: "Manage Faculties",
    description:
      "Review pending faculty accounts, approve them, and connect each one to the department that should handle their work.",
    badge: "Role Control",
    route: "/admin/faculty-assignment",
    action: "Open Faculty Manager",
    stats: "Faculty -> Approval -> Department",
    accent: "linear-gradient(135deg, rgba(15, 118, 110, 0.12) 0%, rgba(20, 83, 45, 0.08) 100%)",
    tone: "#0f766e",
  },
  {
    title: "View Departments",
    description:
      "Inspect department names, descriptions, and the faculty members currently assigned inside each department mapping.",
    badge: "Department Map",
    route: "/admin/departments",
    action: "Open Department View",
    stats: "Names, descriptions, faculty",
    accent: "linear-gradient(135deg, rgba(14, 116, 144, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)",
    tone: "#1d4ed8",
  },
  {
    title: "View Complaints",
    description:
      "Search complaints by title, filter them by priority, and review paginated complaint records from one monitoring view.",
    badge: "Complaint Desk",
    route: "/admin/complaints",
    action: "Open Complaint View",
    stats: "Search, filters, pages",
    accent: "linear-gradient(135deg, rgba(249, 115, 22, 0.14) 0%, rgba(245, 158, 11, 0.08) 100%)",
    tone: "#c2410c",
  },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const storedUser = authService.getStoredUser();

  useEffect(() => {
    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (storedUser.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [navigate, storedUser]);

  if (!storedUser || storedUser.role !== "admin") {
    return null;
  }

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login", { replace: true });
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
            <div style={pillStyles}>Admin Dashboard</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "14px 20px",
              borderRadius: "14px",
              backgroundColor: "#ffffff",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
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
              Welcome back, {storedUser.name}
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
              This dashboard brings faculty assignment, department visibility, and
              complaint monitoring into one clean admin workspace so you can move
              between the most important operations without friction.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "16px",
              alignContent: "start",
            }}
          >
            <div
              style={{
                padding: "24px",
                borderRadius: "24px",
                background: "linear-gradient(180deg, #0f172a 0%, #134e4a 100%)",
                color: "#ffffff",
                minHeight: "220px",
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
                Admin Workflow
              </div>
              <div style={{ marginTop: "18px", fontSize: "28px", fontWeight: 800 }}>
                Faculty Requests {"->"} Approval {"->"} Departments {"->"} Complaints
              </div>
              <div
                style={{
                  marginTop: "12px",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                Use the cards below to move through each administrative workflow with
                clear separation between role management, department oversight, and
                complaint review.
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginTop: "24px",
          }}
        >
          {adminCards.map((card, index) => (
            <article key={card.title} style={{ ...featureCardStyles, background: card.accent }}>
              <div
                style={{
                  display: "inline-flex",
                  width: "fit-content",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(255,255,255,0.78)",
                  color: card.tone,
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {card.badge}
              </div>

              <div>
                <h2 style={{ margin: "0 0 10px", fontSize: "26px" }}>{card.title}</h2>
                <p style={{ margin: 0, color: "#475569", lineHeight: 1.75 }}>
                  {card.description}
                </p>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "18px",
                  backgroundColor: "rgba(255, 255, 255, 0.72)",
                  border: "1px solid rgba(255,255,255,0.8)",
                  color: "#334155",
                  fontWeight: 700,
                }}
              >
                {card.stats}
              </div>

              <Link
                to={card.route}
                style={index === 0 ? primaryActionStyles : secondaryActionStyles}
              >
                {card.action}
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
