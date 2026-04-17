import React from "react";

function LandingPage({ onSignUp, onSignIn }) {
  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <div className="brand-meta">
          <div className="brand-mark">S</div>
          <div>
            <div className="role-badge">ServiceHub Platform</div>
            <h1>Professional home services, one polished platform</h1>
            <p>
              Book trusted services, onboard verified workers, and manage operations
              through one clean role-based system for customers, workers, and admins.
            </p>
          </div>
        </div>

        <div className="landing-actions">
          <button className="secondary-btn" onClick={onSignIn}>
            Sign In
          </button>
          <button className="primary-btn" onClick={onSignUp}>
            Sign Up
          </button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <span className="service-pill">ServiceHub</span>
          <h2>Book, manage, and deliver services with clarity and trust</h2>
          <p>
            Designed for real workflows: customers can discover and request services,
            workers can manage jobs and availability, and admins can review
            applications and keep the platform organized.
          </p>

          <div className="landing-actions" style={{ marginTop: "18px" }}>
            <button className="primary-btn" onClick={onSignUp}>
              Create Account
            </button>
            <button className="secondary-btn" onClick={onSignIn}>
              Continue to Login
            </button>
          </div>

          <ul className="hero-bullets">
            <li>Different service visuals for every category and card.</li>
            <li>Consistent customer, worker, and admin experiences.</li>
            <li>Cleaner booking, approval, and dashboard flows.</li>
          </ul>

          <div className="stat-row">
            <div className="stat-chip">Customer booking flow</div>
            <div className="stat-chip">Worker onboarding</div>
            <div className="stat-chip">Admin service control</div>
          </div>
        </div>

        <div className="hero-visual-grid">
          <div
            className="landing-service-tile"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(15,23,42,0.14), rgba(15,23,42,0.86)), url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80)",
            }}
          >
            <span>Cleaning Services</span>
          </div>

          <div
            className="landing-service-tile"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(15,23,42,0.14), rgba(15,23,42,0.86)), url(https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80)",
            }}
          >
            <span>Plumbing & Repair</span>
          </div>

          <div
            className="landing-service-tile"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(15,23,42,0.14), rgba(15,23,42,0.86)), url(https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80)",
            }}
          >
            <span>Electrical Work</span>
          </div>

          <div
            className="landing-service-tile"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(15,23,42,0.14), rgba(15,23,42,0.86)), url(https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1200&q=80)",
            }}
          >
            <span>Moving & Support</span>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="info-card">
          <span className="service-pill theme-cleaning">Verified workers</span>
          <h3>Better onboarding quality</h3>
          <p>
            Worker applications can include credentials, ID, supporting files, and
            approval-driven access control.
          </p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-installation">Cleaner dashboards</span>
          <h3>Role-based visibility</h3>
          <p>
            Customers, workers, and admins each get focused actions without losing
            consistency across the platform.
          </p>
        </div>

        <div className="info-card">
          <span className="service-pill theme-repair">Improved service cards</span>
          <h3>Premium image treatment</h3>
          <p>
            Background images, overlays, badges, and buttons are designed to stay
            readable and visually distinct.
          </p>
        </div>
      </section>

      <section className="page-card">
        <div className="section-heading">
          <span className="service-pill">Role-Based Platform</span>
          <h2>Built for all three sides of ServiceHub</h2>
        </div>

        <div className="role-grid">
          <div className="info-card">
            <span className="service-pill theme-default">Customer</span>
            <h3>Discover and request services</h3>
            <p>
              Browse service cards, compare categories, book faster, and track
              bookings with better states and clearer history.
            </p>
          </div>

          <div className="info-card">
            <span className="service-pill theme-moving">Worker</span>
            <h3>Operate like a provider app</h3>
            <p>
              Manage onboarding, availability, open jobs, active work, and profile
              updates in one organized dashboard.
            </p>
          </div>

          <div className="info-card">
            <span className="service-pill theme-installation">Admin</span>
            <h3>Control services and approvals</h3>
            <p>
              Review applications, update service images, and keep platform content
              polished and consistent everywhere.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;