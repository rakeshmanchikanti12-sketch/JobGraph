import { useEffect, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");

  const [selectedJob, setSelectedJob] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] =
    useState(true);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);

  const cleanEmail = (email) => {
    if (!email) {
      return "";
    }

    let value = String(email).trim();

    const markdownMatch = value.match(
      /^\[([^\]]+)\]\(mailto\\?:[^)]*\)$/i
    );

    if (markdownMatch) {
      return markdownMatch[1].trim();
    }

    const bracketMatch = value.match(
      /\[([^\]]+)\]/
    );

    if (bracketMatch) {
      return bracketMatch[1].trim();
    }

    value = value.replace(
      /\(mailto\\?:[^)]*\)/gi,
      ""
    );

    value = value.replace(/^\[|\]$/g, "");

    return value.trim();
  };

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/jobs/recommended"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      setJobs(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load recommended jobs"
      );

      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/applications"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch applications"
        );
      }

      const data = await response.json();

      const cleanedApplications =
        Array.isArray(data)
          ? data.map((application) => ({
              ...application,
              email: cleanEmail(
                application.email
              ),
              status:
                application.status ||
                "Applied",
            }))
          : [];

      setApplications(cleanedApplications);
      setLoadingApplications(false);
    } catch (error) {
      console.error(error);
      setLoadingApplications(false);
    }
  };

  const locations = [
    "All",
    ...new Set(
      jobs.map((job) => job.location)
    ),
  ];

  const filteredJobs = jobs.filter((job) => {
    const searchText =
      search.toLowerCase();

    const matchesSearch =
      job.title
        .toLowerCase()
        .includes(searchText);

    const matchesLocation =
      location === "All" ||
      job.location === location;

    return (
      matchesSearch &&
      matchesLocation
    );
  });

  const handleApply = (job) => {
    setSelectedJob(job);
    setName("");
    setEmail("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedJob) {
      return;
    }

    setSubmitting(true);

    const application = {
      name: name.trim(),
      email: cleanEmail(email),
      jobTitle: selectedJob.title,
      location: selectedJob.location,
    };

    try {
      const response = await fetch(
        "http://localhost:8081/api/applications",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(application),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            data.message ||
              "You have already applied for this job."
          );
        }

        throw new Error(
          data.message ||
            "Application submission failed"
        );
      }

      alert(
        "Application submitted successfully!\n\n" +
          "Name: " +
          data.name +
          "\n" +
          "Email: " +
          cleanEmail(data.email) +
          "\n" +
          "Job: " +
          data.jobTitle
      );

      setSelectedJob(null);
      setName("");
      setEmail("");

      await loadApplications();
    } catch (error) {
      console.error(
        "Application submission error:",
        error
      );

      alert(
        error.message ||
          "Application could not be submitted to the backend."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openAdminDashboard = () => {
    setShowAdmin(true);
  };

  const closeAdminDashboard = () => {
    setShowAdmin(false);
  };

  return (
    <div style={styles.container}>

      <h1 style={styles.heading}>
        Rakesh's Recommended Jobs
      </h1>

      <div style={styles.adminButtonContainer}>
        <button
          type="button"
          style={styles.adminButton}
          onClick={openAdminDashboard}
        >
          Open Admin Dashboard
        </button>
      </div>

      <div style={styles.filters}>

        <input
          type="text"
          placeholder="Search job title..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          style={styles.search}
        />

        <select
          value={location}
          onChange={(event) =>
            setLocation(event.target.value)
          }
          style={styles.select}
        >
          {locations.map((loc) => (
            <option
              key={loc}
              value={loc}
            >
              {loc}
            </option>
          ))}
        </select>

      </div>

      {loading && (
        <p style={styles.message}>
          Loading jobs...
        </p>
      )}

      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        filteredJobs.length === 0 && (
          <p style={styles.message}>
            No jobs found.
          </p>
        )}

      {!loading && !error && (
        <div style={styles.jobList}>

          {filteredJobs.map(
            (job, index) => (
              <div
                style={styles.card}
                key={
                  job.applicationId ||
                  index
                }
              >

                <h2 style={styles.title}>
                  {job.title}
                </h2>

                <p>
                  <strong>
                    Location:
                  </strong>{" "}
                  {job.location}
                </p>

                <p>
                  <strong>
                    Experience:
                  </strong>{" "}
                  {job.experienceRequired}
                </p>

                <p>
                  <strong>
                    Salary:
                  </strong>{" "}
                  {job.salary}
                </p>

                <p>
                  <strong>
                    Matching Skills:
                  </strong>{" "}
                  {job.matchingSkills}
                </p>

                <button
                  type="button"
                  style={styles.button}
                  onClick={() =>
                    handleApply(job)
                  }
                >
                  Apply Now
                </button>

              </div>
            )
          )}

        </div>
      )}

      <div style={styles.historySection}>

        <h2 style={styles.historyHeading}>
          Application History
        </h2>

        {loadingApplications && (
          <p style={styles.message}>
            Loading applications...
          </p>
        )}

        {!loadingApplications &&
          applications.length === 0 && (
            <p style={styles.message}>
              No applications submitted yet.
            </p>
          )}

        {!loadingApplications &&
          applications.length > 0 && (
            <div style={styles.historyList}>

              {applications.map(
                (application, index) => (
                  <div
                    key={
                      application.applicationId ||
                      index
                    }
                    style={
                      styles.applicationCard
                    }
                  >

                    <h3
                      style={
                        styles.applicationTitle
                      }
                    >
                      {application.jobTitle}
                    </h3>

                    <p>
                      <strong>
                        Name:
                      </strong>{" "}
                      {application.name}
                    </p>

                    <p>
                      <strong>
                        Email:
                      </strong>{" "}
                      {cleanEmail(
                        application.email
                      )}
                    </p>

                    <p>
                      <strong>
                        Location:
                      </strong>{" "}
                      {application.location}
                    </p>

                    <p>
                      <strong>
                        Salary:
                      </strong>{" "}
                      {application.salary}
                    </p>

                    <p>
                      <strong>
                        Applied At:
                      </strong>{" "}
                      {application.appliedAt
                        ? new Date(
                            application.appliedAt
                          ).toLocaleString()
                        : ""}
                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}

                      <span
                        style={{
                          color:
                            application.status ===
                            "Applied"
                              ? "#2563eb"
                              : application.status ===
                                "Shortlisted"
                              ? "#c2410c"
                              : application.status ===
                                "Rejected"
                              ? "#dc2626"
                              : application.status ===
                                "Selected"
                              ? "#15803d"
                              : "#111827",

                          fontWeight:
                            "bold",
                        }}
                      >
                        {application.status ||
                          "Applied"}
                      </span>

                    </p>

                  </div>
                )
              )}

            </div>
          )}

      </div>

      {showAdmin && (
        <div style={styles.adminOverlay}>

          <div style={styles.adminWrapper}>

            <AdminDashboard
              onClose={
                closeAdminDashboard
              }
            />

          </div>

        </div>
      )}

      {selectedJob && (
        <div style={styles.overlay}>

          <div style={styles.formBox}>

            <h2>
              Apply for{" "}
              {selectedJob.title}
            </h2>

            <form
              onSubmit={handleSubmit}
            >

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                required
                style={styles.formInput}
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                style={styles.formInput}
              />

              <button
                type="submit"
                style={
                  styles.submitButton
                }
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Application"}
              </button>

              <button
                type="button"
                style={
                  styles.cancelButton
                }
                onClick={() =>
                  setSelectedJob(null)
                }
                disabled={submitting}
              >
                Cancel
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    padding: "40px 20px",
    fontFamily:
      "Arial, sans-serif",
  },

  heading: {
    textAlign: "center",
    color: "#1f2937",
    marginBottom: "30px",
    fontSize: "42px",
  },

  adminButtonContainer: {
    textAlign: "center",
    marginBottom: "25px",
  },

  adminButton: {
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },

  filters: {
    maxWidth: "800px",
    margin: "0 auto 30px",
    display: "flex",
    gap: "15px",
  },

  search: {
    flex: 1,
    padding: "14px",
    fontSize: "16px",
    border:
      "1px solid #ccc",
    borderRadius: "8px",
  },

  select: {
    padding: "14px",
    fontSize: "16px",
    border:
      "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "white",
  },

  message: {
    textAlign: "center",
    fontSize: "18px",
  },

  error: {
    textAlign: "center",
    color: "red",
    fontSize: "18px",
  },

  jobList: {
    maxWidth: "800px",
    margin: "0 auto",
  },

  card: {
    backgroundColor: "white",
    padding: "25px",
    marginBottom: "20px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.1)",
  },

  title: {
    color: "#111827",
    marginBottom: "15px",
  },

  button: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    marginTop: "10px",
  },

  historySection: {
    maxWidth: "800px",
    margin: "50px auto 0",
  },

  historyHeading: {
    textAlign: "center",
    color: "#1f2937",
    marginBottom: "25px",
    fontSize: "32px",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  applicationCard: {
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.1)",
    borderLeft:
      "5px solid #16a34a",
  },

  applicationTitle: {
    color: "#166534",
    marginBottom: "15px",
  },

  adminOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      "rgba(0,0,0,0.35)",
    overflowY: "auto",
    zIndex: 1000,
    padding: "20px",
    boxSizing: "border-box",
  },

  adminWrapper: {
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },

  formBox: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "400px",
    maxWidth: "90%",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.3)",
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    marginBottom: "15px",
    border:
      "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
  },

  submitButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "10px",
  },

  cancelButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
  },
};

export default App;