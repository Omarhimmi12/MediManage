import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./medecinDashboard.css";

import AccueilPage from "./medecin/accueil";
import PatientsPage from "./medecin/patients";
import RdvPage from "./medecin/rdv";
import PaiementsPage from "./medecin/paiements";
import SecretairesPage from "./medecin/secretaires";
import MonCabinetPage from "./medecin/monCabinet";
import ParametresPage from "./medecin/parametres";
import ConsultationPage from "./medecin/consultation";

const MedecinDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialSection = useMemo(() => {
    const section = location?.state?.section;
    const allowed = new Set([
      "accueil",
      "patients",
      "rdv",
      "consultations",
      "paiements",
      "secretaires",
      "moncabinet",
      "parametres",
    ]);
    return typeof section === "string" && allowed.has(section)
      ? section
      : "accueil";
  }, [location?.state?.section]);

  const [activeSection, setActiveSection] = useState(initialSection);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const navItems = [
    { key: "accueil", label: "Accueil", icon: "bi-house-fill" },
    { key: "patients", label: "Patients", icon: "bi-people-fill" },
    { key: "rdv", label: "Rendez-vous", icon: "bi-calendar-check-fill" },
    { key: "consultations", label: "Consultations", icon: "bi-file-medical-fill" },
    { key: "paiements", label: "Paiements", icon: "bi-credit-card-fill" },
    { key: "secretaires", label: "Équipe", icon: "bi-person-badge-fill" },
    { key: "moncabinet", label: "Cabinet", icon: "bi-building-fill" },
    { key: "parametres", label: "Paramètres", icon: "bi-gear-fill" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "patients":
        return <PatientsPage />;
      case "rdv":
        return <RdvPage />;
      case "consultations":
        return <ConsultationPage />;
      case "paiements":
        return <PaiementsPage />;
      case "secretaires":
        return <SecretairesPage />;
      case "moncabinet":
        return <MonCabinetPage />;
      case "parametres":
        return <ParametresPage />;
      default:
        return <AccueilPage />;
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
        {isSidebarCollapsed ? "»" : "«"}
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
                  <span className="mmd-user-name">Dr. {user?.nom}</span>
                  <span className="mmd-user-role">Médecin</span>
                </div>
                <i className="bi bi-chevron-down text-light"></i>
              </button>

              {isProfileOpen && (
                <div className="mmd-profile-menu">
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("parametres");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi bi-person-circle"></i>
                    <span>Mon Profil</span>
                  </button>
                  
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("accueil");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi-house-fill"></i>
                    <span>Dashboard</span>
                  </button>
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("patients");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi-people-fill"></i>
                    <span>Patients</span>
                  </button>
                  
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("rdv");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi-calendar-check-fill"></i>
                    <span>Rendez-vous</span>
                  </button>
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("consultations");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi-file-medical-fill"></i>
                    <span>Consultations</span>
                  </button>
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("paiements");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi-credit-card-fill"></i>
                    <span>Paiements</span>
                  </button>
                  <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("secretaires");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi-person-badge-fill"></i>
                    <span>Equipes</span>
                  </button>
                  
                  
                 <button
                    className="mmd-profile-menu-item"
                    onClick={() => {
                      setActiveSection("moncabinet");
                      setIsProfileOpen(false);
                    }}
                  >
                    <i className="bi-building-fill"></i>
                    <span>Mon Cabinet</span>
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

export default MedecinDashboard;
