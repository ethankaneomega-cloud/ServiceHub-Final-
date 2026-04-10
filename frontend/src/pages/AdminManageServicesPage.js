import React, { useEffect, useState } from "react";
import API from "../services/api";

function AdminManageServicesPage() {
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    service_name: "",
    description: "",
    price: "",
    category: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/services");
      setServices(res.data);
    } catch (error) {
      alert("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this service?");
    if (!confirmDelete) return;

    try {
      const res = await API.delete(`/admin/services/${id}`);
      alert(res.data.message);
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete service");
    }
  };

  const handleEditClick = (service) => {
    setEditingId(service.id);
    setEditForm({
      service_name: service.service_name || "",
      description: service.description || "",
      price: service.price || "",
      category: service.category || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      service_name: "",
      description: "",
      price: "",
      category: ""
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    if (!editForm.service_name || Number(editForm.price) <= 0) {
      alert("Please enter a valid service name and price");
      return;
    }

    try {
      const res = await API.put(`/admin/services/${id}`, {
        ...editForm,
        price: Number(editForm.price)
      });

      alert(res.data.message);
      handleCancelEdit();
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update service");
    }
  };

  return (
    <div>
      <h2 className="page-title">Admin - Manage Services</h2>
      <p className="section-subtitle">Edit or remove existing service listings.</p>

      {loading ? (
        <p className="loading-text">Loading services...</p>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <p className="muted">No services found.</p>
        </div>
      ) : (
        <div className="card-list">
          {services.map((service) => (
            <div className="info-card" key={service.id}>
              {editingId === service.id ? (
                <>
                  <div className="form-grid">
                    <input
                      type="text"
                      name="service_name"
                      placeholder="Service Name"
                      value={editForm.service_name}
                      onChange={handleEditChange}
                    />
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={editForm.description}
                      onChange={handleEditChange}
                    />
                    <div className="inline-form-row">
                      <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={editForm.price}
                        onChange={handleEditChange}
                      />
                      <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={editForm.category}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="primary-btn" onClick={() => handleUpdate(service.id)}>
                      Save
                    </button>
                    <button className="secondary-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="service-pill">{service.category || "General Service"}</span>
                  <h3>{service.service_name}</h3>
                  <p>{service.description}</p>
                  <span className="price-tag">₱{Number(service.price).toFixed(2)}</span>

                  <div className="card-actions">
                    <button className="primary-btn" onClick={() => handleEditClick(service)}>
                      Edit
                    </button>
                    <button className="danger-btn" onClick={() => handleDelete(service.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminManageServicesPage;