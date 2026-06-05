import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

import "./secretaireDashboard.css";

import PatientsPage from "./secretaire/patients..jsx";
import RdvPage from "./secretaire/rdv.jsx";
import ConsultationPage from "./secretaire/consultation.jsx";
import PaiementsPage from "./secretaire/paiements.jsx";

const SecretaireDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState("rdv");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userDisplayName = useMemo(() => {
    const nom = user?.nom ? String(user.nom) : "";
    const prenom = user?.prenom ? String(user.prenom) : "";
    return [nom, prenom].filter(Boolean).join(" ");
  }, [user?.nom, user?.prenom]);

  const initialSection = useMemo(() => {
    const section = location?.state?.section;
    const allowed = new Set(["patients", "rdv", "consultation", "paiements"]);
    return typeof section === "string" && allowed.has(section) ? section : "rdv";
  }, [location?.state?.section]);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    // Keep for potential future role/state sync.
  }, []);

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

  return (
    <div className="d-flex mmd-secretaire-dashboard">
      <div
        className={`mmd-sidebar ${isSidebarCollapsed ? "mmd-sidebar--collapsed" : ""}`}
      >
        <div className="mmd-brand">
          <img className="mmd-brand__img" src="/images/brand.png" alt="MediManage" />
          <span className="mmd-brand__text">MediManage</span>
        </div>

        {[
          ["patients", "Patients", "bi-people"],
          ["rdv", "Rendez-Vous", "bi-calendar-check"],
          ["consultation", "Consultation", "bi-heart-pulse"],
          ["paiements", "Paiements", "bi-credit-card-2-front"],
        ].map(([key, label, icon]) => {
          const isActive = activeSection === key;
          return (
            <button
              key={key}
              className={`mmd-navbtn btn ${isActive ? "mmd-navbtn--active" : ""}`}
              onClick={() => setActiveSection(key)}
              type="button"
            >
              <span className="mmd-navbtn__icon" aria-hidden="true">
                <i className={`bi ${icon}`} />
              </span>
              <span className="mmd-navbtn__label">{label}</span>
            </button>
          );
        })}

        <button
          className="btn btn-outline-light w-100 mt-4 mmd-sidebar__logout"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          type="button"
        >
          <span className="mmd-navbtn__icon" aria-hidden="true">
            <i className="bi bi-box-arrow-right" />
          </span>
          <span className="mmd-navbtn__label">Déconnexion</span>
        </button>
      </div>

      <button
        type="button"
        className="mmd-sidebar-toggle"
        aria-label="Toggle sidebar"
        onClick={() => setIsSidebarCollapsed((v) => !v)}
      >
        {isSidebarCollapsed ? "»" : "«"}
      </button>

      <div className="mmd-content">
        <div className="mmd-topbar mmd-topbar--fixed">
          <div className="mmd-topbar__spacer" />

          <div className="mmd-profile">
            <button
              type="button"
              className="mmd-profile__button"
              onClick={() => setIsProfileOpen((v) => !v)}
            >
              <span className="mmd-profile__label">{userDisplayName}</span>
              <span className="mmd-profile__chevron" aria-hidden="true">
                ▼
              </span>
            </button>

            {isProfileOpen ? (
              <div className="mmd-profile__menu" role="menu">
                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("rdv");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-calendar-check" />
                  </span>
                  <span className="mmd-profile__itemLabel">Rendez-Vous</span>
                </button>

                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("patients");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-people" />
                  </span>
                  <span className="mmd-profile__itemLabel">Patients</span>
                </button>

                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("consultation");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-heart-pulse" />
                  </span>
                  <span className="mmd-profile__itemLabel">Consultation</span>
                </button>

                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("paiements");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-credit-card-2-front" />
                  </span>
                  <span className="mmd-profile__itemLabel">Paiements</span>
                </button>

                <div className="mmd-profile__divider" />

                <button
                  type="button"
                  className="mmd-profile__item mmd-profile__item--logout"
                  onClick={async () => {
                    await logout();
                    setIsProfileOpen(false);
                    navigate("/login");
                  }}
                >
                  Déconnexion
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Push content below fixed topbar */}
        <div className="mmd-topbar--placeholder" />

        {renderContent()}
      </div>
    </div>
  );
};

export default SecretaireDashboard;
