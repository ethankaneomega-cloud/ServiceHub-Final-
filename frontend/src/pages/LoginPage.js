import React, { useState } from "react";
import API from "../services/api";

function LoginPage({ onLoginSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert(res.data.message);
      onLoginSuccess(res.data.user);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-centered">
      <div className="auth-card">
        <div className="hero-box" style={{ marginBottom: "20px" }}>
          <h2>Welcome back</h2>
          <p className="muted">
            Sign in to manage your home service bookings and track appointment status.
          </p>

          <div className="feature-badges">
            <span>Easy Booking</span>
            <span>Verified Services</span>
            <span>Quick Scheduling</span>
          </div>
        </div>

        <h2 className="page-title">Login</h2>

        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <button className="primary-btn" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;