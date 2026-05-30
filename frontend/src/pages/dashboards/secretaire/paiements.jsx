import { useEffect, useState } from "react";
import api from "../../../api/axios";

const PaiementsPage = () => {
  const [paiements, setPaiements] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    try {
      const res = await api.get("/paiements");
      setPaiements(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError("Impossible de charger les paiements.");
    }
  };

  return (
    <div className="card">
      <div className="card-header">Paiements</div>
      <div className="card-body">
        {error ? <div className="text-danger mb-3">{error}</div> : null}

        <table className="table">
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
            {paiements.map((paiement) => (
              <tr key={paiement.id}>
                <td>{paiement.patient_name || "—"}</td>
                <td>{paiement.montant} DH</td>
                <td>{paiement.date_paiement}</td>
                <td>{paiement.mode_paiement || "—"}</td>
                <td>{paiement.statut || "—"}</td>
              </tr>
            ))}
            {paiements.length === 0 ? (
              <tr>
                <td colSpan={5}>Aucun paiement pour le moment.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaiementsPage;
