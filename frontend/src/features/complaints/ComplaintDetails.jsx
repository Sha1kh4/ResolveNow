const labelStyles = {
  color: "#64748b",
  fontSize: "13px",
  marginBottom: "6px",
};

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function ComplaintDetails({ complaint, departments = [] }) {
  const departmentName =
    departments.find((department) => department.id === complaint?.department_id)?.name ||
    "Not available";

  return (
    <aside
      style={{
        padding: "26px",
        borderRadius: "28px",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
        border: "1px solid rgba(148, 163, 184, 0.16)",
        alignContent: "start",
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "8px 14px",
          borderRadius: "999px",
          backgroundColor: "rgba(14, 116, 144, 0.08)",
          color: "#0e7490",
          fontSize: "12px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
        }}
      >
        Complaint Details
      </div>

      {!complaint ? (
        <div
          style={{
            marginTop: "18px",
            padding: "20px",
            borderRadius: "20px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#475569",
            lineHeight: 1.7,
          }}
        >
          Select a complaint from the list to review its complete details here.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "18px", marginTop: "18px" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
              Ticket reference
            </div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>
              {complaint.complaint_id || complaint._id}
            </div>
          </div>

          <div>
            <h3 style={{ margin: "0 0 10px", fontSize: "28px", color: "#0f172a" }}>
              {complaint.title}
            </h3>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
              {complaint.description}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
              <div style={labelStyles}>Status</div>
              <div style={{ fontWeight: 700, color: "#0f766e" }}>
                {complaint.status || "OPEN"}
              </div>
            </div>
            <div
              style={{
                padding: "16px",
                borderRadius: "18px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={labelStyles}>Priority</div>
              <div style={{ fontWeight: 700, color: "#b45309" }}>
                {complaint.priority || "MEDIUM"}
              </div>
            </div>
            <div
              style={{
                padding: "16px",
                borderRadius: "18px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={labelStyles}>Department</div>
              <div style={{ fontWeight: 700, color: "#0f172a", wordBreak: "break-word" }}>
                {departmentName}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "22px",
              background: "linear-gradient(180deg, #0f172a 0%, #134e4a 100%)",
              color: "#ffffff",
            }}
          >
            <div style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.76 }}>
              Tracking Summary
            </div>
            <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.62)", fontSize: "13px" }}>
                  Deadline
                </div>
                <div style={{ fontWeight: 700 }}>{formatDateTime(complaint.deadline)}</div>
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.62)", fontSize: "13px" }}>
                  Created By
                </div>
                <div style={{ fontWeight: 700, wordBreak: "break-word" }}>
                  {complaint.created_by || "Not available"}
                </div>
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.62)", fontSize: "13px" }}>
                  Resolution Time
                </div>
                <div style={{ fontWeight: 700 }}>
                  {formatDateTime(complaint.resolved_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default ComplaintDetails;
