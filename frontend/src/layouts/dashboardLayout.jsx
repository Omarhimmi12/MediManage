import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="bg-dark text-white"
        style={{ width: "260px", minHeight: "100vh" }}
      >
        <div className="p-4">
          <h4 className="fw-bold text-primary">MediManage</h4>
          <p className="text-muted small">Gestion de cabinet médical</p>
        </div>

        <ul className="nav flex-column px-3">
          <li className="nav-item mb-1">
            <Link to="/medecin" className="nav-link text-white">
              <i className="fas fa-home me-2"></i> Accueil
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/patients" className="nav-link text-white">
              <i className="fas fa-users me-2"></i> Patients
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/rendez-vous" className="nav-link text-white">
              <i className="fas fa-calendar-check me-2"></i> Rendez-vous
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/consultations" className="nav-link text-white">
              <i className="fas fa-stethoscope me-2"></i> Consultations
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/paiements" className="nav-link text-white">
              <i className="fas fa-credit-card me-2"></i> Paiements
            </Link>
          </li>
        </ul>

        <div className="mt-auto p-3">
          <button
            onClick={handleLogout}
            className="btn btn-outline-light w-100 mt-4"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light" style={{ minHeight: "100vh" }}>
        {/* Topbar */}
        <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un patient..."
              style={{ width: "300px" }}
            />
          </div>

          <div className="d-flex align-items-center">
            <span className="me-3">
              {user?.role === "medecin"
                ? `Bonjour, Docteur ${user?.nom}`
                : `Bonjour, ${user?.nom}`}
            </span>
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                {user?.nom}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;