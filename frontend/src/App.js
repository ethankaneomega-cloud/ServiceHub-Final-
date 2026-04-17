import React, { useEffect, useMemo, useState } from "react";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ServicesPage from "./pages/ServicesPage";
import BookingPage from "./pages/BookingPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminAddServicePage from "./pages/AdminAddServicePage";
import AdminManageServicesPage from "./pages/AdminManageServicesPage";
import WorkerDashboardPage from "./pages/WorkerDashboardPage";
import "./App.css";

function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const isStaffRole = (role) => role === "admin" || role === "super_admin";
  const isWorkerRole = (role) => role === "worker";
  const isCustomerRole = (role) => role && !isStaffRole(role) && !isWorkerRole(role);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return;

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (isStaffRole(parsedUser.role)) {
        setPage("adminBookings");
      } else if (isWorkerRole(parsedUser.role)) {
        setPage("workerDashboard");
      } else {
        setPage("services");
      }
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  const currentRoleLabel = useMemo(() => {
    if (!user) return "Guest";
    if (user.role === "super_admin") return "Super Admin";
    if (user.role === "admin") return "Admin";
    if (user.role === "worker") return "Worker";
    return "Customer";
  }, [user]);

  const currentPageTitle = useMemo(() => {
    switch (page) {
      case "services":
        return "Explore Services";
      case "booking":
        return "Book a Service";
      case "history":
        return "Booking History";
      case "workerDashboard":
        return "Worker Dashboard";
      case "adminBookings":
        return "Admin Overview";
      case "adminAddService":
        return "Add New Service";
      case "adminManageServices":
        return "Manage Services";
      default:
        return "ServiceHub";
    }
  }, [page]);

  const roleNavItems = useMemo(() => {
    if (!user) return [];

    if (isCustomerRole(user.role)) {
      return [
        { key: "services", label: "Services" },
        { key: "history", label: "History" },
      ];
    }

    if (isWorkerRole(user.role)) {
      return [{ key: "workerDashboard", label: "Worker Dashboard" }];
    }

    if (isStaffRole(user.role)) {
      return [
        { key: "adminBookings", label: "Dashboard" },
        { key: "adminAddService", label: "Add Service" },
        { key: "adminManageServices", label: "Manage Services" },
      ];
    }

    return [];
  }, [user]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);

    if (isStaffRole(loggedInUser.role)) {
      setPage("adminBookings");
    } else if (isWorkerRole(loggedInUser.role)) {
      setPage("workerDashboard");
    } else {
      setPage("services");
    }
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setPage("booking");
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedService(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("landing");
  };

  return (
    <div className="app-shell">
      {user && (
        <header className="app-header">
          <div className="brand-meta">
            <div className="brand-mark">S</div>
            <div>
              <div className="role-badge">{currentRoleLabel}</div>
              <h1>{currentPageTitle}</h1>
              <p>
                {isCustomerRole(user.role) &&
                  "Browse trusted services, place requests, and track every booking clearly."}
                {isWorkerRole(user.role) &&
                  "Manage availability, review open jobs, and handle assigned work in one place."}
                {isStaffRole(user.role) &&
                  "Review applications, manage services, and keep platform operations organized."}
              </p>
            </div>
          </div>

          <div className="page-switcher">
            {roleNavItems.map((item) => (
              <button
                key={item.key}
                className={`ghost-btn ${page === item.key ? "active" : ""}`}
                onClick={() => setPage(item.key)}
              >
                {item.label}
              </button>
            ))}

            {isCustomerRole(user.role) && page === "booking" && (
              <button className="ghost-btn active">Booking</button>
            )}

            <button className="danger-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
      )}

      <main className="main-content">
        {!user && page === "landing" && (
          <LandingPage
            onSignUp={() => setPage("register")}
            onSignIn={() => setPage("login")}
          />
        )}

        {!user && page === "register" && (
          <RegisterPage
            onBackToLogin={() => setPage("login")}
            onBackHome={() => setPage("landing")}
          />
        )}

        {!user && page === "login" && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setPage("register")}
            onBackHome={() => setPage("landing")}
          />
        )}

        {user && isCustomerRole(user.role) && page === "services" && (
          <ServicesPage onSelectService={handleSelectService} />
        )}

        {user &&
          isCustomerRole(user.role) &&
          page === "booking" &&
          selectedService && (
            <BookingPage
              service={selectedService}
              onBackToServices={() => setPage("services")}
            />
          )}

        {user && isCustomerRole(user.role) && page === "history" && (
          <BookingHistoryPage />
        )}

        {user && isWorkerRole(user.role) && page === "workerDashboard" && (
          <WorkerDashboardPage />
        )}

        {user && isStaffRole(user.role) && page === "adminBookings" && (
          <AdminBookingsPage />
        )}

        {user && isStaffRole(user.role) && page === "adminAddService" && (
          <AdminAddServicePage />
        )}

        {user && isStaffRole(user.role) && page === "adminManageServices" && (
          <AdminManageServicesPage />
        )}
      </main>
    </div>
  );
}

export default App;