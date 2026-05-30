import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    sexe: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError("Erreur lors de l'inscription");
      }
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

          <h1 className="brand-title">Rejoignez des milliers de professionnels de santé</h1>

          <div className="brand-features">
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Configuration en moins de 5 minutes</span>
            </div>
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Sécurité médicale certifiée</span>
            </div>
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Support dédié 7j/7</span>
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
              <h2>Créer votre compte</h2>
              <p>Commencez gratuitement</p>
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
              {/* Role Selection */}
              <div className="form-field">
                <label htmlFor="role">Type de compte</label>
                <div className="role-selector">
                  <label className={`role-option ${formData.role === "medecin" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="role"
                      value="medecin"
                      checked={formData.role === "medecin"}
                      onChange={handleChange}
                    />
                    <div className="role-content">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7V12C2 16.97 6.37 21.5 12 22C17.63 21.5 22 16.97 22 12V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 9V15M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <div>
                        <div className="role-title">Médecin</div>
                        <div className="role-desc">Gérer mon cabinet</div>
                      </div>
                    </div>
                  </label>
                  <label className={`role-option ${formData.role === "patient" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="role"
                      value="patient"
                      checked={formData.role === "patient"}
                      onChange={handleChange}
                    />
                    <div className="role-content">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M5 20C5 16.134 8.134 13 12 13C15.866 13 19 16.134 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <div>
                        <div className="role-title">Patient</div>
                        <div className="role-desc">Suivre ma santé</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="nom">Nom</label>
                  <input type="text" id="nom" name="nom"
                    value={formData.nom} onChange={handleChange}
                    placeholder="Votre nom" required />
                </div>
                <div className="form-field">
                  <label htmlFor="prenom">Prénom</label>
                  <input type="text" id="prenom" name="prenom"
                    value={formData.prenom} onChange={handleChange} placeholder="Votre prénom"/>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="email">Adresse email</label>
                <input type="email" id="email" name="email"
                  value={formData.email} onChange={handleChange} placeholder="nom@email.com" required/>
              </div>

              <div className="form-field">
                <label htmlFor="telephone">Téléphone</label>
                <input type="tel" id="telephone"
                  name="telephone" value={formData.telephone}
                  onChange={handleChange} placeholder="Ex: +212 6 00 00 00 00" required />
              </div>

              {formData.role === "medecin" && (
                <div className="form-field">
                  <label htmlFor="specialite">Spécialité médicale</label>
                  <input type="text" id="specialite"
                    name="specialite" value={formData.specialite} onChange={handleChange}
                    placeholder="Ex: Cardiologue, Pédiatre..." required />
                </div>
              )}

              {formData.role === "patient" && (
                <>
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="date_naissance">Date de naissance</label>
                      <input type="date" id="date_naissance" name="date_naissance"
                        value={formData.date_naissance} onChange={handleChange}  required />
                    </div>
                    <div className="form-field">
                      <label htmlFor="sexe">Sexe</label>
                      <select id="sexe" name="sexe"  value={formData.sexe}
                        onChange={handleChange} required>
                        <option value="">Choisir</option>
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="adresse">Adresse complète</label>
                    <input type="text" id="adresse"
                      name="adresse" value={formData.adresse}
                      onChange={handleChange} placeholder="Votre adresse" required/>
                  </div>
                </>
              )}

              <div className="form-field">
                <label htmlFor="password">Mot de passe</label>
                <input type="password" id="password"
                  name="password" value={formData.password}
                  onChange={handleChange} placeholder="Minimum 8 caractères" required/>
              </div>

              <div className="form-field">
                <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
                <input type="password" id="password_confirmation"
                  name="password_confirmation" value={formData.password_confirmation}
                  onChange={handleChange} placeholder="Répétez votre mot de passe" required />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Création en cours...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </button>

              <p className="terms-text">En créant un compte, vous acceptez nos{" "}
                <a href="#" className="link-text">conditions d'utilisation</a>
                {" "}et notre{" "}
                <a href="#" className="link-text">politique de confidentialité</a>.
              </p>
            </form>

            <div className="form-footer">
              <p>Vous avez déjà un compte ?{" "}
                <Link to="/login" className="link-primary">Se connecter</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
