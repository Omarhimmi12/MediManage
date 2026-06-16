import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";

const AccueilAdmin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur chargement stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return <div className="admin-alert admin-alert-danger">{error}</div>;
  }

  const cards = [
    {
      label: "Médecins",
      value: stats?.total_medecins ?? 0,
      icon: "bi-person-badge-fill",
      color: "#6366f1",
    },
    {
      label: "Secrétaires",
      value: stats?.total_secretaires ?? 0,
      icon: "bi-person-check-fill",
      color: "#8b5cf6",
    },
    {
      label: "Cabinets actifs",
      value: stats?.active_cabinets ?? 0,
      icon: "bi-building-check",
      color: "#06b6d4",
    },
    {
      label: "Cabinets suspendus",
      value: stats?.suspended_cabinets ?? 0,
      icon: "bi-building-slash",
      color: "#f43f5e",
    },
    {
      label: "Total Rendez-vous",
      value: stats?.total_rendez_vous ?? 0,
      icon: "bi-calendar-check-fill",
      color: "#10b981",
    },
    {
      label: "Consultations",
      value: stats?.total_consultations ?? 0,
      icon: "bi-file-medical-fill",
      color: "#f59e0b",
    },
    {
      label: "Revenu total",
      value: `${(stats?.total_revenue ?? 0).toLocaleString()} DH`,
      icon: "bi-currency-dollar",
      color: "#22c55e",
    },
    {
      label: "Revenu aujourd'hui",
      value: `${(stats?.today_revenue ?? 0).toLocaleString()} DH`,
      icon: "bi-graph-up-arrow",
      color: "#3b82f6",
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Super Admin Dashboard</h2>
        <p className="admin-page-subtitle">Aperçu global de la plateforme</p>
      </div>

      <div className="admin-stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div
              className="admin-stat-icon"
              style={{ background: `${card.color}20`, color: card.color }}
            >
              <i className={`bi ${card.icon}`}></i>
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">{card.value}</span>
              <span className="admin-stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccueilAdmin;
