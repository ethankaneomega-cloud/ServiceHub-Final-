import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function BookingHistoryPage({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/bookings/user/${user.id}`);
      setBookings(res.data);
    } catch (error) {
      alert("Failed to load booking history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "All") return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const getStatusClass = (status) => {
    const normalized = status.toLowerCase().replace(/\s+/g, "-");
    return `status-badge status-${normalized}`;
  };

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;

    try {
      const res = await API.put(`/bookings/cancel/${bookingId}`, {
        user_id: user.id
      });
      alert(res.data.message);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  return (
    <div>
      <h2 className="page-title">Booking History</h2>
      <p className="section-subtitle">Track the status of your current and past bookings.</p>

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
        <p className="loading-text">Loading booking history...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p className="muted">No bookings found for this filter.</p>
        </div>
      ) : (
        <div className="card-list">
          {filteredBookings.map((booking) => (
            <div className="info-card" key={booking.id}>
              <h3>{booking.service_name}</h3>
              <p><strong>Date:</strong> {booking.booking_date?.split("T")[0] || booking.booking_date}</p>
              <p><strong>Address:</strong> {booking.address}</p>
              <p><strong>Notes:</strong> {booking.notes || "None"}</p>
              <p><strong>Price:</strong> ₱{Number(booking.price).toFixed(2)}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusClass(booking.status)}>{booking.status}</span>
              </p>

              {(booking.status === "Pending" || booking.status === "Confirmed") && (
                <div className="card-actions">
                  <button className="danger-btn" onClick={() => handleCancel(booking.id)}>
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingHistoryPage;