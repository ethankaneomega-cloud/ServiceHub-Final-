import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80";

function parseDocuments(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({ name: item, data: item }));
  }

  return [];
}

function isImageValue(value = "") {
  return (
    String(value).startsWith("data:image/") ||
    String(value).match(/\.(png|jpg|jpeg|webp)$/i) ||
    String(value).includes("images.unsplash.com")
  );
}

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

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const bookingStatuses = [
    "Pending",
    "Confirmed",
    "In Progress",
    "Completed",
    "Cancelled",
  ];

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await API.get("/admin/bookings");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await API.get("/admin/users/pending");
      setPendingUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load pending users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchPendingUsers();
  }, []);

  const bookingStats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((item) => item.status === "Pending").length,
      active: bookings.filter((item) =>
        ["Confirmed", "In Progress"].includes(item.status)
      ).length,
      completed: bookings.filter((item) => item.status === "Completed").length,
    }),
    [bookings]
  );

  const handleApprove = async (userId) => {
    try {
      const res = await API.put(`/admin/users/${userId}/approve`, {
        approval_notes: "Approved after review",
      });
      alert(res.data.message);
      fetchPendingUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve user");
    }
  };

  const handleReject = async (userId) => {
    const approvalNotes = window.prompt("Enter rejection note:");
    if (approvalNotes === null) return;

    try {
      const res = await API.put(`/admin/users/${userId}/reject`, {
        approval_notes: approvalNotes,
      });
      alert(res.data.message);
      fetchPendingUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject user");
    }
  };

  const handleResubmission = async (userId) => {
    const approvalNotes = window.prompt("Enter resubmission note:");
    if (approvalNotes === null) return;

    try {
      const res = await API.put(`/admin/users/${userId}/resubmission`, {
        approval_notes: approvalNotes,
      });
      alert(res.data.message);
      fetchPendingUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to request resubmission");
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      const res = await API.put(`/admin/bookings/${bookingId}`, { status });
      alert(res.data.message);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update booking status");
    }
  };

  return (
    <div className="page-card">
      <div className="section-heading">
        <span className="service-pill">Admin Dashboard</span>
        <h2>Approvals and booking operations</h2>
      </div>

      <div className="worker-summary-grid" style={{ marginTop: "18px" }}>
        <div className="info-card">
          <span className="service-pill theme-default">Pending Applications</span>
          <h3>{pendingUsers.length}</h3>
          <p>Accounts that still need approval, rejection, or resubmission feedback.</p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-electrical">Pending Bookings</span>
          <h3>{bookingStats.pending}</h3>
          <p>Customer bookings still waiting for progress or confirmation.</p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-installation">Active Bookings</span>
          <h3>{bookingStats.active}</h3>
          <p>Bookings already confirmed or currently in progress.</p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-cleaning">Completed</span>
          <h3>{bookingStats.completed}</h3>
          <p>Finished bookings already marked complete in the system.</p>
        </div>
      </div>

      <div className="worker-grid-2" style={{ marginTop: "20px" }}>
        <section className="dashboard-section">
          <div className="section-heading">
            <span className="service-pill">Applications</span>
            <h2>Pending account reviews</h2>
          </div>

          {loadingUsers ? (
            <p>Loading pending users...</p>
          ) : pendingUsers.length === 0 ? (
            <div className="empty-state-card">
              <h3>No pending registrations</h3>
              <p>All current applications have already been reviewed.</p>
            </div>
          ) : (
            pendingUsers.map((user) => {
              const documents = parseDocuments(user.worker_documents || user.document_links);

              return (
                <div key={user.id} className="info-card" style={{ marginTop: "16px" }}>
                  <span
                    className={`service-pill ${
                      user.role === "worker" ? "theme-moving" : "theme-installation"
                    }`}
                  >
                    {user.role}
                  </span>

                  <h3>{user.full_name}</h3>
                  <p>Email: {user.email}</p>
                  {user.service_category && <p>Service Category: {user.service_category}</p>}
                  <p>Status: {user.approval_status}</p>
                  <p>Credentials: {user.credentials_summary || "None"}</p>

                  {user.valid_id_image && isImageValue(user.valid_id_image) && (
                    <div
                      className="service-preview"
                      style={{
                        minHeight: "160px",
                        marginTop: "12px",
                        backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.9)), url(${user.valid_id_image})`,
                      }}
                    >
                      <span>Valid ID</span>
                    </div>
                  )}

                  {documents.length > 0 && (
                    <div className="upload-preview-grid" style={{ marginTop: "12px" }}>
                      {documents.map((file, index) => (
                        <div key={`${user.id}-${index}`} className="info-card">
                          {isImageValue(file.data) ? (
                            <div
                              className="service-preview"
                              style={{
                                minHeight: "140px",
                                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.9)), url(${file.data})`,
                              }}
                            >
                              <span>{file.name || `Document ${index + 1}`}</span>
                            </div>
                          ) : (
                            <>
                              <h3>{file.name || `Document ${index + 1}`}</h3>
                              <p>{String(file.data)}</p>
                              {String(file.data).startsWith("http") && (
                                <a
                                  href={file.data}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: "#93c5fd" }}
                                >
                                  Open document
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="card-actions" style={{ marginTop: "14px" }}>
                    <button className="primary-btn" onClick={() => handleApprove(user.id)}>
                      Approve
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => handleResubmission(user.id)}
                    >
                      Needs Resubmission
                    </button>
                    <button className="danger-btn" onClick={() => handleReject(user.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <span className="service-pill">Bookings</span>
            <h2>Customer booking monitor</h2>
          </div>

          {loadingBookings ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <div className="empty-state-card">
              <h3>No bookings found</h3>
              <p>Bookings will appear here once customers start placing requests.</p>
            </div>
          ) : (
            <div className="job-grid">
              {bookings.map((booking) => {
                const themeClass = getCategoryThemeClass(
                  booking.category,
                  booking.service_name
                );

                return (
                  <div
                    key={booking.id}
                    className="worker-job-card"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.92)), url(${booking.image_url || fallbackImage})`,
                    }}
                  >
                    <div className="worker-job-card-content">
                      <span className={`service-pill ${themeClass}`}>
                        {booking.category || "Service"}
                      </span>

                      <h3>{booking.service_name}</h3>
                      <p>Customer: {booking.full_name}</p>
                      <p>Email: {booking.email}</p>
                      <p>Phone: {booking.phone_number || "Not provided"}</p>
                      <p>Date: {booking.booking_date?.split("T")[0] || booking.booking_date}</p>
                      <p>Address: {booking.address}</p>
                      <p>Notes: {booking.notes || "None"}</p>
                      <p>Worker: {booking.worker_name || "Unclaimed"}</p>
                      <p>Worker Status: {booking.worker_job_status || "Not started"}</p>

                      <div className="card-actions" style={{ marginTop: "12px" }}>
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        >
                          {bookingStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminBookingsPage;