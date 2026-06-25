import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import ConfirmModal from "../../../components/ConfirmModal";

const CabinetsAdmin = () => {
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedCabinet, setSelectedCabinet] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchCabinets = useCallback(async () => {
    try {
      setLoading(true);
      const params = { per_page: 50 };
      if (search) params.search = search;
      const res = await api.get("/admin/cabinets", { params });
      setCabinets(res.data?.data ?? []);
    } catch (err) {
      setMessage({ type: "danger", text: "Erreur chargement cabinets" });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCabinets();
  }, [fetchCabinets]);

  const toggleSuspend = async () => {
    if (!confirmAction) return;
    const { id, nom, suspended } = confirmAction;
    const action = suspended ? "réactiver" : "suspendre";
    try {
      const res = await api.put(`/admin/cabinets/${id}/toggle-suspend`);
      setMessage({ type: "success", text: res.data.message });
      setConfirmAction(null);
      fetchCabinets();
    } catch (err) {
      setMessage({ type: "danger", text: "Erreur lors de l'opération" });
      setConfirmAction(null);
    }
  };

  const openDetails = (cabinet) => {
    setSelectedCabinet(cabinet);
  };

  const getConfirmMessage = () => {
    if (!confirmAction) return "";
    const action = confirmAction.suspended ? "réactiver" : "suspendre";
    return `Voulez-vous ${action} le cabinet "${confirmAction.nom}" ?`;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Gestion des cabinets</h2>
        <p className="admin-page-subtitle">Tous les cabinets médicaux de la plateforme</p>
      </div>

      {message.text && (
        <div className={`admin-alert admin-alert-${message.type}`}>
          {message.text}
          <button className="admin-alert-close" onClick={() => setMessage({ type: "", text: "" })}>&times;</button>
        </div>
      )}

      <div className="admin-filters">
        <div className="admin-search-box" style={{ maxWidth: 400 }}>
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher par nom, spécialité, médecin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
        </div>
      ) : cabinets.length === 0 ? (
        <div className="admin-empty">Aucun cabinet trouvé</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cabinet</th>
                <th>Médecin</th>
                <th>Spécialité</th>
                <th>Statut</th>                
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cabinets.map((c) => (
                <tr key={c.id} className={c.suspendu ? "admin-row-suspended" : ""}>
                  <td>
                    <div className="admin-user-cell">
                      <div>
                        <div className="admin-user-name">{c.nom}</div>
                        <div className="admin-user-email">{c.adresse}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.medecin_nom} {c.medecin_prenom}</td>
                  <td><span className="admin-badge admin-badge-info">{c.specialite}</span></td>
                  <td>
                    {c.suspendu
                      ? <span className="admin-badge admin-badge-danger">Suspendu</span>
                      : <span className="admin-badge admin-badge-success">Actif</span>
                    }
                  </td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-btn admin-btn-sm admin-btn-ghost" onClick={() => openDetails(c)} title="Détails">
                        <i className="bi bi-eye-fill"></i>
                      </button>
                      <button
                        className={`admin-btn admin-btn-sm ${c.suspendu ? "admin-btn-success" : "admin-btn-warning"}`}
                        onClick={() => setConfirmAction({ id: c.id, nom: c.nom, suspended: c.suspendu })}
                        title={c.suspendu ? "Réactiver" : "Suspendre"}
                      >
                        <i className={`bi ${c.suspendu ? "bi-check-circle-fill" : "bi-pause-circle-fill"}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal isOpen={confirmAction !== null} title="Confirmer l'opération"
        message={getConfirmMessage()} confirmLabel="Confirmer" cancelLabel="Annuler"
        variant="warning"
        onConfirm={toggleSuspend}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Details Modal */}
      {selectedCabinet && (
        <div className="admin-modal-overlay" onClick={() => setSelectedCabinet(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="admin-modal-header">
              <h3>{selectedCabinet.nom}</h3>
              <button className="admin-modal-close" onClick={() => setSelectedCabinet(null)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Médecin</span>
                  <span className="admin-detail-value">{selectedCabinet.medecin_nom} {selectedCabinet.medecin_prenom}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Email médecin</span>
                  <span className="admin-detail-value">{selectedCabinet.medecin_email}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Spécialité</span>
                  <span className="admin-detail-value">{selectedCabinet.specialite}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Adresse</span>
                  <span className="admin-detail-value">{selectedCabinet.adresse}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Téléphone</span>
                  <span className="admin-detail-value">{selectedCabinet.telephone}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Statut</span>
                  <span className="admin-detail-value">
                    {selectedCabinet.suspendu
                      ? <span className="admin-badge admin-badge-danger">Suspendu</span>
                      : <span className="admin-badge admin-badge-success">Actif</span>
                    }
                  </span>
                </div>                               
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedCabinet(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CabinetsAdmin;