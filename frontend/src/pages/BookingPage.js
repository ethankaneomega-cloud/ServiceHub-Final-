import React, { useState } from "react";
import API from "../services/api";

function BookingPage({ user, service, onBackToServices }) {
  const [form, setForm] = useState({
    booking_date: "",
    address: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.booking_date || !form.address) {
      alert("Please fill in the booking date and address");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        user_id: user.id,
        service_id: service.id,
        booking_date: form.booking_date,
        address: form.address,
        notes: form.notes
      };

      const res = await API.post("/bookings", payload);
      alert(res.data.message);

      setForm({
        booking_date: "",
        address: "",
        notes: ""
      });

      onBackToServices();
    } catch (error) {
      alert(error.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Complete Your Booking</h2>
      <p className="section-subtitle">Review the service and choose your preferred date.</p>

      <div className="info-card" style={{ marginBottom: "18px" }}>
        <span className="service-pill">{service.category || "Service"}</span>
        <h3>{service.service_name}</h3>
        <p>{service.description}</p>
        <span className="price-tag">₱{Number(service.price).toFixed(2)}</span>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="inline-form-row">
          <input
            type="date"
            name="booking_date"
            value={form.booking_date}
            onChange={handleChange}
          />
          <input
            type="text"
            value={user.full_name}
            readOnly
            placeholder="Customer"
          />
        </div>

        <textarea
          name="address"
          placeholder="Enter full address"
          value={form.address}
          onChange={handleChange}
        />

        <textarea
          name="notes"
          placeholder="Additional notes"
          value={form.notes}
          onChange={handleChange}
        />

        <div className="card-actions">
          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Confirm Booking"}
          </button>
          <button className="secondary-btn" type="button" onClick={onBackToServices}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingPage;