import { useContext, useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";
import "./rdv.css";

const PAGE_SIZE = 8;

const motifOptions = [
  "Consultation générale",
  "Suivi",
  "Examen complet",
  "Urgence",
  "Suivi post-traitement",
  "Bilan de santé",
];

const statusOptions = ["en_attente", "confirme", "annule", "termine"];

const SecretaireRdvPage = () => {
  const { user } = useContext(AuthContext);

  const [rdvList, setRdvList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [queryPatient, setQueryPatient] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const cabinetId = user?.secretaire?.cabinet?.id ?? "";
  const medecinId = user?.secretaire?.cabinet?.medecin_id ?? "";

  const [formData, setFormData] = useState({
    patient_id: "",
    date_rdv: "",
    heure_debut: "",
    heure_fin: "",
    motif: "",
    statut: "en_attente",
    medecin_id: "",
    cabinet_id: "",
  });

  useEffect(() => {
    setFormData((s) => ({
      ...s,
      cabinet_id: cabinetId,
      medecin_id: medecinId,
    }));
  }, [cabinetId, medecinId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rdvRes, patientsRes] = await Promise.all([
        api.get("/rendez-vous"),
        api.get("/patients"),
      ]);
      setRdvList(Array.isArray(rdvRes.data) ? rdvRes.data : []);
      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
    } catch (err) {
      console.log(err);
      setRdvList([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [queryPatient, filterStatus, filterDate]);

  const filteredRdv = useMemo(() => {
    return rdvList.filter((r) => {
      const nom = r?.patient?.user?.nom ?? "";
      const prenom = r?.patient?.user?.prenom ?? "";
      const patientStr = `${nom} ${prenom}`.toLowerCase();
      const q = queryPatient.trim().toLowerCase();

      const matchPatient = !q || patientStr.includes(q);
      const matchStatus = filterStatus === "all" || String(r?.statut) === filterStatus;
      const matchDate = !filterDate || r.date_rdv?.startsWith(filterDate);

      return matchPatient && matchStatus && matchDate;
    });
  }, [rdvList, queryPatient, filterStatus, filterDate]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(filteredRdv.length / PAGE_SIZE));
  }, [filteredRdv.length]);

  const paginatedRdv = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRdv.slice(start, start + PAGE_SIZE);
  }, [filteredRdv, page]);

  const handleOpenModal = (rdv = null) => {
    setFormErrors([]);
    if (rdv) {
      setEditingId(rdv.id);
      setFormData({
        patient_id: rdv.patient_id || "",
        date_rdv: rdv.date_rdv || "",
        heure_debut: rdv.heure_debut || "",
        heure_fin: rdv.heure_fin || "",
        motif: rdv.motif || "",
        statut: rdv.statut || "en_attente",
        medecin_id: medecinId,
        cabinet_id: cabinetId,
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
        medecin_id: medecinId,
        cabinet_id: cabinetId,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setFormSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/rendez-vous/${editingId}/statut`, {
          statut: formData.statut,
        });
      } else {
        await api.post("/rendez-vous", {
          patient_id: formData.patient_id ? Number(formData.patient_id) : null,
          medecin_id: formData.medecin_id ? Number(formData.medecin_id) : null,
          cabinet_id: formData.cabinet_id ? Number(formData.cabinet_id) : null,
          date_rdv: formData.date_rdv,
          heure_debut: formData.heure_debut,
          heure_fin: formData.heure_fin,
          motif: formData.motif,
        });
      }
      handleCloseModal();
      await fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;
      if (msg) setFormErrors([msg]);
      else if (errors) setFormErrors(Object.values(errors).flat());
      else setFormErrors(["Erreur lors de l'enregistrement."]);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusChange = async (rdvId, newStatus) => {
    try {
      await api.put(`/rendez-vous/${rdvId}/statut`, { statut: newStatus });
      setRdvList((prev) =>
        prev.map((r) => (String(r.id) === String(rdvId) ? { ...r, statut: newStatus } : r))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (rdvId) => {
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await api.delete(`/rendez-vous/${rdvId}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting RDV:", err);
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

  const stats = {
    total: rdvList.length,
    pending: rdvList.filter((r) => r.statut === "en_attente").length,
    confirmed: rdvList.filter((r) => r.statut === "confirme").length,
    completed: rdvList.filter((r) => r.statut === "termine").length,
  };

  if (loading) {
    return (
      <div className="secretaire-rdv-container">
        <div className="secretaire-rdv-loading">
          <div className="mmd-loading">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p>Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="secretaire-rdv-container">
      <div className="secretaire-rdv-header">
        <div>
          <h1 className="secretaire-rdv-title">Gestion des Rendez-vous</h1>
          <p className="secretaire-rdv-subtitle">
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

      <div className="secretaire-rdv-stats">
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

      <div className="secretaire-rdv-filters">
        <div className="filter-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={queryPatient}
            onChange={(e) => setQueryPatient(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Statut</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
            onChange={(e) => setFilterDate(e.target.value)}
            className="mmd-input"
          />
        </div>
      </div>

      {paginatedRdv.length === 0 ? (
        <div className="secretaire-rdv-empty">
          <i className="bi bi-calendar-x"></i>
          <h3>Aucun rendez-vous trouvé</h3>
          <p>Créez un nouveau rendez-vous</p>
        </div>
      ) : (
        <div className="secretaire-rdv-grid">
          {paginatedRdv.map((rdv) => (
            <div key={rdv.id} className="secretaire-rdv-card">
              <div className="secretaire-rdv-card-header">
                <div className="secretaire-rdv-patient">
                  <div className="secretaire-rdv-avatar">
                    {rdv.patient?.user?.nom?.charAt(0)}
                    {rdv.patient?.user?.prenom?.charAt(0)}
                  </div>
                  <div>
                    <div className="secretaire-rdv-patient-name">
                      {rdv.patient?.user?.nom} {rdv.patient?.user?.prenom}
                    </div>
                    <div className="secretaire-rdv-patient-email">
                      {rdv.patient?.user?.email}
                    </div>
                  </div>
                </div>
                <button
                  className="secretaire-rdv-delete-btn"
                  onClick={() => handleDelete(rdv.id)}
                  title="Supprimer"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>

              <div className="secretaire-rdv-card-body">
                <div className="secretaire-rdv-detail">
                  <span className="secretaire-rdv-detail-icon">
                    <i className="bi bi-calendar"></i>
                  </span>
                  <span className="secretaire-rdv-detail-text">
                    {rdv.date_rdv
                      ? new Date(rdv.date_rdv).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </span>
                </div>

                <div className="secretaire-rdv-detail">
                  <span className="secretaire-rdv-detail-icon">
                    <i className="bi bi-clock"></i>
                  </span>
                  <span className="secretaire-rdv-detail-text">
                    {String(rdv.heure_debut).slice(0, 5)} —{" "}
                    {String(rdv.heure_fin).slice(0, 5)}
                  </span>
                </div>

                <div className="secretaire-rdv-detail">
                  <span className="secretaire-rdv-detail-icon">
                    <i className="bi bi-stethoscope"></i>
                  </span>
                  <span className="secretaire-rdv-detail-text">{rdv.motif}</span>
                </div>

                <div className="secretaire-rdv-status">
                  <span className={`mmd-badge ${getStatusBadge(rdv.statut).class}`}>
                    {getStatusBadge(rdv.statut).label}
                  </span>
                </div>
              </div>

              <div className="secretaire-rdv-card-footer">
                <select
                  value={rdv.statut}
                  onChange={(e) => handleStatusChange(rdv.id, e.target.value)}
                  className="secretaire-rdv-status-select"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s === "en_attente"
                        ? "En attente"
                        : s === "confirme"
                        ? "Confirmé"
                        : s === "termine"
                        ? "Terminé"
                        : "Annulé"}
                    </option>
                  ))}
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

      {pageCount > 1 && (
        <div className="secretaire-rdv-pagination">
          <button
            className="mmd-btn mmd-btn-secondary mmd-btn-sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <i className="bi bi-chevron-left"></i> Précédent
          </button>
          <span className="secretaire-rdv-pagination-info">
            Page {page} / {pageCount}
          </span>
          <button
            className="mmd-btn mmd-btn-secondary mmd-btn-sm"
            onClick={() => setPage(Math.min(pageCount, page + 1))}
            disabled={page === pageCount}
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
              <button
                className="mmd-modal-close"
                onClick={handleCloseModal}
                aria-label="Fermer"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mmd-modal-body">
                {formErrors.length > 0 && (
                  <div className="mmd-alert mmd-alert-danger">
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {formErrors.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mmd-form-group">
                  <label className="mmd-label">Patient</label>
                  <select
                    className="mmd-select"
                    value={formData.patient_id}
                    onChange={(e) =>
                      setFormData((s) => ({ ...s, patient_id: e.target.value }))
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
                      setFormData((s) => ({ ...s, date_rdv: e.target.value }))
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
                        setFormData((s) => ({ ...s, heure_debut: e.target.value }))
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
                        setFormData((s) => ({ ...s, heure_fin: e.target.value }))
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
                      setFormData((s) => ({ ...s, motif: e.target.value }))
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

                {editingId && (
                  <div className="mmd-form-group">
                    <label className="mmd-label">Statut</label>
                    <select
                      className="mmd-select"
                      value={formData.statut}
                      onChange={(e) =>
                        setFormData((s) => ({ ...s, statut: e.target.value }))
                      }
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s === "en_attente"
                            ? "En attente"
                            : s === "confirme"
                            ? "Confirmé"
                            : s === "termine"
                            ? "Terminé"
                            : "Annulé"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mmd-modal-footer">
                <button
                  type="button"
                  className="mmd-btn mmd-btn-secondary"
                  onClick={handleCloseModal}
                  disabled={formSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="mmd-btn mmd-btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? "Enregistrement..."
                    : editingId
                    ? "Modifier"
                    : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaireRdvPage;
