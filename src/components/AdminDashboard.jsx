import { useEffect, useState } from "react";

function AdminDashboard({ onClose }) {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
  });

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const cleanEmail = (email) => {
    if (!email) {
      return "";
    }

    const value = String(email).trim();

    const match = value.match(/^\[([^\]]+)\]/);

    if (match) {
      return match[1].trim();
    }

    return value;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, applicationsResponse] =
        await Promise.all([
          fetch("http://localhost:8081/api/admin/stats"),
          fetch("http://localhost:8081/api/applications"),
        ]);

      if (!statsResponse.ok) {
        throw new Error("Failed to load statistics");
      }

      if (!applicationsResponse.ok) {
        throw new Error("Failed to load applications");
      }

      const statsData = await statsResponse.json();
      const applicationsData =
        await applicationsResponse.json();

      setStats({
        totalJobs: statsData.totalJobs ?? 0,
        totalApplications:
          statsData.totalApplications ?? 0,
      });

      setApplications(
        Array.isArray(applicationsData)
          ? applicationsData.map((application) => ({
              ...application,
              applicationId:
                application.applicationId,
              email: cleanEmail(application.email),
              status:
                application.status || "Applied",
            }))
          : []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load Admin Dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    application,
    newStatus
  ) => {
    try {
      setUpdating(true);
      setError("");

      if (!application.applicationId) {
        throw new Error(
          "Application ID is required"
        );
      }

      const response = await fetch(
        "http://localhost:8081/api/applications/status",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId:
              application.applicationId,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update status"
        );
      }

      setApplications((current) =>
        current.map((item) => {
          if (
            item.applicationId ===
            application.applicationId
          ) {
            return {
              ...item,
              status: newStatus,
            };
          }

          return item;
        })
      );

      alert(
        `Application status changed to ${newStatus}`
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Shortlisted":
        return {
          backgroundColor: "#fff7ed",
          color: "#c2410c",
          borderColor: "#fb923c",
        };

      case "Rejected":
        return {
          backgroundColor: "#fef2f2",
          color: "#dc2626",
          borderColor: "#f87171",
        };

      case "Selected":
        return {
          backgroundColor: "#f0fdf4",
          color: "#15803d",
          borderColor: "#4ade80",
        };

      default:
        return {
          backgroundColor: "#eff6ff",
          color: "#2563eb",
          borderColor: "#60a5fa",
        };
    }
  };

  const statusCounts = {
    Applied: applications.filter(
      (application) =>
        application.status === "Applied"
    ).length,

    Shortlisted: applications.filter(
      (application) =>
        application.status === "Shortlisted"
    ).length,

    Rejected: applications.filter(
      (application) =>
        application.status === "Rejected"
    ).length,

    Selected: applications.filter(
      (application) =>
        application.status === "Selected"
    ).length,
  };

  return (
    <section style={styles.container}>

      <div style={styles.header}>
        <h2 style={styles.heading}>
          Admin Dashboard
        </h2>

        <button
          type="button"
          onClick={onClose}
          style={styles.closeButton}
        >
          Close Dashboard
        </button>
      </div>

      {loading && (
        <p style={styles.message}>
          Loading dashboard...
        </p>
      )}

      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div style={styles.statsGrid}>

            <div style={styles.statCard}>
              <div style={styles.statNumber}>
                {stats.totalJobs}
              </div>

              <div style={styles.statLabel}>
                Total Jobs
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statNumber}>
                {stats.totalApplications}
              </div>

              <div style={styles.statLabel}>
                Total Applications
              </div>
            </div>

          </div>

          <div style={styles.statusGrid}>

            <div
              style={{
                ...styles.statusCard,
                ...styles.appliedCard,
              }}
            >
              <div style={styles.statusNumber}>
                {statusCounts.Applied}
              </div>

              <div style={styles.statusLabel}>
                Applied
              </div>
            </div>

            <div
              style={{
                ...styles.statusCard,
                ...styles.shortlistedCard,
              }}
            >
              <div style={styles.statusNumber}>
                {statusCounts.Shortlisted}
              </div>

              <div style={styles.statusLabel}>
                Shortlisted
              </div>
            </div>

            <div
              style={{
                ...styles.statusCard,
                ...styles.rejectedCard,
              }}
            >
              <div style={styles.statusNumber}>
                {statusCounts.Rejected}
              </div>

              <div style={styles.statusLabel}>
                Rejected
              </div>
            </div>

            <div
              style={{
                ...styles.statusCard,
                ...styles.selectedCard,
              }}
            >
              <div style={styles.statusNumber}>
                {statusCounts.Selected}
              </div>

              <div style={styles.statusLabel}>
                Selected
              </div>
            </div>

          </div>

          <h3 style={styles.recentHeading}>
            Recent Applications
          </h3>

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>
                <tr>

                  <th style={styles.tableHeader}>
                    Name
                  </th>

                  <th style={styles.tableHeader}>
                    Email
                  </th>

                  <th style={styles.tableHeader}>
                    Job
                  </th>

                  <th style={styles.tableHeader}>
                    Location
                  </th>

                  <th style={styles.tableHeader}>
                    Salary
                  </th>

                  <th style={styles.tableHeader}>
                    Status
                  </th>

                  <th style={styles.tableHeader}>
                    Applied At
                  </th>

                </tr>
              </thead>

              <tbody>

                {applications.map(
                  (application) => (

                    <tr
                      key={
                        application.applicationId
                      }
                    >

                      <td style={styles.tableCell}>
                        {application.name}
                      </td>

                      <td style={styles.tableCell}>
                        {application.email}
                      </td>

                      <td style={styles.tableCell}>
                        {application.jobTitle}
                      </td>

                      <td style={styles.tableCell}>
                        {application.location}
                      </td>

                      <td style={styles.tableCell}>
                        {application.salary}
                      </td>

                      <td style={styles.tableCell}>

                        <select
                          value={
                            application.status ||
                            "Applied"
                          }
                          disabled={updating}
                          onChange={(event) =>
                            updateStatus(
                              application,
                              event.target.value
                            )
                          }
                          style={{
                            ...styles.statusSelect,
                            ...getStatusStyle(
                              application.status
                            ),
                          }}
                        >

                          <option value="Applied">
                            Applied
                          </option>

                          <option value="Shortlisted">
                            Shortlisted
                          </option>

                          <option value="Rejected">
                            Rejected
                          </option>

                          <option value="Selected">
                            Selected
                          </option>

                        </select>

                      </td>

                      <td style={styles.tableCell}>
                        {new Date(
                          application.appliedAt
                        ).toLocaleString()}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        </>
      )}

    </section>
  );
}

const styles = {

  container: {
    maxWidth: "1100px",
    margin: "50px auto 0",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "14px",
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.12)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  heading: {
    margin: 0,
    color: "#111827",
  },

  closeButton: {
    backgroundColor: "#6b7280",
    color: "#ffffff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  statCard: {
    backgroundColor: "#f3f4f6",
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
  },

  statNumber: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#2563eb",
  },

  statLabel: {
    marginTop: "8px",
    color: "#374151",
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },

  statusCard: {
    padding: "18px",
    borderRadius: "10px",
    textAlign: "center",
    border: "1px solid",
  },

  statusNumber: {
    fontSize: "28px",
    fontWeight: "bold",
  },

  statusLabel: {
    marginTop: "5px",
    fontWeight: "600",
  },

  appliedCard: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    borderColor: "#60a5fa",
  },

  shortlistedCard: {
    backgroundColor: "#fff7ed",
    color: "#c2410c",
    borderColor: "#fb923c",
  },

  rejectedCard: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderColor: "#f87171",
  },

  selectedCard: {
    backgroundColor: "#f0fdf4",
    color: "#15803d",
    borderColor: "#4ade80",
  },

  recentHeading: {
    color: "#1f2937",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  tableHeader: {
    backgroundColor: "#1f2937",
    color: "#ffffff",
    padding: "12px",
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  tableCell: {
    padding: "12px",
    borderBottom:
      "1px solid #e5e7eb",
    color: "#374151",
    whiteSpace: "nowrap",
  },

  statusSelect: {
    padding: "7px 10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontWeight: "600",
  },

  message: {
    textAlign: "center",
    color: "#374151",
  },

  error: {
    color: "#dc2626",
    textAlign: "center",
  },
};

export default AdminDashboard;