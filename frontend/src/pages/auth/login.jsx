import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./login.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const role = await login(formData.email, formData.password);

      if (role === "medecin") navigate("/medecin");
      else if (role === "secretaire") navigate("/secretaire");
      else if (role === "patient") navigate("/patient");
      else navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Branding Panel */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="brand-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.15"/>
              <path d="M24 14V34M14 24H34" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
            </svg>
            <span className="brand-name">MediManage</span>
          </div>

          <h1 className="brand-title">
            Gestion médicale intelligente pour cabinets modernes
          </h1>

          <div className="brand-features">
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Gestion complète des dossiers patients</span>
            </div>
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Agenda et rendez-vous optimisés</span>
            </div>
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Interface intuitive et sécurisée</span>
            </div>
          </div>

          <div className="brand-decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-circle"></div>
            <div className="decoration-circle"></div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-panel">
        <div className="auth-wrapper">
          <div className="auth-form-container">
            <div className="form-header">
              <h2>Bon retour</h2>
              <p>Connectez-vous à votre espace MediManage</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 6V11M10 14V14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <label htmlFor="email">Adresse email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="link-text">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Nouveau sur MediManage ?{" "}
                <Link to="/register" className="link-primary">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
