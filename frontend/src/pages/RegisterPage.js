import React, { useMemo, useState } from "react";
import API from "../services/api";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function RegisterPage({ onBackToLogin, onBackHome }) {
  const [roleType, setRoleType] = useState("customer");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    credentials_summary: "",
    document_links: "",
    service_category: "",
  });
  const [validIdImage, setValidIdImage] = useState("");
  const [supportingFiles, setSupportingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roleDescriptions = useMemo(
    () => ({
      customer: {
        pill: "Customer Account",
        title: "Create a user account",
        subtitle:
          "Register to browse services, place bookings, and manage booking history.",
      },
      worker: {
        pill: "Worker Application",
        title: "Apply as a ServiceHub worker",
        subtitle:
          "Submit your service category, credentials, ID, and supporting documents for approval.",
      },
      admin: {
        pill: "Admin Application",
        title: "Apply for admin access",
        subtitle:
          "Submit credentials and supporting proof. Higher-up approval is required before admin access is granted.",
      },
    }),
    []
  );

  const endpointMap = {
    customer: "/auth/register/customer",
    worker: "/auth/register/worker",
    admin: "/auth/register/admin",
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const switchRole = (nextRole) => {
    setRoleType(nextRole);
    setForm({
      full_name: "",
      email: "",
      password: "",
      credentials_summary: "",
      document_links: "",
      service_category: "",
    });
    setValidIdImage("");
    setSupportingFiles([]);
    setShowPassword(false);
  };

  const handleValidIdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setValidIdImage(dataUrl);
    } catch (error) {
      alert("Failed to read valid ID image.");
    }
  };

  const handleSupportingUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const converted = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type,
          data: await fileToDataUrl(file),
        }))
      );

      setSupportingFiles(converted);
    } catch (error) {
      alert("Failed to read supporting files.");
    }
  };

  const removeSupportingFile = (indexToRemove) => {
    setSupportingFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name || !form.email || !form.password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      if (roleType === "customer") {
        const res = await API.post(endpointMap.customer, {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
        });

        alert(res.data.message);
        onBackToLogin();
        return;
      }

      if (roleType === "worker") {
        if (
          !form.service_category ||
          !form.credentials_summary ||
          !validIdImage ||
          (supportingFiles.length === 0 && !form.document_links)
        ) {
          alert("Please complete the worker form, valid ID, and supporting documents.");
          return;
        }

        const res = await API.post(endpointMap.worker, {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          service_category: form.service_category,
          credentials_summary: form.credentials_summary,
          valid_id_image: validIdImage,
          worker_documents:
            supportingFiles.length > 0
              ? JSON.stringify(supportingFiles)
              : form.document_links,
          document_links: form.document_links,
        });

        alert(res.data.message);
        onBackToLogin();
        return;
      }

      if (roleType === "admin") {
        if (!form.credentials_summary || (!form.document_links && supportingFiles.length === 0)) {
          alert("Please add admin credentials and supporting documents.");
          return;
        }

        const res = await API.post(endpointMap.admin, {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          credentials_summary: form.credentials_summary,
          document_links:
            supportingFiles.length > 0
              ? JSON.stringify(supportingFiles)
              : form.document_links,
        });

        alert(res.data.message);
        onBackToLogin();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-layout">
      <aside className="page-card">
        <span className="service-pill">Choose Role</span>
        <h2>Create your ServiceHub account</h2>
        <p>
          Each role uses its own flow so the whole system stays clear, secure, and
          easier to manage.
        </p>

        <div className="register-role-stack">
          <button
            type="button"
            className={`register-role-card ${roleType === "customer" ? "active" : ""}`}
            onClick={() => switchRole("customer")}
          >
            <strong>User Account</strong>
            <span>Browse services, request help, and track bookings.</span>
          </button>

          <button
            type="button"
            className={`register-role-card ${roleType === "worker" ? "active" : ""}`}
            onClick={() => switchRole("worker")}
          >
            <strong>Worker Application</strong>
            <span>Provider-style onboarding with category, ID, and documents.</span>
          </button>

          <button
            type="button"
            className={`register-role-card ${roleType === "admin" ? "active" : ""}`}
            onClick={() => switchRole("admin")}
          >
            <strong>Admin Application</strong>
            <span>Separate approval flow for platform-side management access.</span>
          </button>
        </div>

        <div className="register-mini-info">
          <div className="mini-info-card">
            <strong>Cleaner onboarding</strong>
            <span>Role-based forms that are easier to understand and complete.</span>
          </div>

          <div className="mini-info-card">
            <strong>Approval-ready</strong>
            <span>Worker and admin registration support supporting uploads and review.</span>
          </div>
        </div>

        <div className="card-actions" style={{ marginTop: "18px" }}>
          <button className="secondary-btn" type="button" onClick={onBackToLogin}>
            Back to Login
          </button>
          <button className="secondary-btn" type="button" onClick={onBackHome}>
            Back Home
          </button>
        </div>
      </aside>

      <section className="page-card">
        <span className="service-pill">{roleDescriptions[roleType].pill}</span>
        <h2>{roleDescriptions[roleType].title}</h2>
        <p>{roleDescriptions[roleType].subtitle}</p>

        <form onSubmit={handleSubmit} className="form-card">
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {roleType === "worker" && (
            <>
              <input
                type="text"
                name="service_category"
                placeholder="Service Category (Cleaning, Plumbing, Electrical)"
                value={form.service_category}
                onChange={handleChange}
                required
              />

              <textarea
                name="credentials_summary"
                placeholder="Credentials Summary"
                value={form.credentials_summary}
                onChange={handleChange}
                required
              />

              <textarea
                name="document_links"
                placeholder="Optional document links"
                value={form.document_links}
                onChange={handleChange}
              />

              <label className="upload-label">
                <strong>Valid ID Image</strong>
                <span className="field-hint">Upload a PNG or JPG image of a valid ID.</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleValidIdUpload}
                />
              </label>

              {validIdImage && (
                <div
                  className="service-preview"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.9)), url(${validIdImage})`,
                  }}
                >
                  <span>Valid ID Preview</span>
                </div>
              )}

              <label className="upload-label">
                <strong>Supporting Documents</strong>
                <span className="field-hint">
                  Upload certificates, proof of experience, or other supporting files.
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  multiple
                  onChange={handleSupportingUpload}
                />
              </label>
            </>
          )}

          {roleType === "admin" && (
            <>
              <textarea
                name="credentials_summary"
                placeholder="Credentials Summary"
                value={form.credentials_summary}
                onChange={handleChange}
                required
              />

              <textarea
                name="document_links"
                placeholder="Optional document links"
                value={form.document_links}
                onChange={handleChange}
              />

              <label className="upload-label">
                <strong>Supporting Documents</strong>
                <span className="field-hint">
                  Upload PNG or JPG files related to your admin application.
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  multiple
                  onChange={handleSupportingUpload}
                />
              </label>
            </>
          )}

          {supportingFiles.length > 0 && (
            <div className="upload-preview-grid">
              {supportingFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="info-card">
                  <div
                    className="service-preview"
                    style={{
                      minHeight: "150px",
                      backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.14), rgba(15, 23, 42, 0.9)), url(${file.data})`,
                    }}
                  >
                    <span>{file.name}</span>
                  </div>

                  <div className="card-actions" style={{ marginTop: "12px" }}>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => removeSupportingFile(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card-actions">
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading
                ? "Submitting..."
                : roleType === "customer"
                ? "Create User Account"
                : roleType === "worker"
                ? "Submit Worker Application"
                : "Submit Admin Application"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RegisterPage;