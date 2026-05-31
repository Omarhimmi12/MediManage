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
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
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
      setError(err.response?.data?.message || "Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel */}
      <div className="auth-brand-panel">
        <div className="brand-bg-circle brand-bg-circle-1"></div>
        <div className="brand-bg-circle brand-bg-circle-2"></div>
        <div className="brand-bg-circle brand-bg-circle-3"></div>

        <div className="brand-content">
          <Link to="/" className="brand-logo brand-home-link" aria-label="Aller à l'accueil">
            <div className="brand-logo-icon">
              <img src="/images/brand.png" alt="MediManage" className="brand-logo-image" />
            </div>
            <span className="brand-logo-text">MediManage</span>
          </Link>

          <div className="brand-hero">
            <h1 className="brand-title">
              Gestion médicale
              <br />
              intelligente pour
              <br />
              <span className="brand-title-accent">cabinets modernes.</span>
            </h1>

            <p className="brand-description">
              Une plateforme complète pensée pour les professionnels de santé
              qui exigent fiabilité, sécurité et simplicité.
            </p>

            <div className="brand-stats">
              <div className="brand-stat">
                <div className="brand-stat-value">2,400+</div>
                <div className="brand-stat-label">Praticiens actifs</div>
              </div>
              <div className="brand-stat-divider"></div>
              <div className="brand-stat">
                <div className="brand-stat-value">99.9%</div>
                <div className="brand-stat-label">Disponibilité</div>
              </div>
              <div className="brand-stat-divider"></div>
              <div className="brand-stat">
                <div className="brand-stat-value">RGPD</div>
                <div className="brand-stat-label">Conforme</div>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            <span>© 2026 MediManage</span>
            <span className="brand-footer-dot">·</span>
            <a href="#">Confidentialité</a>
            <span className="brand-footer-dot">·</span>
            <a href="#">Conditions</a>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          <Link to="/" className="auth-mobile-logo brand-home-link" aria-label="Aller à l'accueil">
            <div className="brand-logo-icon">
              <img src="/images/brand.png" alt="MediManage" className="brand-logo-image" />
            </div>
            <span className="brand-logo-text-dark">MediManage</span>
          </Link>

          <div className="auth-header">
            <h2 className="auth-title">Bon retour</h2>
            <p className="auth-subtitle">Connectez-vous à votre espace MediManage</p>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Adresse email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nom@cabinet.com"
                required
                autoComplete="email"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <Link to="/forgot-password" className="form-link">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="form-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="form-input form-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="form-password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-checkbox-group">
              <button
                type="button"
                role="checkbox"
                aria-checked={formData.remember}
                onClick={() => setFormData({ ...formData, remember: !formData.remember })}
                className={`form-checkbox ${formData.remember ? "form-checkbox-checked" : ""}`}
              >
                {formData.remember && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1.5 4.5L4 7L9.5 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span
                className="form-checkbox-label"
                onClick={() => setFormData({ ...formData, remember: !formData.remember })}
              >
                Rester connecté sur cet appareil
              </span>
            </div>

            <button type="submit" disabled={loading} className="form-submit">
              {loading ? (
                <>
                  <svg className="form-spinner" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  <span>Connexion…</span>
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Pas encore de compte ?{" "}
              <Link to="/register" className="auth-footer-link">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
