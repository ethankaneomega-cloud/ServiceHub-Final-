import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const fallbackImages = {
  cleaning:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  assembly:
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
  plumbing:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
  electrical:
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80",
  painting:
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
  moving:
    "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1200&q=80",
  handyman:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  yard:
    "https://images.unsplash.com/photo-1599685315640-4f53d89d4b6b?auto=format&fit=crop&w=1200&q=80",
  default:
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
};

function getServiceImage(service) {
  if (service.image_url) return service.image_url;

  const text = `${service.category || ""} ${service.service_name || ""}`.toLowerCase();

  if (text.includes("clean")) return fallbackImages.cleaning;
  if (text.includes("assembl") || text.includes("install")) return fallbackImages.assembly;
  if (text.includes("plumb")) return fallbackImages.plumbing;
  if (text.includes("electric")) return fallbackImages.electrical;
  if (text.includes("paint")) return fallbackImages.painting;
  if (text.includes("move")) return fallbackImages.moving;
  if (text.includes("yard") || text.includes("garden")) return fallbackImages.yard;
  if (text.includes("repair") || text.includes("handy")) return fallbackImages.handyman;

  return fallbackImages.default;
}

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

function ServicesPage({ onSelectService }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.get("/services");
        setServices(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        alert("Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(
        services
          .map((service) => service.category)
          .filter(Boolean)
      )
    );

    return ["All", ...values];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const text = searchText.toLowerCase();

      const matchesText =
        service.service_name?.toLowerCase().includes(text) ||
        service.description?.toLowerCase().includes(text) ||
        service.category?.toLowerCase().includes(text);

      const matchesCategory =
        selectedCategory === "All" || service.category === selectedCategory;

      return matchesText && matchesCategory;
    });
  }, [services, searchText, selectedCategory]);

  if (loading) {
    return (
      <div className="page-card">
        <span className="service-pill">Services</span>
        <h2>Loading services...</h2>
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="section-heading">
        <span className="service-pill">ServiceHub Services</span>
        <h2>Browse available services</h2>
      </div>
      <p>
        Search, filter, and choose the service you need before continuing to booking.
      </p>

      <div className="services-toolbar">
        <input
          type="text"
          className="service-search"
          placeholder="Search by service, category, or keyword"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="category-pills">
          {categories.map((category) => {
            const themeClass =
              category === "All"
                ? "theme-default"
                : getCategoryThemeClass(category, category);

            return (
              <button
                key={category}
                type="button"
                className={`category-pill ${themeClass} ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="empty-state-card">
          <h3>No matching services</h3>
          <p>Try a different search word or category.</p>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map((service) => {
            const themeClass = getCategoryThemeClass(
              service.category,
              service.service_name
            );

            return (
              <div
                key={service.id}
                className="service-card"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.9)), url(${getServiceImage(
                    service
                  )})`,
                }}
              >
                <div className="service-card-content">
                  <span className={`service-pill ${themeClass}`}>
                    {service.category || "Service"}
                  </span>

                  <h3>{service.service_name}</h3>
                  <p>{service.description || "No description provided."}</p>

                  <div className="service-footer-row">
                    <strong>₱{Number(service.price || 0).toFixed(2)}</strong>

                    <button
                      className={`primary-btn service-action-btn ${themeClass}`}
                      onClick={() => onSelectService(service)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ServicesPage;