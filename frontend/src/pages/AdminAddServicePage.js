import React, { useMemo, useState } from "react";
import API from "../services/api";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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

function getFallbackImage(category = "", serviceName = "") {
  const text = `${category} ${serviceName}`.toLowerCase();

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

function AdminAddServicePage() {
  const [form, setForm] = useState({
    service_name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const themeClass = useMemo(
    () => getCategoryThemeClass(form.category, form.service_name),
    [form.category, form.service_name]
  );

  const previewImage = form.image_url || getFallbackImage(form.category, form.service_name);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({
        ...prev,
        image_url: dataUrl,
      }));
    } catch (error) {
      alert("Failed to read image file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service_name || !form.price) {
      alert("Service name and price are required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        service_name: form.service_name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image_url: form.image_url,
        is_active: form.is_active ? 1 : 0,
      };

      const res = await API.post("/admin/services", payload);
      alert(res.data.message);

      setForm({
        service_name: "",
        description: "",
        price: "",
        category: "",
        image_url: "",
        is_active: true,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-grid">
      <section className="page-card">
        <span className="service-pill">New Service</span>
        <h2>Add a platform-ready service card</h2>
        <p>
          Create a service with a stronger visual presentation, background image
          support, category-based color theme, and better fallback handling.
        </p>

        <form onSubmit={handleSubmit} className="form-card">
          <input
            type="text"
            name="service_name"
            placeholder="Service Name"
            value={form.service_name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />

          <input
            type="text"
            name="image_url"
            placeholder="Paste image URL"
            value={form.image_url}
            onChange={handleChange}
          />

          <label className="upload-label">
            <strong>Upload Background Image</strong>
            <span className="field-hint">
              Use a relevant, professional service image for better platform-wide appearance.
            </span>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>

          <label className="service-switch">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            Active service
          </label>

          <div className="card-actions">
            <button
              className={`primary-btn service-action-btn ${themeClass}`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Add Service"}
            </button>
          </div>
        </form>
      </section>

      <section className="page-card">
        <span className={`service-pill ${themeClass}`}>Live Preview</span>
        <h2>Service card preview</h2>
        <p>
          This preview shows how the new service can look across customer, worker,
          and admin views after saving.
        </p>

        <div
          className="admin-service-card"
          style={{
            marginTop: "20px",
            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.92)), url(${previewImage})`,
          }}
        >
          <div className="admin-service-card-content">
            <div className="admin-service-topline">
              <span className={`service-pill ${themeClass}`}>
                {form.category || "Service"}
              </span>
              <span className={`service-pill ${form.is_active ? "theme-cleaning" : "theme-repair"}`}>
                {form.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <h3>{form.service_name || "Service Name"}</h3>
            <p>{form.description || "Service description will appear here."}</p>

            <div className="admin-service-footer">
              <div>
                <strong>₱{Number(form.price || 0).toFixed(2)}</strong>
                <div className="service-card-status">
                  {form.image_url ? "Custom image selected" : "Fallback image in use"}
                </div>
              </div>

              <button className={`primary-btn service-action-btn ${themeClass}`} type="button">
                Book Now
              </button>
            </div>
          </div>
        </div>

        <div className="info-card" style={{ marginTop: "18px" }}>
          <span className="service-pill theme-installation">Image behavior</span>
          <h3>Updates appear platform-wide</h3>
          <p>
            Once saved, the service background image can also appear anywhere that
            service is shown across the customer, worker, and admin experience.
          </p>
        </div>
      </section>
    </div>
  );
}

export default AdminAddServicePage;