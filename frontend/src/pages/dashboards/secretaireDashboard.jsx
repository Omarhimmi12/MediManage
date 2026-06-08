import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

import "./medecinDashboard.css";

import PatientsPage from "./secretaire/patients.jsx";
import RdvPage from "./secretaire/rdv.jsx";
import ConsultationPage from "./secretaire/consultation.jsx";
import PaiementsPage from "./secretaire/paiements.jsx";

const SecretaireDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialSection = useMemo(() => {
    const section = location?.state?.section;
    const allowed = new Set(["patients", "rdv", "consultation", "paiements"]);
    return typeof section === "string" && allowed.has(section)
      ? section
      : "rdv";
  }, [location?.state?.section]);

  const [activeSection, setActiveSection] = useState(initialSection);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const navItems = [
    { key: "rdv", label: "Rendez-vous", icon: "bi-calendar-check-fill" },
    { key: "patients", label: "Patients", icon: "bi-people-fill" },
    { key: "consultation", label: "Consultations", icon: "bi-file-medical-fill" },
    { key: "paiements", label: "Paiements", icon: "bi-credit-card-fill" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "patients":
        return <PatientsPage />;
      case "rdv":
        return <RdvPage />;
      case "consultation":
        return <ConsultationPage />;
      case "paiements":
        return <PaiementsPage />;
      default:
        return <RdvPage />;
    }
  };

  const userInitials = `${user?.nom?.charAt(0) || ""}${user?.prenom?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="mmd-dashboard-wrapper">
      <aside className={`mmd-sidebar ${isSidebarCollapsed ? "mmd-sidebar--collapsed" : ""}`}>
        <div className="mmd-sidebar-header">
          <div className="mmd-logo">
            <div className="mmd-logo-icon">
              <img src="/images/brand.png" alt="MediManage" style={{ width: 28, height: 28, objectFit: "contain" }} />
            </div>
            {!isSidebarCollapsed && <span className="mmd-logo-text">MediManage</span>}
          </div>
        </div>

        <nav className="mmd-sidebar-nav">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`mmd-nav-item ${activeSection === key ? "mmd-nav-item--active" : ""}`}
              onClick={() => setActiveSection(key)}
              title={label}
            >
              <span className="mmd-nav-icon">
                <i className={`bi ${icon}`}></i>
              </span>
              {!isSidebarCollapsed && <span className="mmd-nav-label">{label}</span>}
            </button>
          ))}
        </nav>

        <div className="mmd-sidebar-footer">
          <button
            className="mmd-logout-btn"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            title="Déconnexion"
          >
            <span className="mmd-nav-icon">
              <i className="bi bi-box-arrow-right"></i>
            </span>
            {!isSidebarCollapsed && <span className="mmd-nav-label">Déconnexion</span>}
          </button>
        </div>
      </aside>

      <button
        type="button"
        className="mmd-sidebar-toggle"
        aria-label="Toggle sidebar"
        onClick={() => setIsSidebarCollapsed((v) => !v)}
      >
        <i className={`bi ${isSidebarCollapsed ? "bi-chevron-double-right" : "bi-chevron-double-left"}`}></i>
      </button>

      <div className="mmd-main-container">
        <header className="mmd-topbar">
          <div className="mmd-topbar-left">
            <div className="mmd-search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mmd-search-input"
              />
            </div>
          </div>

          <div className="mmd-topbar-right">
            <button className="mmd-topbar-icon-btn" aria-label="Notifications">
              <i className="bi bi-bell"></i>
              <span className="mmd-notification-badge">3</span>
            </button>

            <div className="mmd-profile-dropdown">
              <button
                className="mmd-profile-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="mmd-user-avatar">{userInitials}</div>
                <div className="mmd-user-info">
                  <span className="mmd-user-name">{user?.nom} {user?.prenom}</span>
                  <span className="mmd-user-role">Secrétaire</span>
                </div>
                <i className="bi bi-chevron-down text-light"></i>
              </button>

              {isProfileOpen && (
                <div className="mmd-profile-menu">
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("rdv");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi bi-calendar-check-fill"></i>
                    <span>Rendez-vous</span>
                  </button>
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("patients");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi bi-people-fill"></i>
                    <span>Patients</span>
                  </button>
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("consultation");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi bi-file-medical-fill"></i>
                    <span>Consultations</span>
                  </button>
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("paiements");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi bi-credit-card-fill"></i>
                    <span>Paiements</span>
                  </button>
                  <div className="mmd-profile-menu-divider"></div>
                  <button
                    className="mmd-profile-menu-item mmd-profile-menu-item--danger"
                    onClick={async () => {
                      await logout();
                      navigate("/login");
                    }}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mmd-content-wrapper">{renderContent()}</main>
      </div>
    </div>
  );
};

export default SecretaireDashboard;
