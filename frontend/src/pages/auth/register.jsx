import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./register.css";

const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthConfig = {
  1: { label: "Très faible", color: "#FF6B6B" },
  2: { label: "Faible", color: "#FFB347" },
  3: { label: "Bon", color: "#87CEEB" },
  4: { label: "Excellent", color: "#00D4AA" },
};

const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
  </svg>
);

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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!termsAccepted) {
      setError("Veuillez accepter les conditions d'utilisation pour continuer.");
      return;
    }

    setLoading(true);
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

  const strength = getStrength(formData.password);
  const strengthInfo = strengthConfig[strength];

  const passwordsMatch =
    formData.password_confirmation &&
    formData.password === formData.password_confirmation;

  const passwordsMismatch =
    formData.password_confirmation &&
    formData.password !== formData.password_confirmation;

  const isFieldActive = (field) =>
    focusedField === field || formData[field] !== "";

  return (
    <div className="register-page">
      {/* ── Background ── */}
      <div className="register-bg">
        <div className="register-bg-image"></div>
        <div className="register-bg-overlay"></div>
      </div>

      {/* ── Main Container ── */}
      <div className={`register-container ${isLoaded ? "loaded" : ""}`}>
        <div className="register-card">
          <div className="r-card-shine"></div>

          {/* ── Logo ── */}
          <Link to="/" className="register-logo-area" aria-label="Aller à l'accueil">
            <img src="/images/brand.png" alt="MediManage" className="register-brand-img" />
            <span className="r-logo-text">MediManage</span>
          </Link>

          {/* ── Header ── */}
          <div className="register-header">
            <h1 className="register-title">Créer un compte</h1>
            <p className="register-subtitle">
              Rejoignez les professionnels de santé qui nous font confiance
            </p>
          </div>

          {/* ── Error Alert ── */}
          {error && (
            <div className="register-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ── Form ── */}
          <form className="register-form" onSubmit={handleSubmit} noValidate>

            {/* ── Role Selector ── */}
            <div className="role-selector-group">
              <span className="role-selector-label">Type de compte</span>
              <div className="role-selector" role="radiogroup">
                <label className={`role-option ${formData.role === "medecin" ? "role-option--active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="medecin"
                    checked={formData.role === "medecin"}
                    onChange={handleChange}
                    className="role-radio-hidden"
                  />
                  <div className="role-option-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6v0a6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3" />
                      <path d="M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4" />
                      <circle cx="20" cy="10" r="2" />
                    </svg>
                  </div>
                  <div className="role-option-info">
                    <span className="role-option-title">Médecin</span>
                    <span className="role-option-desc">Gérer mon cabinet</span>
                  </div>
                  {formData.role === "medecin" && (
                    <div className="role-option-check">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </label>

                <label className={`role-option ${formData.role === "patient" ? "role-option--active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === "patient"}
                    onChange={handleChange}
                    className="role-radio-hidden"
                  />
                  <div className="role-option-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="role-option-info">
                    <span className="role-option-title">Patient</span>
                    <span className="role-option-desc">Suivre ma santé</span>
                  </div>
                  {formData.role === "patient" && (
                    <div className="role-option-check">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* ── Name Row ── */}
            <div className="register-form-row">
              <div className={`r-input-group ${isFieldActive("nom") ? "focused" : ""} ${focusedField === "nom" ? "active" : ""}`}>
                <div className="r-input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="r-input-wrapper">
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("nom")}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="family-name"
                  />
                  <label htmlFor="nom" className="r-floating-label">Nom</label>
                  <div className="r-input-border-effect"></div>
                </div>
              </div>

              <div className={`r-input-group ${isFieldActive("prenom") ? "focused" : ""} ${focusedField === "prenom" ? "active" : ""}`}>
                <div className="r-input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="r-input-wrapper">
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("prenom")}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="given-name"
                  />
                  <label htmlFor="prenom" className="r-floating-label">Prénom</label>
                  <div className="r-input-border-effect"></div>
                </div>
              </div>
            </div>

            {/* ── Email ── */}
            <div className={`r-input-group ${isFieldActive("email") ? "focused" : ""} ${focusedField === "email" ? "active" : ""}`}>
              <div className="r-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M22 7L13.03 12.7a1.94 1.94 0 01-2.06 0L2 7" />
                </svg>
              </div>
              <div className="r-input-wrapper">
                <input
                  type="email"
                  id="regEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="email"
                />
                <label htmlFor="regEmail" className="r-floating-label">Adresse email</label>
                <div className="r-input-border-effect"></div>
              </div>
            </div>

            {/* ── Phone ── */}
            <div className={`r-input-group ${isFieldActive("telephone") ? "focused" : ""} ${focusedField === "telephone" ? "active" : ""}`}>
              <div className="r-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.59 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.56a16 16 0 006.53 6.53l.88-.88a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div className="r-input-wrapper">
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("telephone")}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="tel"
                />
                <label htmlFor="telephone" className="r-floating-label">Téléphone</label>
                <div className="r-input-border-effect"></div>
              </div>
            </div>

            {/* ── Médecin: Specialty ── */}
            {formData.role === "medecin" && (
              <div className={`r-input-group r-input-group--animated ${isFieldActive("specialite") ? "focused" : ""} ${focusedField === "specialite" ? "active" : ""}`}>
                <div className="r-input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className="r-input-wrapper">
                  <input
                    type="text"
                    id="specialite"
                    name="specialite"
                    value={formData.specialite}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("specialite")}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <label htmlFor="specialite" className="r-floating-label">Spécialité médicale</label>
                  <div className="r-input-border-effect"></div>
                </div>
              </div>
            )}

            {/* ── Patient: DOB + Gender ── */}
            {formData.role === "patient" && (
              <>
                <div className="register-form-row r-input-group--animated">
                  <div className={`r-input-group ${isFieldActive("date_naissance") ? "focused" : ""} ${focusedField === "date_naissance" ? "active" : ""}`}>
                    <div className="r-input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="r-input-wrapper">
                      <input
                        type="date"
                        id="date_naissance"
                        name="date_naissance"
                        value={formData.date_naissance}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("date_naissance")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <label htmlFor="date_naissance" className="r-floating-label r-floating-label--always">Date de naissance</label>
                      <div className="r-input-border-effect"></div>
                    </div>
                  </div>

                  <div className={`r-input-group ${isFieldActive("sexe") ? "focused" : ""} ${focusedField === "sexe" ? "active" : ""}`}>
                    <div className="r-input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 00-16 0" />
                      </svg>
                    </div>
                    <div className="r-input-wrapper r-select-wrapper">
                      <select
                        id="sexe"
                        name="sexe"
                        value={formData.sexe}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("sexe")}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={formData.sexe ? "has-value" : ""}
                      >
                        <option value="" disabled hidden></option>
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                      </select>
                      <label htmlFor="sexe" className="r-floating-label">Sexe</label>
                      <div className="r-input-border-effect"></div>
                      <div className="r-select-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`r-input-group r-input-group--animated ${isFieldActive("adresse") ? "focused" : ""} ${focusedField === "adresse" ? "active" : ""}`}>
                  <div className="r-input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="r-input-wrapper">
                    <input
                      type="text"
                      id="adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("adresse")}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoComplete="street-address"
                    />
                    <label htmlFor="adresse" className="r-floating-label">Adresse</label>
                    <div className="r-input-border-effect"></div>
                  </div>
                </div>
              </>
            )}

            {/* ── Password ── */}
            <div className={`r-input-group ${isFieldActive("password") ? "focused" : ""} ${focusedField === "password" ? "active" : ""}`}>
              <div className="r-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                  <circle cx="12" cy="16.5" r="1.5" />
                </svg>
              </div>
              <div className="r-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="new-password"
                />
                <label htmlFor="password" className="r-floating-label">Mot de passe</label>
                <div className="r-input-border-effect"></div>
              </div>
              <button
                type="button"
                className="r-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* ── Password Strength ── */}
            {formData.password && (
              <div className="password-strength-area">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`strength-bar ${strength >= level ? "filled" : ""}`}
                      style={{
                        backgroundColor: strength >= level ? strengthInfo?.color : "rgba(255,255,255,0.08)",
                      }}
                    ></div>
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthInfo?.color }}>
                  {strengthInfo?.label}
                </span>
              </div>
            )}

            {formData.password && (
              <div className="strength-hint">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>Utilisez majuscules, chiffres et symboles</span>
              </div>
            )}

            {/* ── Confirm Password ── */}
            <div className={`r-input-group ${isFieldActive("password_confirmation") ? "focused" : ""} ${focusedField === "confirm" ? "active" : ""} ${passwordsMatch ? "r-input-group--success" : ""} ${passwordsMismatch ? "r-input-group--error" : ""}`}>
              <div className="r-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <div className="r-input-wrapper">
                <input
                  type={showConfirm ? "text" : "password"}
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="new-password"
                />
                <label htmlFor="password_confirmation" className="r-floating-label">Confirmer le mot de passe</label>
                <div className="r-input-border-effect"></div>
              </div>
              <button
                type="button"
                className="r-password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
              {passwordsMatch && (
                <div className="r-match-indicator">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>

            {/* ── Password Mismatch Warning ── */}
            {passwordsMismatch && (
              <div className="password-mismatch">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Les mots de passe ne correspondent pas</span>
              </div>
            )}

            {/* ── Terms Checkbox ── */}
            <label className="r-terms">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="r-checkmark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="r-terms-text">
                J'accepte les{" "}
                <a href="#terms">conditions d'utilisation</a>
                {" "}et la{" "}
                <a href="#privacy">politique de confidentialité</a>
                {" "}de MediManage.
              </span>
            </label>

            {/* ── Submit Button ── */}
            <button
              type="submit"
              className={`register-btn ${loading ? "submitting" : ""}`}
              disabled={loading || passwordsMismatch}
            >
              <span className="r-btn-content">
                {loading ? (
                  <>
                    <div className="r-spinner"></div>
                    <span>Création en cours…</span>
                  </>
                ) : (
                  <>
                    <span>Créer mon compte</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="r-btn-arrow"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </span>
              <div className="r-btn-glow"></div>
            </button>
          </form>

          {/* ── Footer ── */}
          <div className="register-footer">
            <p>
              Déjà inscrit ?{" "}
              <Link to="/login" className="signin-link">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
