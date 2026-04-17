import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80";

function getStatusClass(status) {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  return `status-badge status-${normalized}`;
}

function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/mine");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load booking history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "All") return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "Pending").length,
      active: bookings.filter((booking) =>
        ["Confirmed", "In Progress"].includes(booking.status)
      ).length,
      completed: bookings.filter((booking) => booking.status === "Completed").length,
    }),
    [bookings]
  );

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;

    try {
      const res = await API.put(`/bookings/cancel/${bookingId}`);
      alert(res.data.message);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="page-card">
      <div className="section-heading">
        <span className="service-pill">Booking History</span>
        <h2>Track your service requests</h2>
      </div>

      <div className="worker-summary-grid" style={{ marginTop: "18px" }}>
        <div className="info-card">
          <span className="service-pill theme-default">Total</span>
          <h3>{stats.total}</h3>
          <p>All bookings placed from your account.</p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-electrical">Pending</span>
          <h3>{stats.pending}</h3>
          <p>Requests waiting for confirmation or worker pickup.</p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-installation">Active</span>
          <h3>{stats.active}</h3>
          <p>Bookings currently confirmed or already in progress.</p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-cleaning">Completed</span>
          <h3>{stats.completed}</h3>
          <p>Finished bookings already completed successfully.</p>
        </div>
      </div>

      <div className="filter-row" style={{ marginTop: "18px" }}>
        <label htmlFor="statusFilter">Filter by status</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p style={{ marginTop: "20px" }}>Loading booking history...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state-card">
          <h3>No bookings found</h3>
          <p>Try changing the filter or place your first booking from the services page.</p>
        </div>
      ) : (
        <div className="history-grid">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="worker-job-card"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.92)), url(${booking.image_url || fallbackImage})`,
              }}
            >
              <div className="worker-job-card-content">
                <span className="service-pill">{booking.category || "Service"}</span>
                <h3>{booking.service_name}</h3>
                <p>Date: {booking.booking_date?.split("T")[0] || booking.booking_date}</p>
                <p>Address: {booking.address}</p>
                <p>Phone: {booking.phone_number || "Not provided"}</p>
                <p>Notes: {booking.notes || "None"}</p>
                <p>
                  Status:{" "}
                  <span className={getStatusClass(booking.status)}>
                    {booking.status}
                  </span>
                </p>

                {(booking.status === "Pending" || booking.status === "Confirmed") && (
                  <div className="card-actions" style={{ marginTop: "12px" }}>
                    <button
                      className="danger-btn"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingHistoryPage;