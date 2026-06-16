import { useState, useEffect } from "react";
import api from "../../../api/axios";
import ConfirmModal from '../../../components/ConfirmModal';
import AlertModal from '../../../components/AlertModal';
import "./rdv.css";

const RdvPage = () => {
  const [rdvList, setRdvList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    date_rdv: "",
    heure_debut: "",
    heure_fin: "",
    motif: "",
    statut: "en_attente",
  });

  const motifOptions = [
    "Consultation générale",
    "Suivi",
    "Examen complet",
    "Urgence",
    "Suivi post-traitement",
    "Bilan de santé",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rdvRes, patientsRes] = await Promise.all([
        api.get("/rendez-vous"),
        api.get("/patients"),
      ]);
      setRdvList(rdvRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRdv = rdvList.filter((rdv) => {
    const matchesSearch =
      `${rdv.patient?.user?.nom} ${rdv.patient?.user?.prenom}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      rdv.patient?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || rdv.statut === filterStatus;

    const matchesDate = !filterDate || rdv.date_rdv?.startsWith(filterDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const paginatedRdv = filteredRdv.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRdv.length / itemsPerPage);

  const handleOpenModal = (rdv = null) => {
    if (rdv) {
      setEditingId(rdv.id);
      setFormData({
        patient_id: rdv.patient_id || "",
        date_rdv: rdv.date_rdv || "",
        heure_debut: rdv.heure_debut || "",
        heure_fin: rdv.heure_fin || "",
        motif: rdv.motif || "",
        statut: rdv.statut || "en_attente",
      });
    } else {
      setEditingId(null);
      setFormData({
        patient_id: "",
        date_rdv: "",
        heure_debut: "",
        heure_fin: "",
        motif: "",
        statut: "en_attente",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing RDV 
        await api.put(`/rendez-vous/${editingId}/statut`, {
          statut: formData.statut,
        });
      } else {
        await api.post("/rendez-vous", {
          patient_id: formData.patient_id,
          date_rdv: formData.date_rdv,
          heure_debut: formData.heure_debut,
          heure_fin: formData.heure_fin,
          motif: formData.motif,
        });
      }
      handleCloseModal();
      await fetchData();
    } catch (error) {
      console.error("Error saving RDV:", error);
      setAlertInfo({ title: "Erreur", message: error?.response?.data?.message || "Erreur lors de l'enregistrement", variant: "danger" });
    }
  };

  const handleStatusChange = async (rdvId, newStatus) => {
    try {
      await api.put(`/rendez-vous/${rdvId}/statut`, { statut: newStatus });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (rdvId) => {
    try {
      await api.delete(`/rendez-vous/${rdvId}`);
      fetchData();
      setConfirmDelete(null);
    } catch (error) {
      setConfirmDelete(null);
      console.error("Error deleting RDV:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      en_attente: { label: "En attente", class: "mmd-badge-warning" },
      confirme: { label: "Confirmé", class: "mmd-badge-success" },
      termine: { label: "Terminé", class: "mmd-badge-info" },
      annule: { label: "Annulé", class: "mmd-badge-danger" },
    };
    return statusMap[status] || { label: status, class: "mmd-badge-secondary" };
  };

  const formatDateTime = (date, time) => {
    if (!date) return "-";
    const dateObj = new Date(date);
    const formatted = dateObj.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return time ? `${formatted} à ${time}` : formatted;
  };

  const stats = {
    total: rdvList.length,
    pending: rdvList.filter((r) => r.statut === "en_attente").length,
    confirmed: rdvList.filter((r) => r.statut === "confirme").length,
    completed: rdvList.filter((r) => r.statut === "termine").length,
  };

  return (
    <div className="rdv-container">
      <div className="rdv-header">
        <div>
          <h1 className="rdv-title">Gestion des Rendez-vous</h1>
          <p className="rdv-subtitle">
            Total: {filteredRdv.length} rendez-vous
          </p>
        </div>
        <button
          className="mmd-btn mmd-btn-primary"
          onClick={() => handleOpenModal()}
        >
          <i className="bi bi-plus-lg"></i>
          Nouveau RDV
        </button>
      </div>

      <div className="rdv-stats">
        <div className="stat-box">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-box stat-pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-box stat-confirmed">
          <div className="stat-value">{stats.confirmed}</div>
          <div className="stat-label">Confirmés</div>
        </div>
        <div className="stat-box stat-completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Terminés</div>
        </div>
      </div>

      <div className="rdv-filters">
        <div className="filter-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Statut</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="mmd-select"
          >
            <option value="all">Tous</option>
            <option value="en_attente">En attente</option>
            <option value="confirme">Confirmé</option>
            <option value="termine">Terminé</option>
            <option value="annule">Annulé</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="mmd-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="rdv-loading">
          <div className="mmd-loading">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p>Chargement des rendez-vous...</p>
        </div>
      ) : paginatedRdv.length === 0 ? (
        <div className="rdv-empty">
          <i className="bi bi-calendar-x"></i>
          <h3>Aucun rendez-vous trouvé</h3>
          <p>Créez un nouveau rendez-vous</p>
        </div>
      ) : (
        <div className="rdv-grid">
          {paginatedRdv.map((rdv) => (
            <div key={rdv.id} className="rdv-card">
              <div className="rdv-card-header">
                <div className="rdv-patient">
                  <div className="rdv-avatar" aria-label="Genre patient">
                    {rdv.patient?.sexe === "female" ? (
                      <img src="/images/female.png" alt="Femme" />
                    ) : (
                      <img src="/images/male.png" alt="Homme" />
                    )}
                  </div>
                  <div>
                    <div className="rdv-patient-name">
                      {rdv.patient?.user?.nom} {rdv.patient?.user?.prenom}
                    </div>
                    <div className="rdv-patient-email">
                      {rdv.patient?.user?.email}
                    </div>
                  </div>
                </div>
                <button
                  className="rdv-delete-btn"
                  onClick={() => setConfirmDelete(rdv.id)}
                  title="Supprimer"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>

              <div className="rdv-card-body">
                <div className="rdv-detail">
                  <span className="rdv-detail-icon">
                    <i className="bi bi-calendar"></i>
                  </span>
                  <span className="rdv-detail-text">
                    {formatDateTime(rdv.date_rdv)}
                  </span>
                </div>

                <div className="rdv-detail">
                  <span className="rdv-detail-icon">
                    <i className="bi bi-clock"></i>
                  </span>
                  <span className="rdv-detail-text">
                    {String(rdv.heure_debut).slice(0, 5)} -{" "}
                    {String(rdv.heure_fin).slice(0, 5)}
                  </span>
                </div>

                <div className="rdv-detail">
                  <span className="rdv-detail-icon">
                    <i className="bi bi-stethoscope"></i>
                  </span>
                  <span className="rdv-detail-text">{rdv.motif}</span>
                </div>

                <div className="rdv-status">
                  <span className={`mmd-badge ${getStatusBadge(rdv.statut).class}`}>
                    {getStatusBadge(rdv.statut).label}
                  </span>
                </div>
              </div>

              <div className="rdv-card-footer">
                <select
                  value={rdv.statut}
                  onChange={(e) => handleStatusChange(rdv.id, e.target.value)}
                  className="rdv-status-select"
                >
                  <option value="en_attente">En attente</option>
                  <option value="confirme">Confirmé</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </select>
                <button
                  className="mmd-btn mmd-btn-sm mmd-btn-secondary"
                  onClick={() => handleOpenModal(rdv)}
                >
                  <i className="bi bi-pencil"></i> Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="mmd-btn mmd-btn-secondary mmd-btn-sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <i className="bi bi-chevron-left"></i> Précédent
          </button>
          <span className="pagination-info">
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="mmd-btn mmd-btn-secondary mmd-btn-sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}

      {showModal && (
        <div className="mmd-modal-overlay" onClick={handleCloseModal}>
          <div className="mmd-modal" onClick={(e) => e.stopPropagation()}>
          <div className="mmd-modal-header">
              <h3 className="mmd-modal-title">
                {editingId ? "Modifier le RDV" : "Créer un RDV"}
              </h3>
              <button className="mmd-modal-close" onClick={handleCloseModal} aria-label="Fermer">
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mmd-modal-body">
                <div className="mmd-form-group">
                  <label className="mmd-label">Patient</label>
                  <select
                    className="mmd-select"
                    value={formData.patient_id}
                    onChange={(e) =>
                      setFormData({ ...formData, patient_id: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.user?.nom} {p.user?.prenom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Date</label>
                  <input
                    type="date"
                    className="mmd-input"
                    value={formData.date_rdv}
                    onChange={(e) =>
                      setFormData({ ...formData, date_rdv: e.target.value })
                    }
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Heure début</label>
                    <input
                      type="time"
                      className="mmd-input"
                      value={formData.heure_debut}
                      onChange={(e) =>
                        setFormData({ ...formData, heure_debut: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Heure fin</label>
                    <input
                      type="time"
                      className="mmd-input"
                      value={formData.heure_fin}
                      onChange={(e) =>
                        setFormData({ ...formData, heure_fin: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Motif</label>
                  <select
                    className="mmd-select"
                    value={formData.motif}
                    onChange={(e) =>
                      setFormData({ ...formData, motif: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {motifOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Statut</label>
                  <select
                    className="mmd-select"
                    value={formData.statut}
                    onChange={(e) =>
                      setFormData({ ...formData, statut: e.target.value })
                    }
                  >
                    <option value="en_attente">En attente</option>
                    <option value="confirme">Confirmé</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="mmd-modal-footer">
                <button
                  type="button"
                  className="mmd-btn mmd-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Annuler
                </button>
                <button type="submit" className="mmd-btn mmd-btn-primary">
                  {editingId ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce RDV ?"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Supprimer"
      />
      <AlertModal
        isOpen={!!alertInfo}
        title={alertInfo?.title}
        message={alertInfo?.message}
        variant={alertInfo?.variant || "danger"}
        onClose={() => setAlertInfo(null)}
      />
    </div>
  );
};

export default RdvPage;