import { Link } from "react-router-dom";

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

const heroCardStyles = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, 0.9fr)",
  gap: "24px",
  padding: "32px",
  borderRadius: "32px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.12)",
  border: "1px solid rgba(15, 118, 110, 0.12)",
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
  minWidth: "160px",
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
  minWidth: "160px",
};

const featureCardStyles = {
  padding: "24px",
  borderRadius: "24px",
  backgroundColor: "rgba(255, 255, 255, 0.88)",
  boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
};

function LandingPage() {
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
            <div style={pillStyles}>Complaint Management System</div>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/login" style={secondaryActionStyles}>
              Login
            </Link>
            <Link to="/register" style={primaryActionStyles}>
              Register
            </Link>
          </div>
        </header>

        <section style={heroCardStyles}>
          <div>
            <h1
              style={{
                margin: "0 0 16px",
                fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
                lineHeight: 1.05,
              }}
            >
              One Platform for Every Complaint.
            </h1>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "18px",
                lineHeight: 1.7,
                color: "#475569",
                maxWidth: "620px",
              }}
            >
              A streamlined portal for users, faculty, and administrators to manage
              complaints, route them to the right department, and keep resolution
              status transparent from start to finish.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link to="/register" style={primaryActionStyles}>
                Create Account
              </Link>
              <Link to="/login" style={secondaryActionStyles}>
                Sign In
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "14px",
                marginTop: "28px",
              }}
            >
              {[
                ["4 Departments", "Behavioural, infrastructural, academic, and general"],
                ["Round Robin", "Fair faculty assignment across mapped departments"],
                ["Priority Escalation", "Automatic escalation and admin notification flow"],
              ].map(([title, description]) => (
                <div
                  key={title}
                  style={{
                    padding: "16px",
                    borderRadius: "18px",
                    backgroundColor: "rgba(248, 250, 252, 0.92)",
                    border: "1px solid rgba(203, 213, 225, 0.7)",
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: "6px" }}>{title}</div>
                  <div style={{ color: "#64748b", lineHeight: 1.6, fontSize: "14px" }}>
                    {description}
                  </div>
                </div>
              ))}
            </div>
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
                padding: "22px",
                borderRadius: "24px",
                background: "linear-gradient(180deg, #0f172a 0%, #134e4a 100%)",
                color: "#ffffff",
                minHeight: "220px",
              }}
            >
              <div style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.76 }}>
                Live Workflow
              </div>
              <div style={{ marginTop: "18px", fontSize: "28px", fontWeight: 800 }}>
                
              </div>
              <div style={{ marginTop: "12px", lineHeight: 1.7, color: "rgba(255,255,255,0.78)" }}>
                Keep every complaint visible, assigned, and accountable with timestamped
                actions and role-based access.
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
            marginTop: "24px",
          }}
        >
          {[
            {
              title: "For Users",
              text: "Register, verify your email, submit complaints, and review updates in one place.",
            },
            {
              title: "For Faculty",
              text: "Receive department-mapped assignments and work through complaints with balanced distribution.",
            },
            {
              title: "For Admins",
              text: "Monitor escalations, assign faculty roles, and keep departments mapped and accountable.",
            },
          ].map((item) => (
            <article key={item.title} style={featureCardStyles}>
              <h2 style={{ margin: "0 0 10px", fontSize: "24px" }}>{item.title}</h2>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
