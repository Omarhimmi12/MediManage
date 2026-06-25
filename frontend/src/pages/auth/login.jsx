import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import './login.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const role = await login(email, password);
      if (role === 'admin') navigate('/admin');
      else if (role === 'medecin') navigate('/medecin');
      else if (role === 'secretaire') navigate('/secretaire');
      else navigate('/patient');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-image"></div>
        <div className="login-bg-overlay"></div>
      </div>     

      <div className={`login-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="login-card">
          <div className="card-shine"></div>

          <Link to="/" className="register-logo-area" aria-label="Aller à l'accueil">
            <img src="/images/brand.png" alt="MediManage" className="register-brand-img" />
            <span className="logo-text">MediManage</span>
          </Link>

          <div className="login-header">
            <h1 className="login-title">Se connecter</h1>
          </div>

          {/* Error alert */}
          {error && (
            <div className="login-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div
              className={`input-group ${emailFocused || email ? 'focused' : ''} ${emailFocused ? 'active' : ''}`}
            >
              <div className="input-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M22 7L13.03 12.7a1.94 1.94 0 01-2.06 0L2 7" />
                </svg>
              </div>
              <div className="input-wrapper">
                <input type="email" id="email"
                  value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  autoComplete="email"
                />
                <label htmlFor="email" className="floating-label">Adresse e-mail</label>
                <div className="input-border-effect"></div>
              </div>
            </div>

            <div
              className={`input-group ${passwordFocused || password ? 'focused' : ''} ${passwordFocused ? 'active' : ''}`}
            >
              <div className="input-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                  <circle cx="12" cy="16.5" r="1.5" />
                </svg>
              </div>
              <div className="input-wrapper">
                <input type={showPassword ? 'text' : 'password'} id="password"
                  value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)} required
                  autoComplete="current-password"
                />
                <label htmlFor="password" className="floating-label">Mot de passe</label>
                <div className="input-border-effect"></div>
              </div>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="remember-text">Se souvenir de moi</span>
              </label>
              <a href="#forgot" className="forgot-link">Mot de passe oublié ?</a>
            </div>

            <button
              type="submit"
              className={`login-btn ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              <span className="btn-content">
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    
                  </>
                )}
              </span>
              <div className="btn-glow"></div>
            </button>
          </form>
          <div className="login-footer">
            <p> Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="create-account-link">Créer un compte</Link>
            </p>
          </div>
        </div>       
      </div>
    </div>
  );
};

export default Login;
