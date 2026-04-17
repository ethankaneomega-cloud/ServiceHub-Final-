import React, { useState } from "react";
import API from "../services/api";

function LoginPage({ onLoginSuccess, onGoToRegister, onBackHome }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      onLoginSuccess(res.data.user);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-grid">
      <section className="hero-copy">
        <span className="service-pill">Welcome Back</span>
        <h2>Sign in to your ServiceHub account</h2>
        <p>
          Continue to your customer, worker, or admin dashboard using the same
          polished platform and role-based access flow.
        </p>

        <div className="trust-strip" style={{ marginTop: "18px" }}>
          <div className="info-card">
            <span className="service-pill theme-default">Customers</span>
            <h3>Book faster</h3>
            <p>Browse services, request help, and track booking history clearly.</p>
          </div>

          <div className="info-card">
            <span className="service-pill theme-moving">Workers</span>
            <h3>Manage jobs</h3>
            <p>Review open bookings, update status, and control availability.</p>
          </div>

          <div className="info-card">
            <span className="service-pill theme-installation">Admins</span>
            <h3>Control operations</h3>
            <p>Review applications, manage services, and monitor bookings.</p>
          </div>
        </div>
      </section>

      <section className="page-card login-page">
        <span className="service-pill">Sign In</span>
        <h2>Access your dashboard</h2>
        <p>Use your registered email and password to continue.</p>

        <form onSubmit={handleSubmit} className="form-card">
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

          <div className="card-actions">
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={onGoToRegister}
            >
              Create Account
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={onBackHome}
            >
              Back Home
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;