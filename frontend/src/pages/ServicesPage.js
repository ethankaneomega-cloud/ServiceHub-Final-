import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function ServicesPage({ onSelectService }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

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

  const categories = useMemo(() => {
    const unique = [...new Set(services.map((s) => s.category).filter(Boolean))];
    return ["All", ...unique];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.service_name.toLowerCase().includes(search.toLowerCase()) ||
        (service.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || service.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [services, search, category]);

  return (
    <div>
      <div className="hero-strip">
        <div className="hero-box">
          <h2>Find the right help for your home</h2>
          <p className="muted">
            Browse trusted services, compare pricing, and book quickly in just a few steps.
          </p>
        </div>

        <div className="summary-box">
          <h3>Available Services</h3>
          <p className="muted">{filteredServices.length} service options ready to book</p>
        </div>
      </div>

      <h2 className="page-title">Popular Home Services</h2>
      <p className="section-subtitle">Search or filter services before booking.</p>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading services...</p>
      ) : filteredServices.length === 0 ? (
        <div className="empty-state">
          <p className="muted">No services matched your search.</p>
        </div>
      ) : (
        <div className="service-grid">
          {filteredServices.map((service) => (
            <div className="info-card service-card" key={service.id}>
              <div className="service-card-top">
                <span className="service-pill">{service.category || "General Service"}</span>
                <h3>{service.service_name}</h3>
                <p>{service.description}</p>
              </div>

              <div className="service-bottom">
                <span className="price-tag">₱{Number(service.price).toFixed(2)}</span>
                <button className="primary-btn" onClick={() => onSelectService(service)}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServicesPage;