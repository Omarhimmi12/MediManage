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

  return (
    <div className="d-flex mmd-medecin-dashboard">
      <div
        className={`mmd-sidebar ${isSidebarCollapsed ? "mmd-sidebar--collapsed" : ""}`}
      >
        <div className="mmd-brand">
          <img className="mmd-brand__img" src="/images/brand.png"/>
          <span className="mmd-brand__text">MediManage</span>
        </div>

        {[
          ["accueil", "Accueil", "bi-house"],
          ["patients", "Patients", "bi-person-badge"],
          ["rdv", "Agenda des RDV", "bi-calendar-check"],
          ["consultations", "Consultations", "bi-heart-pulse"],
          ["paiements", "Paiements", "bi-credit-card-2-front"],
          ["secretaires", "Secrétaires", "bi-people"],
          ["moncabinet", "Mon Cabinet", "bi-building"],
          ["parametres", "Paramètres", "bi-gear"],
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

      <div className="mmd-content">
        <div className="mmd-topbar mmd-topbar--fixed">
          <button
            type="button"
            className="mmd-topbar__toggle"
            aria-label="Toggle sidebar"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
          >
            {isSidebarCollapsed ? "»" : "«"}
          </button>
          <div className="mmd-topbar__spacer" />

          <div className="mmd-profile">
            <button
              type="button"
              className="mmd-profile__button"
              onClick={() => setIsProfileOpen((v) => !v)}
            >
              <span className="mmd-profile__label">
                Dr {user?.nom}
              </span>
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
                    setActiveSection("parametres");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-gear" />
                  </span>
                  <span className="mmd-profile__itemLabel">Profile</span>
                </button>

                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("accueil");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-house" />
                  </span>
                  <span className="mmd-profile__itemLabel">Accueil</span>
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
                    <i className="bi bi-person-badge" />
                  </span>
                  <span className="mmd-profile__itemLabel">Patients</span>
                </button>

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
                    setActiveSection("consultations");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-heart-pulse" />
                  </span>
                  <span className="mmd-profile__itemLabel">Consultations</span>
                </button>

                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("secretaires");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-people" />
                  </span>
                  <span className="mmd-profile__itemLabel">Secretaires</span>
                </button>

                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("moncabinet");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-building" />
                  </span>
                  <span className="mmd-profile__itemLabel">Mon Cabinet</span>
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

export default MedecinDashboard;
