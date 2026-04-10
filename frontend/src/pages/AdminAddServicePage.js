import React, { useState } from "react";
import API from "../services/api";

function AdminAddServicePage() {
  const [form, setForm] = useState({
    service_name: "",
    description: "",
    price: "",
    category: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service_name || !form.price) {
      alert("Service name and price are required");
      return;
    }

    if (Number(form.price) <= 0) {
      alert("Price must be greater than zero");
      return;
    }

    try {
      setSubmitting(true);

      const res = await API.post("/admin/services", {
        ...form,
        price: Number(form.price)
      });

      alert(res.data.message);

      setForm({
        service_name: "",
        description: "",
        price: "",
        category: ""
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Admin - Add Service</h2>
      <p className="section-subtitle">Create a new service customers can book.</p>

      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          type="text"
          name="service_name"
          placeholder="Service Name"
          value={form.service_name}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <div className="inline-form-row">
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />
        </div>
        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Service"}
        </button>
      </form>
    </div>
  );
}

export default AdminAddServicePage;