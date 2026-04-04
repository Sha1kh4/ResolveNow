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

const labelStyles = {
  display: "grid",
  gap: "8px",
  color: "#0f172a",
  fontWeight: 600,
  fontSize: "14px",
};

const priorityChipStyles = {
  LOW: {
    backgroundColor: "rgba(14, 165, 233, 0.12)",
    color: "#0369a1",
  },
  MEDIUM: {
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    color: "#b45309",
  },
  HIGH: {
    backgroundColor: "rgba(239, 68, 68, 0.14)",
    color: "#b91c1c",
  },
};

function ComplaintComposer({
  form,
  departments,
  departmentsLoading,
  departmentsError,
  loading,
  error,
  successMessage,
  onChange,
  onFileChange,
  onSubmit,
}) {
  const selectedDepartment =
    departments.find((department) => department.id === form.department_id) || null;
  const selectedPriority = selectedDepartment?.default_priority || form.priority;

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
        gap: "20px",
      }}
    >
      <article
        style={{
          padding: "28px",
          borderRadius: "28px",
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
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
            New Complaint
          </div>
          <h2 style={{ margin: "14px 0 8px", fontSize: "34px", color: "#0f172a" }}>
            Create a complaint
          </h2>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
            Share the title, describe the issue clearly, add the department ID, and
            include an attachment if it helps explain the complaint.
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "18px" }}>
          <label style={labelStyles}>
            Complaint title
            <input
              style={inputStyles}
              name="title"
              value={form.title}
              placeholder="Hostel maintenance issue"
              onChange={onChange}
              required
            />
          </label>

          <label style={labelStyles}>
            Description
            <textarea
              style={{ ...inputStyles, minHeight: "150px", resize: "vertical" }}
              name="description"
              value={form.description}
              placeholder="Explain what happened, where it happened, and how urgent it is."
              onChange={onChange}
              required
            />
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(220px, 1fr)",
              gap: "16px",
            }}
          >
            <label style={labelStyles}>
              Department
              <select
                style={inputStyles}
                name="department_id"
                value={form.department_id}
                onChange={onChange}
                required
                disabled={departmentsLoading || departments.length === 0}
              >
                <option value="">
                  {departmentsLoading
                    ? "Loading departments..."
                    : departments.length === 0
                      ? "No departments available"
                      : "Select a department"}
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name} - {department.description}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label style={labelStyles}>
            Attachment
            <input
              style={inputStyles}
              type="file"
              name="file"
              onChange={onFileChange}
            />
          </label>

          {error ? (
            <div
              style={{
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

          {departmentsError ? (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                backgroundColor: "#fff7ed",
                color: "#c2410c",
                border: "1px solid #fdba74",
              }}
            >
              {departmentsError}
            </div>
          ) : null}

          {successMessage ? (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                backgroundColor: "#ecfdf5",
                color: "#166534",
                border: "1px solid #bbf7d0",
              }}
            >
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
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
            {loading ? "Submitting complaint..." : "Submit Complaint"}
          </button>
        </form>
      </article>

      <aside
        style={{
          display: "grid",
          gap: "18px",
          alignContent: "start",
        }}
      >
        <article
          style={{
            padding: "24px",
            borderRadius: "24px",
            background: "linear-gradient(180deg, #0f172a 0%, #134e4a 100%)",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              opacity: 0.76,
            }}
          >
            Submission Guide
          </div>
          <h3 style={{ margin: "14px 0 12px", fontSize: "24px" }}>
            Write once, route clearly.
          </h3>
          <p style={{ margin: 0, lineHeight: 1.7, color: "rgba(255,255,255,0.82)" }}>
            Use a short, specific title and include exact details in the description
            so the complaint reaches the right team faster.
          </p>
        </article>

        <article
          style={{
            padding: "22px",
            borderRadius: "24px",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
            border: "1px solid rgba(148, 163, 184, 0.16)",
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: "22px" }}>Current selection</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <div>
              <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px" }}>
                Priority level
              </div>
              <span
                style={{
                  display: "inline-flex",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  ...priorityChipStyles[selectedPriority],
                }}
              >
                {selectedPriority}
              </span>
            </div>
            <div>
              <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px" }}>
                Department
              </div>
              <div style={{ color: "#0f172a", lineHeight: 1.6 }}>
                {selectedDepartment?.name || "Not selected yet"}
              </div>
            </div>
            <div>
              <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px" }}>
                Attachment
              </div>
              <div style={{ color: "#0f172a", lineHeight: 1.6 }}>
                {form.file?.name || "No file attached"}
              </div>
            </div>
          </div>
        </article>
      </aside>
    </section>
  );
}

export default ComplaintComposer;
