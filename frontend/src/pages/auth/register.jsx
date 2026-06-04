import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, UserRound } from "lucide-react";
import { AuthContext } from "../../context/authContext";
import "./register.css";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "medecin",
    specialite: "",
    date_naissance: "",
    adresse: "",
    sexe: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const role = await register(formData);
      if (role === "medecin") navigate("/medecin");
      else navigate("/patient");
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = formData.password ? getStrength(formData.password) : 0;
  const strengthLabels = ["", "Faible", "Moyen", "Bon", "Excellent"];
  const strengthClasses = ["", "strength-weak", "strength-medium", "strength-good", "strength-excellent"];

  return (
    <div className="auth-container">
      {/* Left Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper auth-form-wrapper-register">
          <Link to="/" className="auth-mobile-logo brand-home-link" aria-label="Aller à l'accueil">
            <div className="brand-logo-icon brand-logo-icon-mobile">
              <img src="/images/brand.png" alt="MediManage" className="brand-logo-image" />
            </div>
            <span className="brand-logo-text-dark">MediManage</span>
          </Link>

          <div className="auth-header">
            <h2 className="auth-title">Créer un compte</h2>
            <p className="auth-subtitle">Essai gratuit</p>
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
            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">Type de compte</label>
              <div className="role-selector">
                <label className={`role-option ${formData.role === "medecin" ? "role-option-selected" : ""}`}>
                  <input type="radio" name="role"
                    value="medecin" checked={formData.role === "medecin"}
                    onChange={handleChange}/>
                  {formData.role === "medecin" && (
                    <div className="role-check">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                  <div className="role-option-icon role-option-icon-medecin" aria-hidden="true">
                    <Stethoscope size={22} strokeWidth={2.2} />
                  </div>
                  <span className="role-label">Médecin</span>
                  <span className="role-sublabel">Gérer mon cabinet</span>
                </label>
                <label className={`role-option ${formData.role === "patient" ? "role-option-selected" : ""}`}>
                  <input type="radio" name="role"
                    value="patient" checked={formData.role === "patient"}
                    onChange={handleChange}/>

                  {formData.role === "patient" && (
                    <div className="role-check">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                  <div className="role-option-icon role-option-icon-patient" aria-hidden="true">
                    <UserRound size={22} strokeWidth={2.2} />
                  </div>
                  <span className="role-label">Patient</span>
                  <span className="role-sublabel">Suivre ma santé</span>
                </label>
              </div>
            </div>

            {/* Name Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom" className="form-label">Nom</label>
                <input type="text" id="nom" name="nom" 
                  value={formData.nom} onChange={handleChange}
                  placeholder="Mohamed" className="form-input" required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prenom" className="form-label">Prénom</label>
                <input type="text" id="prenom" name="prenom"
                  value={formData.prenom} onChange={handleChange} placeholder="Youssef" className="form-input"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Adresse email</label>
              <input type="email" id="email" name="email"
                value={formData.email} onChange={handleChange} placeholder="nom@cabinet.com"
                required autoComplete="email" className="form-input"/>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="telephone" className="form-label">Téléphone</label>
              <input type="tel" id="telephone" name="telephone"
                value={formData.telephone} onChange={handleChange} placeholder="+212 6 00 00 00 00"
                className="form-input" required />
            </div>

            {/* Medecin-specific */}
            {formData.role === "medecin" && (
              <div className="form-group">
                <label htmlFor="specialite" className="form-label">Spécialité médicale</label>
                <input type="text" id="specialite" name="specialite"
                  value={formData.specialite} onChange={handleChange}
                  placeholder="Cardiologue, Pédiatre…" className="form-input" required
                />
              </div>
            )}

            {/* Patient-specific */}
            {formData.role === "patient" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date_naissance" className="form-label">Date de naissance</label>
                    <input
                      type="date"
                      id="date_naissance"
                      name="date_naissance"
                      value={formData.date_naissance}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sexe" className="form-label">Sexe</label>
                    <div className="form-select-wrapper">
                      <select
                        id="sexe"
                        name="sexe"
                        value={formData.sexe}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Sélectionner</option>
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                      </select>
                      <div className="form-select-icon">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="adresse" className="form-label">Adresse</label>
                  <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    placeholder="12 Rue de la Santé, Paris"
                    required
                    className="form-input"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <div className="form-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8 caractères minimum"
                  required
                  autoComplete="new-password"
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
              {formData.password && (
                <div className="password-strength">
                  <div className="password-strength-bars">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`password-strength-bar ${i < strength ? strengthClasses[strength] : ""}`}
                      ></div>
                    ))}
                  </div>
                  <span className="password-strength-label">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="password_confirmation" className="form-label">Confirmer le mot de passe</label>
              <div className="form-input-wrapper">
                <input
                  type={showConfirm ? "text" : "password"}
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Répétez votre mot de passe"
                  required
                  autoComplete="new-password"
                  className="form-input form-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="form-password-toggle"
                  tabIndex={-1}
                >
                  {showConfirm ? (
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

            {/* Submit */}
            <button type="submit" disabled={loading} className="form-submit">
              {loading ? (
                <>
                  <svg className="form-spinner" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  <span>Création en cours…</span>
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>

            {/* Terms */}
            <p className="form-terms">
              En créant un compte, vous acceptez les{" "}
              <a href="#">conditions d'utilisation</a> et la{" "}
              <a href="#">politique de confidentialité</a>.
            </p>
          </form>

          <div className="auth-footer">
            <p>
              Déjà inscrit ?{" "}
              <Link to="/login" className="auth-footer-link">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>


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
              Rejoignez les
              <br />
              professionnels qui
              <br />
              <span className="brand-title-accent">nous font confiance.</span>
            </h1>

            <p className="brand-description">
              Créez votre compte en quelques minutes et commencez à gérer
              votre activité médicale avec sérénité.
            </p>

            <div className="brand-checklist">
              {[
                "Configuration en moins de 5 minutes",
                "Données hébergées en France, conformité RGPD",
                "Assistance dédiée par des experts santé",
                "Sans engagement, résiliable à tout moment",
              ].map((item) => (
                <div key={item} className="brand-checklist-item">
                  <div className="brand-checklist-icon">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="brand-testimonial">
              <p className="brand-testimonial-text">
                "MediManage a transformé la gestion de mon cabinet. L'interface
                est d'une clarté remarquable."
              </p>
              <div className="brand-testimonial-author">
                <div className="brand-testimonial-avatar">ML</div>
                <div className="brand-testimonial-info">
                  <div className="brand-testimonial-name">Dr. Lahlou Mohamed</div>
                  <div className="brand-testimonial-role">Cardiologue · Rabat</div>
                </div>
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
    </div>
  );
};

export default Register;
