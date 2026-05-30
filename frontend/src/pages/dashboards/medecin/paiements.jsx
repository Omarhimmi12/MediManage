import { useEffect, useState } from "react";
import api from "../../../api/axios";

const PaiementsPage = () => {

  const [paiements, setPaiements] = useState([]);

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    const res = await api.get("/paiements");
    setPaiements(res.data);
  };

  return (
    <div className="card">
      <div className="card-header">Paiements</div>
      <div className="card-body">
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
            {paiements.map((p) => (
              <tr key={p.id}>
                <td>{p.patient_name || "—"}</td>
                <td>{p.montant} DH</td>
                <td>{p.date_paiement}</td>
                <td>{p.mode_paiement || "—"}</td>
                <td>{p.statut || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaiementsPage;
