import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./adminDashboard.css";

import AccueilAdmin from "./admin/accueil";
import UsersAdmin from "./admin/users";
import CabinetsAdmin from "./admin/cabinets";
import MessagingPage from "../messaging/MessagingPage";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("accueil");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { key: "accueil", label: "Accueil", icon: "bi-house-fill" },
    { key: "users", label: "Utilisateurs", icon: "bi-people-fill" },
    { key: "cabinets", label: "Cabinets", icon: "bi-building-fill" },
    { key: "messages", label: "Messages", icon: "bi-chat-dots-fill" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UsersAdmin />;
      case "cabinets":
        return <CabinetsAdmin />;
      case "messages":
        return <MessagingPage />;
      default:
        return <AccueilAdmin />;
    }
  };

  const userInitials = `${user?.nom?.charAt(0) || ""}${user?.prenom?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="admin-dashboard-wrapper">
      <aside className={`admin-sidebar ${isSidebarCollapsed ? "admin-sidebar--collapsed" : ""}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <img src="/images/brand.png" alt="MediManage" style={{ width: 45, height: 45, objectFit: "contain" }} />
            </div>
            {!isSidebarCollapsed && <span className="admin-logo-text">MediManage</span>}
          </div>
          {!isSidebarCollapsed && <span className="admin-logo-sub">Super Admin</span>}
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`admin-nav-item ${activeSection === key ? "admin-nav-item--active" : ""}`}
              onClick={() => setActiveSection(key)}
              title={label}
            >
              <span className="admin-nav-icon">
                <i className={`bi ${icon}`}></i>
              </span>
              {!isSidebarCollapsed && <span className="admin-nav-label">{label}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-user">
          <div className="admin-user-avatar">
            {userInitials || "A"}
          </div>
          {!isSidebarCollapsed && (
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.nom} {user?.prenom}</span>
              <span className="admin-user-role">Administrateur</span>
            </div>
          )}
        </div>

        {/* <div className="admin-sidebar-footer">
          <button
            className="admin-logout-btn"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            title="Déconnexion"
          >
            <span className="admin-nav-icon">
              <i className="bi bi-box-arrow-right"></i>
            </span>
            {!isSidebarCollapsed && <span className="admin-nav-label">Déconnexion</span>}
          </button>
        </div> */}
      </aside>

      <button
        type="button"
        className="admin-sidebar-toggle"
        aria-label="Toggle sidebar"
        onClick={() => setIsSidebarCollapsed((v) => !v)}
      >
        <i className={`bi ${isSidebarCollapsed ? "bi-chevron-double-right" : "bi-chevron-double-left"}`}></i>
      </button>

      <div className="admin-main-container">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <div className="admin-topbar-title">
              <span>Interface d'administration</span>
            </div>
          </div>
          <div className="admin-topbar-right">
            <button
              className="admin-topbar-logout"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </header>

        <main className="admin-content-wrapper">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
