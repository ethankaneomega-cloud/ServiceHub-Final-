import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/bookings");
      setBookings(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load all bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (statusFilter === "All") return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const getStatusClass = (status) => {
    const normalized = status.toLowerCase().replace(/\s+/g, "-");
    return `status-badge status-${normalized}`;
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await API.put(`/admin/bookings/${bookingId}`, { status });
      alert("Booking status updated");
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div>
      <h2 className="page-title">Admin - Manage Bookings</h2>
      <p className="section-subtitle">Review bookings and update customer service progress.</p>

      <div className="toolbar" style={{ gridTemplateColumns: "220px" }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p className="muted">No bookings found for this filter.</p>
        </div>
      ) : (
        <div className="card-list">
          {filteredBookings.map((booking) => (
            <div className="info-card" key={booking.id}>
              <h3>{booking.service_name}</h3>
              <p><strong>Customer:</strong> {booking.full_name}</p>
              <p><strong>Email:</strong> {booking.email}</p>
              <p><strong>Date:</strong> {booking.booking_date?.split("T")[0] || booking.booking_date}</p>
              <p><strong>Address:</strong> {booking.address}</p>
              <p><strong>Notes:</strong> {booking.notes || "None"}</p>
              <p><strong>Price:</strong> ₱{Number(booking.price).toFixed(2)}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusClass(booking.status)}>{booking.status}</span>
              </p>

              <div className="card-actions">
                <button className="primary-btn" onClick={() => updateStatus(booking.id, "Confirmed")}>
                  Confirm
                </button>
                <button className="secondary-btn" onClick={() => updateStatus(booking.id, "In Progress")}>
                  In Progress
                </button>
                <button className="primary-btn" onClick={() => updateStatus(booking.id, "Completed")}>
                  Complete
                </button>
                <button className="danger-btn" onClick={() => updateStatus(booking.id, "Cancelled")}>
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminBookingsPage;