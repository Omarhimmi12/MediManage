import React, { useEffect, useMemo, useState } from "react";
import "./SplashScreen.css";

const createParticles = () =>
  Array.from({ length: 24 }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${Math.random() * 8 + 4}px`,
    duration: `${Math.random() * 8 + 7}s`,
    delay: `${Math.random() * 3}s`,
  }));

const SplashScreen = ({ onFinish = () => {} }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(4);
  const particles = useMemo(() => createParticles(), []);

  useEffect(() => {
    let value = 4;

    const progressTimer = setInterval(() => {
      value += Math.random() * 10 + 4;
      if (value >= 94) {
        value = 94;
        clearInterval(progressTimer);
      }
      setProgress(Math.round(value));
    }, 180);

    const completeTimer = setTimeout(() => {
      clearInterval(progressTimer);
      setProgress(100);
    }, 2800);

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3450);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 4250);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(completeTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
      <div className="splash-background">
        <div className="splash-grid" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />

        <div className="particle-field" aria-hidden="true">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="particle"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                animationDuration: particle.duration,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>
      </div>

      <div className="splash-wrapper">
        <div className="status-pill">Initialisation sécurisée</div>

        <div className="logo-stage">
          <div className="ring ring-one" />
          <div className="ring ring-two" />
          <div className="ring ring-three" />

          <div className="logo-box">
            <div className="logo-gloss" />
            <img src="/images/brand.png" alt="MediManage" className="logo-icon" />
          </div>
        </div>

        <div className="brand-block">
          <h1 className="brand">
            <span className="brand-text">MediManage</span>
            <span className="brand-shine" />
          </h1>
          <p className="tagline">
            La solution intelligente pour gérer votre cabinet médical.
          </p>
        </div>

        <div className="heartbeat-shell" aria-hidden="true">
          <svg className="heartbeat" viewBox="0 0 720 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0f766e" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#67e8f9" />
              </linearGradient>
            </defs>
            <path
              className="heartbeat-base"
              d="M0 60 H120 L150 60 L170 52 L188 68 L210 22 L236 90 L264 60 L360 60 L392 60 L420 48 L440 74 L462 30 L486 88 L516 60 H720"
            />
            <path
              className="heartbeat-line"
              d="M0 60 H120 L150 60 L170 52 L188 68 L210 22 L236 90 L264 60 L360 60 L392 60 L420 48 L440 74 L462 30 L486 88 L516 60 H720"
            />
          </svg>
        </div>

        <div className="feature-row">
          <span>Patients</span>
          <span>Rendez-Vous</span>
          <span>Dossiers</span>
        </div>        
      </div>
    </div>
  );
};

export default SplashScreen;
