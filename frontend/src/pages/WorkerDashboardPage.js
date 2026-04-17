import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const fallbackJobImage =
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80";

function getCategoryThemeClass(category = "", serviceName = "") {
  const text = `${category} ${serviceName}`.toLowerCase();

  if (text.includes("repair") || text.includes("handy")) return "theme-repair";
  if (text.includes("install") || text.includes("assembl")) return "theme-installation";
  if (text.includes("clean")) return "theme-cleaning";
  if (text.includes("plumb") || text.includes("water")) return "theme-plumbing";
  if (text.includes("electric")) return "theme-electrical";
  if (text.includes("paint")) return "theme-painting";
  if (text.includes("move") || text.includes("haul")) return "theme-moving";
  if (text.includes("maint") || text.includes("aircon")) return "theme-maintenance";

  return "theme-default";
}

function WorkerDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    service_category: "",
    credentials_summary: "",
    valid_id_image: "",
    worker_documents: "",
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/worker/dashboard");
      const data = res.data || {};

      setDashboard(data);

      const worker = data.worker || {};

      setProfileForm({
        full_name: worker.full_name || "",
        service_category: worker.service_category || "",
        credentials_summary: worker.credentials_summary || "",
        valid_id_image: worker.valid_id_image || "",
        worker_documents:
          Array.isArray(worker.worker_documents) && worker.worker_documents.length > 0
            ? JSON.stringify(worker.worker_documents)
            : "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load worker dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const worker = dashboard?.worker || {};
  const summary = dashboard?.summary || {};

  const notifications = Array.isArray(dashboard?.notifications)
    ? dashboard.notifications
    : [];

  const openJobs = Array.isArray(dashboard?.openJobs)
    ? dashboard.openJobs
    : [];

  const activeJobs = Array.isArray(dashboard?.activeJobs)
    ? dashboard.activeJobs
    : Array.isArray(dashboard?.incomingJobs)
    ? dashboard.incomingJobs
    : [];

  const history = Array.isArray(dashboard?.history) ? dashboard.history : [];
  const reviews = Array.isArray(dashboard?.reviews) ? dashboard.reviews : [];

  const verificationText = useMemo(() => {
    const status = worker.approval_status;

    if (status === "pending") return "Pending Review";
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    if (status === "needs_resubmission") return "Needs Resubmission";

    return status || "Unknown";
  }, [worker.approval_status]);

  const isApproved = worker.approval_status === "approved";
  const availability = worker.availability_status || "unavailable";

  const toggleAvailability = async () => {
    try {
      const nextStatus = availability === "available" ? "unavailable" : "available";
      const res = await API.put("/worker/availability", {
        availability_status: nextStatus,
      });
      alert(res.data.message);
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update availability");
    }
  };

  const acceptOpenJob = async (jobId) => {
    try {
      const res = await API.put(`/worker/jobs/${jobId}/accept`);
      alert(res.data.message);
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to accept booking");
    }
  };

  const handleJobStatus = async (jobId, status) => {
    try {
      const res = await API.put(`/worker/jobs/${jobId}/status`, { status });
      alert(res.data.message);
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update job");
    }
  };

  const handleChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleValidIdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setProfileForm((prev) => ({
        ...prev,
        valid_id_image: dataUrl,
      }));
    } catch (error) {
      alert("Failed to read valid ID image.");
    }
  };

  const handleSupportingUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const converted = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type,
          data: await fileToDataUrl(file),
        }))
      );

      setProfileForm((prev) => ({
        ...prev,
        worker_documents: JSON.stringify(converted),
      }));
    } catch (error) {
      alert("Failed to read supporting files.");
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      const res = await API.put("/worker/profile", profileForm);
      alert(res.data.message);
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="page-card">
        <span className="service-pill">Worker</span>
        <h2>Loading worker dashboard...</h2>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="page-card">
        <span className="service-pill">Worker</span>
        <h2>Unable to load worker dashboard.</h2>
      </div>
    );
  }

  return (
    <div className="worker-dashboard-shell">
      <section className="worker-status-hero">
        <div className="worker-status-copy">
          <span className="service-pill">Worker Dashboard</span>
          <h2>{worker.full_name || "Worker"}</h2>
          <p>
            Handle onboarding, manage your availability, and review open and active
            jobs through one provider-style dashboard.
          </p>

          <div className="worker-status-row">
            <span className="worker-status-chip">{verificationText}</span>
            <span className="worker-status-chip">
              {availability === "available" ? "Available" : "Unavailable"}
            </span>
            <span className={`service-pill ${getCategoryThemeClass(worker.service_category)}`}>
              {worker.service_category || "No service category yet"}
            </span>
          </div>

          <div className="card-actions" style={{ marginTop: "16px" }}>
            <button
              className="primary-btn"
              type="button"
              onClick={toggleAvailability}
              disabled={!isApproved}
            >
              {availability === "available" ? "Go Unavailable" : "Go Available"}
            </button>
          </div>

          {!isApproved && (
            <p className="worker-limited-note">
              Limited access: update your profile and wait for approval before
              accepting customer bookings.
            </p>
          )}
        </div>
      </section>

      <div className="worker-summary-grid">
        <div className="info-card">
          <span className="service-pill theme-maintenance">Open Jobs</span>
          <h3>{Number(summary.openJobs ?? openJobs.length ?? 0)}</h3>
          <p>Customer bookings that are still available for workers to accept.</p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-installation">Active Jobs</span>
          <h3>{Number(summary.activeJobs ?? activeJobs.length ?? 0)}</h3>
          <p>Assigned bookings that still need progress updates or completion.</p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-cleaning">Completed Jobs</span>
          <h3>{Number(summary.completedJobs ?? 0)}</h3>
          <p>Total jobs already completed under your worker account.</p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-repair">Total Earnings</span>
          <h3>₱{Number(summary.totalEarnings ?? 0).toFixed(2)}</h3>
          <p>Current completed-job income summary from finished bookings.</p>
        </div>
      </div>

      <section className="worker-grid-2">
        <div className="dashboard-section">
          <div className="section-heading">
            <span className="service-pill">Notifications</span>
            <h2>Updates and reminders</h2>
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state-card">
              <h3>No notifications right now</h3>
              <p>Important worker updates will appear here.</p>
            </div>
          ) : (
            notifications.map((item, index) => (
              <div key={`${item.title}-${index}`} className="info-card">
                <span className="service-pill theme-default">{item.type || "Update"}</span>
                <h3>{item.title}</h3>
                <p>{item.message}</p>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-heading">
            <span className="service-pill">Profile</span>
            <h2>Verification and details</h2>
          </div>

          <form onSubmit={saveProfile} className="form-card">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={profileForm.full_name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="service_category"
              placeholder="Service Category"
              value={profileForm.service_category}
              onChange={handleChange}
            />

            <textarea
              name="credentials_summary"
              placeholder="Credentials Summary"
              value={profileForm.credentials_summary}
              onChange={handleChange}
            />

            <label className="upload-label">
              <strong>Replace Valid ID</strong>
              <span className="field-hint">Upload a clearer valid ID image if needed.</span>
              <input type="file" accept="image/*" onChange={handleValidIdUpload} />
            </label>

            {profileForm.valid_id_image && (
              <div
                className="service-preview"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.9)), url(${profileForm.valid_id_image})`,
                }}
              >
                <span>Valid ID Preview</span>
              </div>
            )}

            <label className="upload-label">
              <strong>Replace Supporting Documents</strong>
              <span className="field-hint">
                Update certificates, proof, or other supporting files.
              </span>
              <input type="file" accept="image/*" multiple onChange={handleSupportingUpload} />
            </label>

            <div className="card-actions">
              <button className="primary-btn" type="submit">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <span className="service-pill">Open Bookings</span>
          <h2>Available customer requests</h2>
        </div>

        {openJobs.length === 0 ? (
          <div className="empty-state-card">
            <h3>No open bookings right now</h3>
            <p>Check back later or go available to receive upcoming work faster.</p>
          </div>
        ) : (
          <div className="job-grid">
            {openJobs.map((job) => {
              const themeClass = getCategoryThemeClass(job.category, job.service_name);

              return (
                <div
                  key={job.id}
                  className="worker-job-card"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.92)), url(${job.image_url || fallbackJobImage})`,
                  }}
                >
                  <div className="worker-job-card-content">
                    <span className={`service-pill ${themeClass}`}>
                      {job.category || "Service"}
                    </span>
                    <h3>{job.service_name}</h3>
                    <p>Customer: {job.customer_name}</p>
                    <p>Phone: {job.phone_number || "Not provided"}</p>
                    <p>Date: {job.booking_date?.split("T")[0] || job.booking_date}</p>
                    <p>Address: {job.address}</p>
                    <p>Notes: {job.notes || "None"}</p>

                    <div className="worker-job-footer">
                      <strong>₱{Number(job.price || 0).toFixed(2)}</strong>
                      <button
                        className={`primary-btn service-action-btn ${themeClass}`}
                        disabled={!isApproved || availability !== "available"}
                        onClick={() => acceptOpenJob(job.id)}
                      >
                        Accept Booking
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <span className="service-pill">Active Work</span>
          <h2>Assigned and in-progress jobs</h2>
        </div>

        {activeJobs.length === 0 ? (
          <div className="empty-state-card">
            <h3>No assigned jobs yet</h3>
            <p>Accepted bookings will appear here for progress updates.</p>
          </div>
        ) : (
          <div className="job-grid">
            {activeJobs.map((job) => {
              const themeClass = getCategoryThemeClass(job.category, job.service_name);

              return (
                <div
                  key={job.id}
                  className="worker-job-card"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.92)), url(${job.image_url || fallbackJobImage})`,
                  }}
                >
                  <div className="worker-job-card-content">
                    <span className={`service-pill ${themeClass}`}>
                      {job.worker_job_status || "Assigned"}
                    </span>
                    <h3>{job.service_name}</h3>
                    <p>Customer: {job.customer_name}</p>
                    <p>Phone: {job.phone_number || "Not provided"}</p>
                    <p>Date: {job.booking_date?.split("T")[0] || job.booking_date}</p>
                    <p>Address: {job.address}</p>
                    <p>Notes: {job.notes || "None"}</p>

                    <div className="card-actions" style={{ marginTop: "12px" }}>
                      {job.worker_job_status === "Accepted" && (
                        <button
                          className={`primary-btn service-action-btn ${themeClass}`}
                          onClick={() => handleJobStatus(job.id, "In Progress")}
                        >
                          Start Job
                        </button>
                      )}

                      {job.worker_job_status === "In Progress" && (
                        <button
                          className={`primary-btn service-action-btn ${themeClass}`}
                          onClick={() => handleJobStatus(job.id, "Completed")}
                        >
                          Complete Job
                        </button>
                      )}

                      {job.worker_job_status !== "Completed" &&
                        job.worker_job_status !== "Cancelled" && (
                          <button
                            className="danger-btn"
                            onClick={() => handleJobStatus(job.id, "Cancelled")}
                          >
                            Cancel Job
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="worker-dashboard-grid">
        <div className="dashboard-section">
          <div className="section-heading">
            <span className="service-pill">History</span>
            <h2>Completed and cancelled jobs</h2>
          </div>

          {history.length === 0 ? (
            <div className="empty-state-card">
              <h3>No completed or cancelled jobs yet</h3>
              <p>Your finished job records will appear here.</p>
            </div>
          ) : (
            history.map((job) => (
              <div key={job.id} className="info-card">
                <span className="service-pill theme-default">{job.worker_job_status}</span>
                <h3>{job.service_name}</h3>
                <p>Customer: {job.customer_name}</p>
                <p>Phone: {job.phone_number || "Not provided"}</p>
                <p>Completed: {job.completed_at ? job.completed_at.split("T")[0] : "—"}</p>
                <p>Earned: ₱{Number(job.price || 0).toFixed(2)}</p>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-heading">
            <span className="service-pill">Ratings</span>
            <h2>Reviews and performance</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="empty-state-card">
              <h3>No ratings or reviews yet</h3>
              <p>Customer feedback will appear here after completed jobs.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.booking_id} className="info-card">
                <span className="service-pill theme-cleaning">Rating</span>
                <h3>{review.service_name}</h3>
                <p>Rating: {review.rating}/5</p>
                <p>{review.review_text || "No written review."}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default WorkerDashboardPage;