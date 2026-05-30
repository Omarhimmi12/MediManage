import { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslator } from './translator';
import "bootstrap-icons/font/bootstrap-icons.css";
import './LandingPage.css';

function LanguageFlag({ code, className = '' }) {
  const ukFlagClipId = useId();

  if (code === 'fr') {
    return (
      <svg
        className={className}
        width="20"
        height="14"
        viewBox="0 0 3 2"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="1" height="2" x="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
      </svg>
    );
  }

  if (code === 'ar') {
    return (
      <svg
        className={className}
        width="20"
        height="14"
        viewBox="0 0 30 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="30" height="20" rx="2" fill="#C1272D" />
        <path
          d="M15 4.2 L16.9 9.7 H22.7 L18 13.1 L19.8 18.6 L15 15.2 L10.2 18.6 L12 13.1 L7.3 9.7 H13.1 Z"
          fill="none"
          stroke="#006233"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      width="20"
      height="14"
      viewBox="0 0 60 30"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={ukFlagClipId}>
          <rect width="60" height="30" rx="2" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${ukFlagClipId})`} shapeRendering="geometricPrecision">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0 L60 30" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="butt" />
        <path d="M60 0 L0 30" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="butt" />
        <path d="M0 0 L60 30" stroke="#C8102E" strokeWidth="5" strokeLinecap="butt" />
        <path d="M60 0 L0 30" stroke="#C8102E" strokeWidth="5" strokeLinecap="butt" />
        <path d="M30 0 V30" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="butt" />
        <path d="M0 15 H60" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="butt" />
        <path d="M30 0 V30" stroke="#C8102E" strokeWidth="6" strokeLinecap="butt" />
        <path d="M0 15 H60" stroke="#C8102E" strokeWidth="6" strokeLinecap="butt" />
      </g>
    </svg>
  );
}

function ContactForm({ t }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: '',
    message: '',
    newsletter: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = t('contact.error.name');
    if (!formData.email.trim()) nextErrors.email = t('contact.error.email');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = t('contact.error.email');

    if (!formData.subject) nextErrors.subject = t('contact.error.subject');

    if (!formData.message.trim()) nextErrors.message = t('contact.error.message');
    else if (formData.message.trim().length < 10) nextErrors.message = t('contact.error.message');

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setShowError('');
    setShowSuccess(false);

    try {
      // Simulated async submit (replace with real API later if needed)
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setShowSuccess(true);

      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        subject: '',
        message: '',
        newsletter: false,
      });

      setErrors({});
      window.setTimeout(() => setShowSuccess(false), 5000);
    } catch (_error) {
      setShowError(t('contact.error.submit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="medi-contact-form" aria-label={t('contact.form.ariaLabel')} onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="contact-name" className="medi-form-label">
          {t('contact.form.name')} <span className="sr-only">{t('contact.form.requiredHint')}</span>
        </label>
        <input type="text" id="contact-name"
          className={`form-control medi-form-input ${errors.name ? 'is-invalid' : formData.name ? 'is-valid' : ''}`}
          placeholder={t('contact.form.name.placeholder')}
          value={formData.name}
          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          required
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? <div className="invalid-feedback">{errors.name}</div> : null}
      </div>

      <div className="mb-4">
        <label htmlFor="contact-email" className="medi-form-label">
          {t('contact.form.email')} <span className="sr-only">{t('contact.form.requiredHint')}</span>
        </label>
        <input type="email" id="contact-email"
          className={`form-control medi-form-input ${errors.email ? 'is-invalid' : formData.email ? 'is-valid' : ''}`}
          placeholder={t('contact.form.email.placeholder')}
          value={formData.email}
          onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
          required
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
      </div>

      <div className="mb-4">
        <label htmlFor="contact-phone" className="medi-form-label">
          {t('contact.form.phone')}
        </label>
        <input type="tel" id="contact-phone"
          className="form-control medi-form-input"
          placeholder={t('contact.form.phone.placeholder')}
          value={formData.phone}
          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="contact-org" className="medi-form-label">
          {t('contact.form.org')}
        </label>
        <input type="text" id="contact-org"
          className="form-control medi-form-input" placeholder={t('contact.form.org.placeholder')}
          value={formData.organization} onChange={(e) => setFormData((p) => ({ ...p, organization: e.target.value }))}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="contact-subject" className="medi-form-label">
          {t('contact.form.subject')} <span className="sr-only">{t('contact.form.requiredHint')}</span>
        </label>
        <select id="contact-subject"
          className={`form-select medi-form-select ${errors.subject ? 'is-invalid' : formData.subject ? 'is-valid' : ''}`}
          required value={formData.subject}
          onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
          aria-invalid={Boolean(errors.subject)}>
          <option value="">{t('contact.subject.default')}</option>
          <option value="demo">{t('contact.subject.demo')}</option>
          <option value="support">{t('contact.subject.support')}</option>
          <option value="partnership">{t('contact.subject.partnership')}</option>
          <option value="other">{t('contact.subject.other')}</option>
        </select>
        {errors.subject ? <div className="invalid-feedback">{errors.subject}</div> : null}
      </div>

      <div className="mb-4">
        <label htmlFor="contact-message" className="medi-form-label">
          {t('contact.form.message')} <span className="sr-only">{t('contact.form.requiredHint')}</span>
        </label>
        <textarea
          id="contact-message"
          rows="5"
          className={`form-control medi-form-textarea ${errors.message ? 'is-invalid' : formData.message ? 'is-valid' : ''}`}
          placeholder={t('contact.form.message.placeholder')}
          value={formData.message}
          onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
          required
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message ? <div className="invalid-feedback">{errors.message}</div> : null}
      </div>

      <div className="form-check mb-4 medi-form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="contact-newsletter"
          checked={formData.newsletter}
          onChange={(e) => setFormData((p) => ({ ...p, newsletter: e.target.checked }))}
        />
        <label className="form-check-label" htmlFor="contact-newsletter">
          {t('contact.form.newsletter')}
        </label>
      </div>

      <button type="submit" className="btn medi-btn-submit w-100" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            {t('contact.form.sending')}
          </>
        ) : (
          <>
            <span>{t('contact.form.submit')}</span>
            <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
          </>
        )}
      </button>

      <p className="medi-form-privacy">
        {t('contact.form.privacy.part1')}{' '}
        <a href="/privacy">{t('contact.form.privacy.privacyPolicy')}</a>{' '}
        {t('contact.form.privacy.part2')}{' '}
        <a href="/terms">{t('contact.form.privacy.termsOfService')}</a>.
      </p>

      <div className="medi-form-success" style={{ display: showSuccess ? 'block' : 'none' }} aria-live="polite">
        <div className="medi-success-icon" aria-hidden="true">
          <i className="bi bi-check-circle" />
        </div>
        <h4>{t('contact.success.title')}</h4>
        <p>{t('contact.success.text')}</p>
      </div>

      <div className="medi-form-error" style={{ display: showError ? 'block' : 'none' }} aria-live="assertive">
        <div className="medi-error-icon" aria-hidden="true">
          <i className="bi bi-exclamation-triangle" />
        </div>
        <p className="medi-error-text">{showError}</p>
      </div>
    </form>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const { lang, setLang, t, dir, LANGUAGES } = useTranslator();
  const currentLanguage = LANGUAGES.find((item) => item.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    const onPointerDown = (e) => {
      const target = e.target;
      if (!target) return;
      if (target.closest && target.closest('[data-lang-root="true"]')) return;
      setLangOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Scroll‑reveal observer ── */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const useCounter = (end, duration = 2000, suffix = '') => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            let startTime = null;
            const step = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.floor(eased * end));
              if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        },
        { threshold: 0.3 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, [end, duration]);

    return { ref, display: `${count.toLocaleString()}${suffix}` };
  };

  const stat1 = useCounter(2500, 2200, '+');
  const stat2 = useCounter(98, 2000, '%');
  const stat3 = useCounter(4, 1800, 'M+');
  const stat4 = useCounter(50, 2000, '+');

  /* smooth scroll helper */
  const scrollTo = useCallback((id) => {
    setMobileOpen(false);
    setLangOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const featureCopy = useMemo(
    () => [
      {
        iconClass: 'bi bi-calendar-check',
        iconColorClass: 'medi-feature-icon-emerald',
        hoverBorderColor: '#34d399',
        titleKey: 'features.smart.title',
        descKey: 'features.smart.desc',
        bgClass: 'medi-feature-bg-emerald',
      },
      {
        iconClass: 'bi bi-people',
        iconColorClass: 'medi-feature-icon-purple',
        hoverBorderColor: '#a855f7',
        titleKey: 'features.patient.title',
        descKey: 'features.patient.desc',
        bgClass: 'medi-feature-bg-ivory',
      },
      {
        iconClass: 'bi bi-capsule',
        iconColorClass: 'medi-feature-icon-gold',
        hoverBorderColor: '#f59e0b',
        titleKey: 'features.rx.title',
        descKey: 'features.rx.desc',
        bgClass: 'medi-feature-bg-gold',
      },
      {
        iconClass: 'bi bi-graph-up',
        iconColorClass: 'medi-feature-icon-royal',
        hoverBorderColor: '#60a5fa',
        titleKey: 'features.revenue.title',
        descKey: 'features.revenue.desc',
        bgClass: 'medi-feature-bg-charcoal',
      },
      {
        iconClass: 'bi bi-person-badge',
        iconColorClass: 'medi-feature-icon-charcoal',
        hoverBorderColor: '#94a3b8',
        titleKey: 'features.team.title',
        descKey: 'features.team.desc',
        bgClass: 'medi-feature-bg-emerald',
      },
      {
        iconClass: 'bi bi-bell',
        iconColorClass: 'medi-feature-icon-warm',
        hoverBorderColor: '#fb7185',
        titleKey: 'features.notif.title',
        descKey: 'features.notif.desc',
        bgClass: 'medi-feature-bg-ivory',
      },
    ],
    []
  );

  const howSteps = useMemo(
    () => [
      {
        num: '01',
        titleKey: 'how.step1.title',
        descKey: 'how.step1.desc',
        numTone: 'emerald',
      },
      {
        num: '02',
        titleKey: 'how.step2.title',
        descKey: 'how.step2.desc',
        numTone: 'purple',
      },
      {
        num: '03',
        titleKey: 'how.step3.title',
        descKey: 'how.step3.desc',
        numTone: 'gold',
      },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        textKey: 'testimonial1.text',
        nameKey: 'testimonial1.name',
        roleKey: 'testimonial1.role',
        avatar: 'R',
        bgClass: 'medi-avatar-emerald',
      },
      {
        textKey: 'testimonial2.text',
        nameKey: 'testimonial2.name',
        roleKey: 'testimonial2.role',
        avatar: 'J',
        bgClass: 'medi-avatar-purple',
      },
      {
        textKey: 'testimonial3.text',
        nameKey: 'testimonial3.name',
        roleKey: 'testimonial3.role',
        avatar: 'S',
        bgClass: 'medi-avatar-gold',
      },
    ],
    []
  );

  return (
    <div className="medi-landing" dir={dir}>
      {/* ────────────────── NAVBAR ────────────────── */}
      <nav className={`medi-navbar-wrapper${scrolled ? ' scrolled' : ''}`}>
        <div className="medi-navbar">
          <div className="medi-navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="medi-navbar-logo-icon">
              <i className="bi bi-hospital-fill" aria-hidden="true" />
            </div>
            <span className="medi-navbar-logo-text">MediManage</span>
          </div>

          <div className="medi-navbar-links">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>{t('nav.features')}</a>
            <a href="#how" onClick={(e) => { e.preventDefault(); scrollTo('how'); }}>{t('nav.how')}</a>
            <a href="#problem" onClick={(e) => { e.preventDefault(); scrollTo('problem'); }}>{t('nav.whyUs')}</a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollTo('testimonials'); }}>{t('nav.reviews')}</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>{t('nav.contact')}</a>
          </div>

          <div className="medi-navbar-actions">
            {/* Language Dropdown */}
            <div className="medi-lang" data-lang-root="true">
              <button type="button" className="medi-lang-toggle justify-content-center"
                aria-haspopup="menu" aria-expanded={langOpen}
                onClick={() => setLangOpen((v) => !v)}>
                <LanguageFlag code={currentLanguage.code} className="medi-lang-flag" />
                <span className="medi-lang-label">{currentLanguage.label}</span>
                <svg className="medi-lang-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {langOpen && (
                <div className="medi-lang-menu" role="menu">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} type="button"
                      className={`medi-lang-item${lang === l.code ? ' active' : ''}`} role="menuitem"
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                    >
                      <LanguageFlag code={l.code} className="medi-lang-item-flag" />
                      <span className="medi-lang-item-text">{l.label}</span>
                      {lang === l.code && <i className="bi bi-check2 medi-lang-item-check" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="medi-btn medi-btn-ghost" onClick={() => navigate('/login')}>{t('nav.login')}</button>
            <button className="medi-btn medi-btn-primary" onClick={() => navigate('/register')}>{t('nav.getStarted')}</button>

            <button className="medi-navbar-toggle" onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? t('mobile.closeMenu') : t('mobile.openMenu')}
              aria-expanded={mobileOpen} aria-controls="medi-mobile-menu">
              {mobileOpen ? (
                <i className="bi bi-x-lg" aria-hidden="true" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <button
          type="button"
          className="medi-mobile-backdrop"
          aria-label={t('mobile.closeMenu')}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={`medi-mobile-menu${mobileOpen ? ' open' : ''}`} id="medi-mobile-menu">
        <button className="medi-mobile-close" onClick={() => setMobileOpen(false)} aria-label={t('mobile.closeMenu')}>
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
        <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>{t('nav.features')}</a>
        <a href="#how" onClick={(e) => { e.preventDefault(); scrollTo('how'); }}>{t('nav.how')}</a>
        <a href="#problem" onClick={(e) => { e.preventDefault(); scrollTo('problem'); }}>{t('nav.whyUs')}</a>
        <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollTo('testimonials'); }}>{t('nav.reviews')}</a>
        <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>{t('nav.contact')}</a>
        <button className="medi-btn medi-btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>{t('nav.login')}</button>
        <button className="medi-btn medi-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/register')}>{t('nav.getStarted')}</button>
      </div>

      {/* ────────────────── HERO ────────────────── */}
      <section className="medi-hero">
        <div className="medi-container">
          <div className="medi-hero-grid">
            {/* Left – Copy */}
            <div className="medi-hero-content">             
              <h1 className="medi-hero-title">
                {t('hero.title.part1')}
                <br />
                <span className="medi-hero-title-accent">{t('hero.title.part2')}</span>
              </h1>
              <p className="medi-hero-subtitle">{t('hero.subtitle')}</p>
              <div className="medi-hero-actions">
                <button
                  className="medi-btn medi-btn-primary medi-btn-primary-lg" onClick={() => navigate('/register')}>
                  {t('hero.cta.primary')}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
                <button
                  className="medi-btn medi-btn-secondary medi-btn-secondary-lg"
                  onClick={() => scrollTo('contact')}>
                  <span className="medi-play-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>                  
                  </span>
                  {t('hero.cta.secondary')}
                </button>
              </div>

              <div className="medi-hero-trust">
                <div className="medi-hero-trust-avatars" aria-hidden="true">
                  <div className="medi-hero-trust-avatar medi-avatar-emerald bg-success">S</div>
                  <div className="medi-hero-trust-avatar medi-avatar-charcoal bg-danger">A</div>
                  <div className="medi-hero-trust-avatar medi-avatar-gold bg-warning">M</div>
                  <div className="medi-hero-trust-avatar medi-avatar-emerald bg-black text-white">K</div>
                </div>
                <div>
                  <div className="medi-hero-trust-stars" aria-label="5 stars">
                    <i className="bi bi-star-fill" aria-hidden="true" />
                    <i className="bi bi-star-fill" aria-hidden="true" />
                    <i className="bi bi-star-fill" aria-hidden="true" />
                    <i className="bi bi-star-fill" aria-hidden="true" />
                    <i className="bi bi-star-fill" aria-hidden="true" />
                  </div>
                  <div className="medi-hero-trust-text"><strong>{t('hero.trust.rating')}</strong> {t('hero.trust.text')}</div>
                </div>
              </div>
            </div>

            {/* Right – Floating Dashboard */}
            <div className="medi-hero-visual">
              <div className="medi-hero-scene">
                <div className="medi-hero-glow-1" />
                <div className="medi-hero-glow-2" />

                {/* Appointment Card */}
                <div className="medi-floating-card medi-float-appointment">
                  <div className="medi-float-appointment-header">
                    <span className="medi-float-appointment-title">
                      <i className="bi bi-calendar-event me-2" aria-hidden="true" />
                      {t('float.schedule.title')}
                    </span>
                    <span className="medi-float-appointment-badge">{t('float.schedule.badge')}</span>
                  </div>
                  <div className="medi-float-appointment-item">
                    <span className="medi-float-appointment-dot" style={{ background: '#10b981' }} />
                    <div className="medi-float-appointment-info">
                      <div className="medi-float-appointment-name">{t('float.appt.sarah')}</div>
                      <div className="medi-float-appointment-time">{t('float.appt.t1')}</div>
                    </div>
                  </div>
                  <div className="medi-float-appointment-item">
                    <span className="medi-float-appointment-dot" style={{ background: '#0f172a' }} />
                    <div className="medi-float-appointment-info">
                      <div className="medi-float-appointment-name">{t('float.appt.michael')}</div>
                      <div className="medi-float-appointment-time">{t('float.appt.t2')}</div>
                    </div>
                  </div>
                  <div className="medi-float-appointment-item">
                    <span className="medi-float-appointment-dot" style={{ background: '#f59e0b' }} />
                    <div className="medi-float-appointment-info">
                      <div className="medi-float-appointment-name">{t('float.appt.emily')}</div>
                      <div className="medi-float-appointment-time">{t('float.appt.t3')}</div>
                    </div>
                  </div>
                </div>

                {/* Patient Card */}
                <div className="medi-floating-card medi-float-patient">
                  <div className="medi-float-patient-header">
                    <div className="medi-float-patient-avatar medi-avatar-ivory" aria-hidden="true">
                      <i className="bi bi-person" />
                    </div>
                    <div className="medi-float-patient-copy">
                      <div className="medi-float-patient-name">{t('float.patient.name')}</div>
                      <div className="medi-float-patient-meta">{t('float.patient.meta')}</div>
                    </div>
                  </div>
                  <div className="medi-float-patient-stats">
                    <div className="medi-float-patient-stat">
                      <div className="medi-float-patient-stat-val">12</div>
                      <div className="medi-float-patient-stat-label">{t('float.patient.visits')}</div>
                    </div>
                    <div className="medi-float-patient-stat">
                      <div className="medi-float-patient-stat-val">3</div>
                      <div className="medi-float-patient-stat-label">{t('float.patient.rx')}</div>
                  </div>
                </div>
                </div>

                {/* Revenue Chart */}
                <div className="medi-floating-card medi-float-revenue">
                  <div className="medi-float-revenue-header">
                    <span className="medi-float-revenue-title">{t('float.revenue.title')}</span>
                    <span className="medi-float-revenue-change">{t('float.revenue.change')}</span>
                  </div>
                  <div className="medi-float-revenue-amount">{t('float.revenue.amount')}</div>
                  <div className="medi-float-revenue-bars">
                    {[35, 52, 41, 68, 55, 73, 82, 65, 90, 78, 95, 88].map((h, i) => {
                      const base = i >= 8 ? '#10b981' : '#d1fae5';
                      const border = i >= 8 ? '#059669' : '#a7f3d0';
                      return (
                        <div
                          key={i}
                          className="medi-float-revenue-bar"
                          style={{
                            height: `${h}%`,
                            background: base,
                            outline: `1px solid ${border}`,
                            outlineOffset: '-1px',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Notifications */}
                <div className="medi-floating-card medi-float-notif">
                  <div className="medi-float-notif-title">
                    <span className="medi-float-notif-dot" />
                    {t('float.notif.title')}
                  </div>
                  <div className="medi-float-notif-item">
                    <div className="medi-float-notif-icon"
                      style={{ background: "#ecfdf5", color: "#059669" }}
                    >
                      <i className="bi bi-check2"></i>
                    </div>
                    <div className="medi-float-notif-text">{t("float.notif.item1")}</div>
                  </div>

                  <div className="medi-float-notif-item">
                    <div className="medi-float-notif-icon" style={{ background: "#fef3c7", color: "#b45309" }}>
                      <i className="bi bi-lightning-fill"></i>
                    </div>
                    <div className="medi-float-notif-text">
                      {t("float.notif.item2")}
                    </div>
                  </div>

                  <div className="medi-float-notif-item">
                    <div className="medi-float-notif-icon" style={{ background: "#f3e8ff", color: "#6d28d9" }}>
                      <i className="bi bi-capsule"></i>
                    </div>
                    <div className="medi-float-notif-text">
                      {t("float.notif.item3")}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── SOCIAL PROOF ────────────────── */}
      <section className="medi-social-proof">
        <div className="medi-container">
          <div className="medi-social-proof-inner reveal">
            <div className="medi-social-proof-text">{t('social.proof.text')}</div>
            <div className="medi-social-proof-logos">
              <div className="medi-social-proof-logo"> {t('social.proof.clinic1')}</div>
              <div className="medi-social-proof-logo"> {t('social.proof.clinic2')}</div>
              <div className="medi-social-proof-logo"> {t('social.proof.clinic3')}</div>
              <div className="medi-social-proof-logo"> {t('social.proof.clinic4')}</div>
              <div className="medi-social-proof-logo"> {t('social.proof.clinic5')}</div>
              
            </div>
            <div className="medi-social-proof-stats">
              <div className="medi-social-proof-stat">
                <div className="medi-social-proof-stat-value">2,500+</div>
                <div className="medi-social-proof-stat-label">{t('social.proof.stat1')}</div>
              </div>
              <div className="medi-social-proof-stat">
                <div className="medi-social-proof-stat-value">4M+</div>
                <div className="medi-social-proof-stat-label">{t('social.proof.stat2')}</div>
              </div>
              <div className="medi-social-proof-stat">
                <div className="medi-social-proof-stat-value">99.9%</div>
                <div className="medi-social-proof-stat-label">{t('social.proof.stat3')}</div>
              </div>
              <div className="medi-social-proof-stat">
                <div className="medi-social-proof-stat-value">
                  4.9 <i className="bi bi-star-fill" aria-hidden="true" />
                </div>
                <div className="medi-social-proof-stat-label">{t('social.proof.stat4')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── FEATURES ────────────────── */}
      <section className="medi-section medi-features" id="features">
        <div className="medi-container">
          <div className="medi-section-header reveal">
            <div className="medi-section-label">{t('features.label')}</div>            
            <p className="medi-section-subtitle">{t('features.subtitle')}</p>
          </div>

          <div className="medi-features-grid">
            {featureCopy.map((f, i) => (
              <div
                key={i}
                className={`medi-feature-card reveal reveal-delay-${i < 6 ? i + 1 : 6}`}
                style={{ borderColor: 'transparent', '--medi-feature-hover-border': f.hoverBorderColor }}
              >
                <div className={`medi-feature-icon ${f.bgClass}`}>
                  <i className={`${f.iconClass} ${f.iconColorClass}`} aria-hidden="true" />
                </div>
                <div className="medi-feature-header-inline">
                  <div className="medi-feature-title">{t(f.titleKey)}</div>
                </div>

                <div className="medi-feature-desc">{t(f.descKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── HOW IT WORKS ────────────────── */}
      <section className="medi-section medi-how" id="how">
        <div className="medi-container">
          <div className="medi-section-header reveal">
            <div className="medi-section-label">{t('how.label')}</div>
            <p className="medi-section-subtitle">{t('how.subtitle')}</p>
          </div>

          <div className="medi-how-timeline">
            {howSteps.map((s, i) => (
              <div key={i} className={`medi-how-step reveal reveal-delay-${i + 1}`}>
                <div className={`medi-how-step-number tone-${s.numTone}`}>{s.num}</div>
                <div className="medi-how-step-title">{t(s.titleKey)}</div>
                <div className="medi-how-step-desc">{t(s.descKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── STATISTICS ────────────────── */}
      <section className="medi-section medi-stats">
          <img className="medi-hero-bg" src="/images/nurse.jpg" alt="" aria-hidden="true" />
        <div className="medi-container">
          <div className="medi-section-header reveal" style={{ marginBottom: 48 }}>
            <div className="medi-section-label medi-section-label-invert">{t('stats.label')}</div>
            <p className="medi-section-subtitle medi-section-subtitle-invert">{t('stats.subtitle')}</p>
          </div>

          <div className="medi-stats-grid">
            <div className="medi-stat-card reveal reveal-delay-1" ref={stat1.ref}>
              <div className="medi-stat-value">{stat1.display}</div>
              <div className="medi-stat-label">{t('stats.clinics')}</div>
            </div>
            <div className="medi-stat-card reveal reveal-delay-2" ref={stat2.ref}>
              <div className="medi-stat-value">{stat2.display}</div>
              <div className="medi-stat-label">{t('stats.satisfaction')}</div>
            </div>
            <div className="medi-stat-card reveal reveal-delay-3" ref={stat3.ref}>
              <div className="medi-stat-value">{stat3.display}</div>
              <div className="medi-stat-label">{t('stats.appointments')}</div>
            </div>
            <div className="medi-stat-card reveal reveal-delay-4" ref={stat4.ref}>
              <div className="medi-stat-value">{stat4.display}</div>
              <div className="medi-stat-label">{t('stats.countries')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── THE PROBLEM ────────────────── */}
      <section className="medi-section medi-problem" id="problem">
        <div className="medi-container">
          <div className="medi-section-header reveal">
            <div className="medi-section-label">{t('problem.label')}</div>
            <h2 className="medi-section-title">{t('problem.title')}</h2>
          </div>

          <div className="medi-problem-grid">
            <div className="medi-problem-copy">
              <p className="medi-problem-lead">
                {t('problem.lead')}
              </p>

              <div className="medi-problem-list">
                <ul>
                  <li>{t('problem.item1')}</li>
                  <li>{t('problem.item2')}</li>
                  <li>{t('problem.item3')}</li>
                  <li>{t('problem.item4')}</li>
                  <li>{t('problem.item5')}</li>
                </ul>
              </div>
            </div>

            <div className="medi-problem-imageWrap">
             <img className="medi-problem-image" src="/images/doct.png" />
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── TESTIMONIALS ────────────────── */}
      <section className="medi-section medi-testimonials" id="testimonials">
        <div className="medi-container">
          <div className="medi-section-header reveal">
            <div className="medi-section-label">{t('testimonials.label')}</div>
            <h2 className="medi-section-title">{t('testimonials.title')}</h2>
            <p className="medi-section-subtitle">{t('testimonials.subtitle')}</p>
          </div>

          <div className="medi-testimonials-grid">
            {testimonials.map((tt, i) => (
              <div key={i} className={`medi-testimonial-card reveal reveal-delay-${i + 1}`}>
                <div className="medi-testimonial-stars" aria-label="5 stars">
                  <i className="bi bi-star-fill" aria-hidden="true" />
                  <i className="bi bi-star-fill" aria-hidden="true" />
                  <i className="bi bi-star-fill" aria-hidden="true" />
                  <i className="bi bi-star-fill" aria-hidden="true" />
                  <i className="bi bi-star-fill" aria-hidden="true" />
                </div>
                <div className="medi-testimonial-text">{t(tt.textKey)}</div>
                <div className="medi-testimonial-author">
                  <div className={`medi-testimonial-avatar ${tt.bgClass}`}>{tt.avatar}</div>
                  <div>
                    <div className="medi-testimonial-name">{t(tt.nameKey)}</div>
                    <div className="medi-testimonial-role">{t(tt.roleKey)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── CONTACT ────────────────── */}
      <section id="contact" className="medi-contact-section">
        <div className="container">
          <div className="row g-4 align-items-start">
            {/* Left column: info */}
            <div className="col-12 col-lg-5">
              <div className="medi-contact-left reveal-left">
                <div className="medi-contact-label">{t('contact.label')}</div>
                <h2 className="medi-contact-headline">{t('contact.title')}</h2>
                <p className="medi-contact-subtitle">{t('contact.subtitle')}</p>

                <div className="medi-contact-methods" aria-label={t('contact.methods.ariaLabel')}>
                  <div className="medi-contact-card">
                    <div className="medi-contact-icon" aria-hidden="true">
                      <i className="bi bi-envelope" />
                    </div>
                    <div className="medi-contact-details">
                      <div className="medi-contact-card-label">{t('contact.email.label')}</div>
                      <a className="medi-contact-card-value" href="mailto:support@medimanage.com">
                        {t('contact.email.value')}
                      </a>
                    </div>
                  </div>

                  <div className="medi-contact-card">
                    <div className="medi-contact-icon" aria-hidden="true">
                      <i className="bi bi-telephone" />
                    </div>
                    <div className="medi-contact-details">
                      <div className="medi-contact-card-label">{t('contact.phone.label')}</div>
                      <a className="medi-contact-card-value" href="tel:+212 6 22 55 00 10">
                        {t('contact.phone.value')}
                      </a>
                    </div>
                  </div>

                  <div className="medi-contact-card">
                    <div className="medi-contact-icon" aria-hidden="true">
                      <i className="bi bi-clock" />
                    </div>
                    <div className="medi-contact-details">
                      <div className="medi-contact-card-label">{t('contact.hours.label')}</div>
                      <div className="medi-contact-card-value">{t('contact.hours.value')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: form */}
            <div className="col-12 col-lg-7">
              <div className="medi-contact-form-wrapper reveal-right">
                <ContactForm t={t} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── FINAL CTA ────────────────── */}
      <section className="medi-cta-section">
          <div className="medi-cta-box reveal-scale">
            <div className="medi-cta-content">
              <h2 className="medi-cta-title">
                {t('cta.title.part1')}
                <br />
                {t('cta.title.part2')}
              </h2>
              <p className="medi-cta-subtitle">{t('cta.subtitle')}</p>
              <div className="medi-cta-actions">
                <button className="medi-btn-white"  onClick={() => navigate('/register')}>{t('cta.primary')}</button>
              </div>
            </div>
          </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="medi-footer" id="footer-contact">
        <div className="medi-container">
          <div className="medi-footer-top">
            <div className="medi-footer-brand">
              <div className="medi-footer-brand-logo">
                <div className="medi-footer-brand-logo-icon">
                  <i className="bi bi-hospital-fill" aria-hidden="true" />
                </div>
                <span className="medi-footer-brand-logo-text">MediManage</span>
              </div>
              <p className="medi-footer-brand-desc">{t('footer.desc')}</p>
              <div className="medi-footer-social">
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="medi-footer-social-link">
                  <i className="bi bi-twitter-x"></i>
                </a>

                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="medi-footer-social-link">
                  <i className="bi bi-linkedin"></i>
                </a>

                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="medi-footer-social-link">
                  <i className="bi bi-instagram"></i>
                </a>

                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="medi-footer-social-link">
                  <i className="bi bi-facebook"></i>
                </a>

              </div>
            </div>

            <div className="medi-footer-col">
              <div className="medi-footer-col-title">{t('footer.company')}</div>
              <a href="#">{t('footer.features')}</a>
              <a href="#">{t('nav.how')}</a>
              <a href="#">{t('nav.whyUs')}</a>
              <a href="#">{t('nav.reviews')}</a>
              <a href="#">{t('footer.contact')}</a>
            </div>

          </div>

          <div className="medi-footer-bottom">
            <div className="medi-footer-copyright">{t('footer.copyright')}</div>
            <div className="medi-footer-legal">
              <a href="#">{t('footer.legal.privacy')}</a>
              <a href="#">{t('footer.legal.terms')}</a>
              <a href="#">{t('footer.legal.cookie')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
