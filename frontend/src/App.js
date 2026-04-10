import React, { useEffect, useState } from "react";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ServicesPage from "./pages/ServicesPage";
import BookingPage from "./pages/BookingPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminAddServicePage from "./pages/AdminAddServicePage";
import AdminManageServicesPage from "./pages/AdminManageServicesPage";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setPage(parsedUser.role === "admin" ? "adminBookings" : "services");
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setPage(loggedInUser.role === "admin" ? "adminBookings" : "services");
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setPage("booking");
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedService(null);
    setPage("login");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <div className="app-shell">
      <div className="container">
        <header className="app-header">
          <div>
            <h1>ServiceHub</h1>
            <p>Book trusted home services with a smoother, cleaner experience.</p>
          </div>
        </header>

        <nav className="top-nav">
          {!user && (
            <>
              <button className="nav-btn" onClick={() => setPage("register")}>Register</button>
              <button className="nav-btn" onClick={() => setPage("login")}>Login</button>
            </>
          )}

          {user && user.role !== "admin" && (
            <>
              <button className="nav-btn" onClick={() => setPage("services")}>Services</button>
              <button className="nav-btn" onClick={() => setPage("history")}>Booking History</button>
              <button className="nav-btn danger" onClick={handleLogout}>Logout</button>
            </>
          )}

          {user && user.role === "admin" && (
            <>
              <button className="nav-btn" onClick={() => setPage("adminBookings")}>Manage Bookings</button>
              <button className="nav-btn" onClick={() => setPage("adminAddService")}>Add Service</button>
              <button className="nav-btn" onClick={() => setPage("adminManageServices")}>Manage Services</button>
              <button className="nav-btn danger" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>

        <main className="page-card">
          {page === "register" && <RegisterPage />}
          {page === "login" && <LoginPage onLoginSuccess={handleLoginSuccess} />}
          {page === "services" && user?.role !== "admin" && (
            <ServicesPage onSelectService={handleSelectService} />
          )}
          {page === "booking" && user && selectedService && user.role !== "admin" && (
            <BookingPage user={user} service={selectedService} onBackToServices={() => setPage("services")} />
          )}
          {page === "history" && user?.role !== "admin" && <BookingHistoryPage user={user} />}
          {page === "adminBookings" && user?.role === "admin" && <AdminBookingsPage />}
          {page === "adminAddService" && user?.role === "admin" && <AdminAddServicePage />}
          {page === "adminManageServices" && user?.role === "admin" && <AdminManageServicesPage />}
        </main>
      </div>
    </div>
  );
}

export default App;