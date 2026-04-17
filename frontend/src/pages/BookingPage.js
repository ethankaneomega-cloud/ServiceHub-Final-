import React, { useMemo, useState } from "react";
import API from "../services/api";

const CEBU_LOCATIONS = [
  "Cebu City",
  "Mandaue City",
  "Lapu-Lapu City",
  "Talisay City",
  "Naga City, Cebu",
  "Carcar City",
  "Danao City",
  "Toledo City",
  "Minglanilla",
  "Consolacion",
  "Liloan",
  "Cordova",
  "Compostela",
  "San Fernando",
  "Tayud",
];

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

function getServiceImage(service) {
  if (service.image_url) return service.image_url;

  const text = `${service.category || ""} ${service.service_name || ""}`.toLowerCase();

  if (text.includes("clean")) {
    return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80";
  }

  if (text.includes("install") || text.includes("assembl")) {
    return "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80";
  }

  if (text.includes("plumb")) {
    return "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80";
  }

  if (text.includes("electric")) {
    return "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80";
  }

  if (text.includes("repair") || text.includes("handy")) {
    return "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80";
  }

  return "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80";
}

function BookingPage({ service, onBackToServices }) {
  const [form, setForm] = useState({
    booking_date: "",
    cebu_location: "",
    address_detail: "",
    phone_number: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const themeClass = getCategoryThemeClass(service.category, service.service_name);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.booking_date ||
      !form.cebu_location ||
      !form.address_detail ||
      !form.phone_number
    ) {
      alert("Please complete the Cebu address and phone verification fields.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        service_id: service.id,
        booking_date: form.booking_date,
        cebu_location: form.cebu_location,
        address_detail: form.address_detail,
        phone_number: form.phone_number,
        notes: form.notes,
      };

      const res = await API.post("/bookings", payload);
      alert(res.data.message);

      setForm({
        booking_date: "",
        cebu_location: "",
        address_detail: "",
        phone_number: "",
        notes: "",
      });

      onBackToServices();
    } catch (error) {
      alert(error.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero-grid">
      <section
        className="hero-copy"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10, 18, 38, 0.7), rgba(10, 18, 38, 0.92)), url(${getServiceImage(
            service
          )})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className={`service-pill ${themeClass}`}>
          {service.category || "Service"}
        </span>
        <h2>{service.service_name}</h2>
        <p>{service.description || "No description provided."}</p>

        <div className="trust-strip" style={{ marginTop: "20px" }}>
          <div className="info-card">
            <span className="service-pill theme-default">Coverage</span>
            <h3>Cebu-only booking</h3>
            <p>Select your city or municipality first, then add full address details.</p>
          </div>

          <div className="info-card">
            <span className="service-pill theme-installation">Verification</span>
            <h3>Phone confirmation</h3>
            <p>Include a reachable phone number for call verification and coordination.</p>
          </div>

          <div className="info-card">
            <span className="service-pill theme-cleaning">Booking value</span>
            <h3>₱{Number(service.price || 0).toFixed(2)}</h3>
            <p>Transparent service pricing shown before you confirm the request.</p>
          </div>
        </div>
      </section>

      <section className="page-card booking-page">
        <span className="service-pill">Booking Form</span>
        <h2>Confirm your booking</h2>
        <p>
          Complete your Cebu location, detailed address, and phone number before
          submitting your request.
        </p>

        <form onSubmit={handleSubmit} className="form-card">
          <input
            type="date"
            name="booking_date"
            value={form.booking_date}
            min={today}
            onChange={handleChange}
            required
          />

          <select
            name="cebu_location"
            value={form.cebu_location}
            onChange={handleChange}
            required
          >
            <option value="">Select Cebu location</option>
            {CEBU_LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <textarea
            name="address_detail"
            placeholder="House number, street, barangay, landmark"
            value={form.address_detail}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone_number"
            placeholder="Phone number for call verification"
            value={form.phone_number}
            onChange={handleChange}
            required
          />

          <textarea
            name="notes"
            placeholder="Additional notes"
            value={form.notes}
            onChange={handleChange}
          />

          <div className="card-actions">
            <button
              className={`primary-btn service-action-btn ${themeClass}`}
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Confirm Booking"}
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={onBackToServices}
            >
              Back
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default BookingPage;