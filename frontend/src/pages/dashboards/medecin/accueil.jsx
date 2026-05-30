import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";

const AccueilPage = () => {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/dashboard");
      setStats(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>

      <div className="d-flex justify-content-between mb-4">
        <h3>Tableau de Bord</h3>
        <p>Aujourd'hui: <span className="fw-bold">{new Date().toLocaleDateString()}</span></p>
      </div>

      <div className="row g-4">
        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center">
            <h6>CA du jour</h6>
            <h4 className="text-success">{stats.total_revenue || 0} MAD</h4>
          </div>
        </div>
        
        <div className="col-md-3">
            <Link
            to="/medecin"
            state={{ section: "patients" }}
            className="card shadow-sm p-3 text-center text-decoration-none text-reset"
            style={{ cursor: "pointer" }}
          >
            <h6>Patients</h6>
            <h4>{stats.total_patients || 0}</h4>
          </Link>
        </div>

        <div className="col-md-3">
            <Link
            to="/medecin"
            state={{ section: "rdv" }}
            className="card shadow-sm p-3 text-center text-decoration-none text-reset"
            style={{ cursor: "pointer" }}
          >
            <h6>Rendez-vous (aujourd'hui)</h6>
            <h4>{stats.today_rendez_vous || 0}</h4>
          </Link>
        </div>

        <div className="col-md-3">
            <Link
            to="/medecin"
            state={{ section: "consultations" }}
            className="card shadow-sm p-3 text-center text-decoration-none text-reset"
            style={{ cursor: "pointer" }}
          >
            <h6>Consultations</h6>
            <h4>{stats.total_consultations || 0}</h4>
          </Link>
        </div>

      </div>

      <div className="card shadow-sm mt-5 p-4">
        <h5>Total du CA du mois : <span className="text-success">
          {stats.monthly_revenue || 0} MAD
        </span></h5>
      </div>

    </div>
  );
};

export default AccueilPage;
