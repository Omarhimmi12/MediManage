import { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import api from "../../../api/axios";
import MonthlyRevenueChart from "../../../components/charts/MonthlyRevenueChart";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./accueil.css";

const AccueilPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    todayRevenue: 0,
    totalConsultations: 0,
    monthlyRevenue: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [patientCategories, setPatientCategories] = useState({
    child: 0,
    adult: 0,
    elderly: 0,
  });
  const [appointmentStats, setAppointmentStats] = useState([]);
  const [appointmentStatsLoading, setAppointmentStatsLoading] = useState(true);

  const APPOINTMENT_COLORS = {
    "En attente": "#f59e0b",
    "Confirmé": "#06b6d4",
    "Terminé": "#10b981",
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      const [dashRes, patientsRes, rdvRes, statsRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/patients"),
        api.get("/rendez-vous"),
        api.get("/dashboard/charts/appointment-stats"),
      ]);

      const dash = dashRes.data;
      const patients = patientsRes.data;
      setAppointmentStats(statsRes.data ?? []);

      // Stat cards
      setStats({
        totalPatients: dash.total_patients || patients.length,
        todayAppointments: dash.today_rendez_vous || 0,
        todayRevenue: dash.today_revenue || 0,
        totalConsultations: dash.total_consultations || 0,
        monthlyRevenue: dash.monthly_revenue || 0,
      });

      // Patient age categories
      const patientsByAge = patients.reduce(
        (acc, p) => {
          const age = p.date_naissance
            ? new Date().getFullYear() -
              new Date(p.date_naissance).getFullYear()
            : 0;
          if (age < 18) acc.child++;
          else if (age < 65) acc.adult++;
          else acc.elderly++;
          return acc;
        },
        { child: 0, adult: 0, elderly: 0 }
      );
      setPatientCategories(patientsByAge);

      // Upcoming rdv
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const upcoming = rdvRes.data
        .filter((r) => {
          const rdvDate = new Date(r.date_rdv);
          return rdvDate >= todayStart;
        })
        .filter((r) => r.statut !== "annule")
        .sort((a, b) => new Date(a.date_rdv) - new Date(b.date_rdv))
        .slice(0, 5);

      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoadingUpcoming(false);
      setAppointmentStatsLoading(false);
    }
  }, []);

  const today = new Date();
  const monthName = today.toLocaleString("fr-FR", { month: "long" });
  const dayName = today.toLocaleString("fr-FR", { weekday: "long" });

  return (
    <div className="accueil-container">
      <div className="accueil-header">
        <h1 className="accueil-title">Bienvenue, Dr. {user?.nom}</h1>
        <p className="accueil-subtitle">
          {dayName.charAt(0).toUpperCase() + dayName.slice(1)},
          {" "}
          {today.getDate()} {monthName} {today.getFullYear()}
        </p>
      </div>

      <div className="accueil-stats-grid">
        <div className="stat-card stat-card-mint">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">CA du jour</span>
            <span className="stat-value">{stats.todayRevenue.toLocaleString("fr-FR")} MAD</span>
            <span className="stat-change">
              <i className="bi bi-calendar-day"></i> Aujourd'hui
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Patients</span>
            <span className="stat-value">{stats.totalPatients}</span>
            <span className="stat-change">
              <i className="bi bi-people"></i> Total enregistré
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-peach">
          <div className="stat-icon">
            <i className="bi bi-calendar-check-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Rendez-vous (Aujourd'hui)</span>
            <span className="stat-value">{stats.todayAppointments}</span>
            <span className="stat-change">
              <i className="bi bi-clock"></i> Ce jour
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-pink">
          <div className="stat-icon">
            <i className="bi bi-file-medical-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Consultations</span>
            <span className="stat-value">{stats.totalConsultations}</span>
            <span className="stat-change">
              <i className="bi bi-check-circle"></i> Terminées
            </span>
          </div>
        </div>
      </div>

      <div className="accueil-charts-row">
        {/* CA du mois — Recharts LineChart */}
        <div className="chart-container chart-daily">
          <div className="chart-header">
            <h3 className="chart-title">CA du mois — {monthName}</h3>
            <div className="chart-menu">⋯</div>
          </div>
          <MonthlyRevenueChart />
        </div>

        {/* Statistiques rendez-vous */}
        <div className="chart-container chart-stats">
          <div className="chart-header">
            <h3 className="chart-title">Statistiques rendez-vous</h3>
            <div className="chart-menu">⋯</div>
          </div>
          <div className="appointment-stats-chart">
            {appointmentStatsLoading ? (
              <div className="chart-loading">
                <div className="loading-spinner" />
                <p>Chargement...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {appointmentStats.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={
                          APPOINTMENT_COLORS[entry.status] || "#cbd5e0"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ color: "#4a5568", fontSize: "13px" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="accueil-bottom-row">
        <div className="appointments-section">
          <div className="section-header">
            <h3 className="section-title">Rendez-vous à venir</h3>
          </div>
          <div className="appointments-list">
            {isLoadingUpcoming ? (
              <div className="empty-state">
                <div className="loading-spinner" />
                <p>Chargement...</p>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-calendar-x"></i>
                <p>Aucun rendez-vous à venir</p>
              </div>
            ) : (
              upcomingAppointments.map((rdv) => (
                <div key={rdv.id} className="appointment-item">
                  <div className="appointment-avatar">
                    {rdv.patient?.user?.nom?.charAt(0)}
                    {rdv.patient?.user?.prenom?.charAt(0)}
                  </div>
                  <div className="appointment-details">
                    <p className="appointment-name">
                      {rdv.patient?.user?.nom} {rdv.patient?.user?.prenom}
                    </p>
                    <p className="appointment-time">
                      {new Date(rdv.date_rdv).toLocaleDateString("fr-FR")} à{" "}
                      {String(rdv.heure_debut).slice(0, 5)}
                    </p>
                  </div>
                  <div className="appointment-status">
                    <span className={`status-badge status-${rdv.statut}`}>
                      {rdv.statut === "en_attente"
                        ? "En attente"
                        : rdv.statut === "confirme"
                        ? "Confirmé"
                        : rdv.statut === "termine"
                        ? "Terminé"
                        : "Annulé"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="overview-section">
          <div className="section-header">
            <h3 className="section-title">Vue d'ensemble patients</h3>
          </div>
          <div className="overview-content">
            <div className="donut-chart-wrapper">
              <svg viewBox="0 0 200 200" className="donut-chart">
                <defs>
                  <style>
                    {`.donut-child { fill: #10b981; }
                      .donut-adult { fill: #f97316; }
                      .donut-elderly { fill: #ec4899; }`}
                  </style>
                </defs>

                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${(patientCategories.child / (stats.totalPatients || 1)) * 377} 377`}
                />

                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="20"
                  strokeDasharray={`${(patientCategories.adult / (stats.totalPatients || 1)) * 377} 377`}
                  strokeDashoffset={
                    -((patientCategories.child / (stats.totalPatients || 1)) * 377)
                  }
                />

                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="20"
                  strokeDasharray={`${(patientCategories.elderly / (stats.totalPatients || 1)) * 377} 377`}
                  strokeDashoffset={
                    -(
                      ((patientCategories.child + patientCategories.adult) /
                        (stats.totalPatients || 1)) *
                      377
                    )
                  }
                />

                <text
                  x="100"
                  y="105"
                  textAnchor="middle"
                  className="donut-center-text"
                >
                  {stats.totalPatients}
                </text>
                <text
                  x="100"
                  y="120"
                  textAnchor="middle"
                  className="donut-center-label"
                >
                  Patients
                </text>
              </svg>
            </div>

            <div className="overview-legend">
              <div className="legend-item">
                <span className="legend-color child"></span>
                <div className="legend-text">
                  <span className="legend-count">{patientCategories.child}</span>
                  <span className="legend-label">Enfants</span>
                </div>
              </div>
              <div className="legend-item">
                <span className="legend-color adult"></span>
                <div className="legend-text">
                  <span className="legend-count">{patientCategories.adult}</span>
                  <span className="legend-label">Adultes</span>
                </div>
              </div>
              <div className="legend-item">
                <span className="legend-color elderly"></span>
                <div className="legend-text">
                  <span className="legend-count">{patientCategories.elderly}</span>
                  <span className="legend-label">Seniors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccueilPage;
