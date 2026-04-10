import React, { useState } from "react";
import API from "../services/api";

function RegisterPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "customer"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name || !form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await API.post("/auth/register", form);
      alert(res.data.message);
      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "customer"
      });
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-centered">
      <div className="auth-card">
        <div className="hero-box" style={{ marginBottom: "20px" }}>
          <h2>Create your account</h2>
          <p className="muted">
            Join ServiceHub to discover trusted cleaners, plumbers, electricians, and more.
          </p>

          <div className="feature-badges">
            <span>Cleaning</span>
            <span>Repairs</span>
            <span>Maintenance</span>
          </div>
        </div>

        <h2 className="page-title">Register</h2>

        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            type="text"
            name="full_name"
            placeholder="Full name"
            value={form.full_name}
            onChange={handleChange}
          />
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
          <button className="primary-btn" type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;