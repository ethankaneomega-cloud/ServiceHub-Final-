import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const fallbackImages = {
  cleaning:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  installation:
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
  plumbing:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
  electrical:
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80",
  moving:
    "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1200&q=80",
  repair:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  default:
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
};

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

function getFallbackImage(service) {
  const text = `${service.category || ""} ${service.service_name || ""}`.toLowerCase();

  if (text.includes("clean")) return fallbackImages.cleaning;
  if (text.includes("install") || text.includes("assembl")) return fallbackImages.installation;
  if (text.includes("plumb")) return fallbackImages.plumbing;
  if (text.includes("electric")) return fallbackImages.electrical;
  if (text.includes("move")) return fallbackImages.moving;
  if (text.includes("repair") || text.includes("handy")) return fallbackImages.repair;

  return fallbackImages.default;
}

function AdminManageServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editForm, setEditForm] = useState({
    service_name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    is_active: true,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const text = searchText.toLowerCase();

      const matchesSearch =
        service.service_name?.toLowerCase().includes(text) ||
        service.description?.toLowerCase().includes(text) ||
        service.category?.toLowerCase().includes(text);

      const active = service.is_active === 0 ? false : true;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [services, searchText, statusFilter]);

  const startEdit = (service) => {
    setEditingId(service.id);
    setEditForm({
      service_name: service.service_name || "",
      description: service.description || "",
      price: service.price || "",
      category: service.category || "",
      image_url: service.image_url || "",
      is_active: service.is_active === 0 ? false : true,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      service_name: "",
      description: "",
      price: "",
      category: "",
      image_url: "",
      is_active: true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setEditForm((prev) => ({
        ...prev,
        image_url: dataUrl,
      }));
    } catch (error) {
      alert("Failed to read image file.");
    }
  };

  const handleUpdate = async (serviceId) => {
    if (!editForm.service_name || !editForm.price) {
      alert("Service name and price are required.");
      return;
    }

    try {
      const payload = {
        service_name: editForm.service_name,
        description: editForm.description,
        price: Number(editForm.price),
        category: editForm.category,
        image_url: editForm.image_url,
        is_active: editForm.is_active ? 1 : 0,
      };

      const res = await API.put(`/admin/services/${serviceId}`, payload);
      alert(res.data.message);
      cancelEdit();
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update service");
    }
  };

  const handleDelete = async (serviceId) => {
    const confirmed = window.confirm("Delete this service?");
    if (!confirmed) return;

    try {
      const res = await API.delete(`/admin/services/${serviceId}`);
      alert(res.data.message);
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete service");
    }
  };

  return (
    <div className="admin-manage-layout">
      <aside className="page-card admin-manage-sidebar">
        <span className="service-pill">Admin Controls</span>
        <h2>Manage Services</h2>
        <p>
          Update service details, improve media quality, and make sure every service
          card looks polished across the whole platform.
        </p>

        <div className="filter-stack">
          <input
            type="text"
            placeholder="Search services"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All services</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>

        <div className="info-card" style={{ marginTop: "18px" }}>
          <span className="service-pill theme-installation">Image handling</span>
          <h3>Built-in preview and fallback</h3>
          <p>
            Upload a new service image, preview it immediately, or keep a fallback
            image so every service still looks complete.
          </p>
        </div>
      </aside>

      <section className="page-card admin-manage-content">
        <div className="section-heading">
          <span className="service-pill">Service Library</span>
          <h2>Visual service management</h2>
        </div>

        {loading ? (
          <p>Loading services...</p>
        ) : filteredServices.length === 0 ? (
          <div className="empty-state-card">
            <h3>No services found</h3>
            <p>Try changing the search or status filter.</p>
          </div>
        ) : (
          <div className="admin-service-grid">
            {filteredServices.map((service) => {
              const image = service.image_url || getFallbackImage(service);
              const active = service.is_active === 0 ? false : true;
              const themeClass = getCategoryThemeClass(
                service.category,
                service.service_name
              );

              return (
                <div key={service.id}>
                  {editingId === service.id ? (
                    <div className="page-card">
                      <span className={`service-pill ${themeClass}`}>Editing Service</span>
                      <h2 style={{ fontSize: "1.6rem", marginTop: "12px" }}>
                        {service.service_name}
                      </h2>

                      <form
                        className="form-card"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdate(service.id);
                        }}
                      >
                        <input
                          type="text"
                          name="service_name"
                          placeholder="Service Name"
                          value={editForm.service_name}
                          onChange={handleChange}
                        />

                        <textarea
                          name="description"
                          placeholder="Description"
                          value={editForm.description}
                          onChange={handleChange}
                        />

                        <input
                          type="number"
                          name="price"
                          placeholder="Price"
                          value={editForm.price}
                          onChange={handleChange}
                        />

                        <input
                          type="text"
                          name="category"
                          placeholder="Category"
                          value={editForm.category}
                          onChange={handleChange}
                        />

                        <input
                          type="text"
                          name="image_url"
                          placeholder="Paste image URL"
                          value={editForm.image_url}
                          onChange={handleChange}
                        />

                        <label className="upload-label">
                          <strong>Upload Background Image</strong>
                          <span className="field-hint">
                            Upload a professional service image for this card.
                          </span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} />
                        </label>

                        <div
                          className="service-preview"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.9)), url(${
                              editForm.image_url || image
                            })`,
                          }}
                        >
                          <span>Service Preview</span>
                        </div>

                        <label className="service-switch">
                          <input
                            type="checkbox"
                            name="is_active"
                            checked={editForm.is_active}
                            onChange={handleChange}
                          />
                          Active service
                        </label>

                        <div className="card-actions">
                          <button className={`primary-btn service-action-btn ${themeClass}`} type="submit">
                            Save Changes
                          </button>
                          <button
                            className="secondary-btn"
                            type="button"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div
                      className="admin-service-card"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.92)), url(${image})`,
                      }}
                    >
                      <div className="admin-service-card-content">
                        <div className="admin-service-topline">
                          <span className={`service-pill ${themeClass}`}>
                            {service.category || "Service"}
                          </span>
                          <span className={`service-pill ${active ? "theme-cleaning" : "theme-repair"}`}>
                            {active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <h3>{service.service_name}</h3>
                        <p>{service.description || "No description provided."}</p>

                        <div className="admin-service-footer">
                          <div>
                            <strong>₱{Number(service.price || 0).toFixed(2)}</strong>
                            <div className="service-card-status">
                              {service.image_url ? "Custom image applied" : "Using fallback image"}
                            </div>
                          </div>

                          <div className="card-actions">
                            <button
                              className={`primary-btn service-action-btn ${themeClass}`}
                              onClick={() => startEdit(service)}
                            >
                              Edit
                            </button>

                            <button
                              className="danger-btn"
                              onClick={() => handleDelete(service.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminManageServicesPage;