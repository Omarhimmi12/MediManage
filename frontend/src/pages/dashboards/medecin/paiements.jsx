import { useEffect, useState } from "react";
import api from "../../../api/axios";
import "./paiements.css";

const PaiementsPage = () => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/paiements");
      setPaiements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement paiements:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case "paye":
        return <span className="mmd-badge mmd-badge-success">Payé</span>;
      case "en_attente":
        return (
          <span className="mmd-badge mmd-badge-warning">En attente</span>
        );
      case "annule":
        return <span className="mmd-badge mmd-badge-danger">Annulé</span>;
      default:
        return (
          <span className="mmd-badge mmd-badge-info">{statut || "—"}</span>
        );
    }
  };

  if (loading) {
    return (
      <div className="paiements-container">
        <div className="paiements-loading">
          <div className="mmd-loading">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p>Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paiements-container">
      <div className="paiements-header">
        <div>
          <h1 className="paiements-title">Paiements</h1>
          <p className="paiements-subtitle">
            {paiements.length} paiement{paiements.length !== 1 ? "s" : ""} au
            total
          </p>
        </div>
      </div>

      <div className="paiements-table-card">
        {paiements.length === 0 ? (
          <div className="paiements-empty">
            <i className="bi bi-cash-coin"></i>
            <h3>Aucun paiement enregistré</h3>
            <p>Les paiements apparaîtront ici après les consultations.</p>
          </div>
        ) : (
          <table className="mmd-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Mode paiement</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((p) => (
                <tr key={p.id}>
                  <td>{p.patient_name || "—"}</td>
                  <td>
                    <strong>{p.montant} DH</strong>
                  </td>
                  <td>
                    {p.date_paiement
                      ? new Date(p.date_paiement).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td>{p.mode_paiement || "—"}</td>
                  <td>{getStatutBadge(p.statut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaiementsPage;
