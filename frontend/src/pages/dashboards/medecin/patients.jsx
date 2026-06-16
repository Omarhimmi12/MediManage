import { useState, useEffect, useMemo } from "react";
import api from "../../../api/axios";
import ConfirmModal from '../../../components/ConfirmModal';
import AlertModal from '../../../components/AlertModal';
import "./patients.css";

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sexFilter, setSexFilter] = useState("all");
  const [ageBucket, setAgeBucket] = useState("all");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    date_naissance: "",
    sexe: "male",
    adresse: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/patients");
      setPatients(response.data ?? []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return "-";
    const today = new Date();
    const birth = new Date(dateNaissance);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const isInAgeBucket = (dateNaissance) => {
      if (!dateNaissance || ageBucket === "all") return true;
      const age = calculateAge(dateNaissance);
      if (age === "-" || Number.isNaN(age)) return false;

      if (ageBucket === "-18") return age < 18;
      if (ageBucket === "18-35") return age >= 18 && age <= 35;
      if (ageBucket === "36-55") return age >= 36 && age <= 55;
      if (ageBucket === "56+") return age >= 56;
      return true;
    };

    const sexOk = (p) => {
      if (sexFilter === "all") return true;
      return p.sexe === sexFilter;
    };

    return patients.filter((p) => {
      if (!sexOk(p)) return false;
      if (!isInAgeBucket(p.date_naissance)) return false;

      if (!q) return true;

      const nom = (p.user?.nom ?? "").toLowerCase();
      const prenom = (p.user?.prenom ?? "").toLowerCase();
      const email = (p.user?.email ?? "").toLowerCase();
      return nom.includes(q) || prenom.includes(q) || email.includes(q);
    });
  }, [patients, searchQuery, sexFilter, ageBucket]);

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      date_naissance: "",
      sexe: "male",
      adresse: "",
    });
    setFormErrors([]);
  };

  const handleOpenModal = (patient = null) => {
    if (patient) {
      setEditingId(patient.id);
      setFormData({
        nom: patient.user?.nom || "",
        prenom: patient.user?.prenom || "",
        email: patient.user?.email || "",
        telephone: patient.user?.telephone || "",
        date_naissance: patient.date_naissance || "",
        sexe: patient.sexe || "male",
        adresse: patient.adresse || "",
      });
    } else {
      setEditingId(null);
      resetForm();
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
    setFormSubmitting(true);
    setFormErrors([]);

    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, formData);
      } else {
        await api.post("/patients", formData);
      }
      handleCloseModal();
      await fetchPatients();
    } catch (err) {
      if (err?.response?.data?.message) {
        setFormErrors([err.response.data.message]);
      } else if (err?.response?.data?.errors) {
        setFormErrors(Object.values(err.response.data.errors).flat());
      } else {
        setFormErrors(["Erreur lors de l'enregistrement du patient."]);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (patientId) => {
    try {
      await api.delete(`/patients/${patientId}`);
      if (selectedPatientId === patientId) setSelectedPatientId(null);
      await fetchPatients();
      setConfirmDelete(null);
    } catch (error) {
      setConfirmDelete(null);
      setAlertInfo({ title: "Erreur", message: error?.response?.data?.message || "Erreur lors de la suppression", variant: "danger" });
    }
  };

  const handleViewPatient = (id) => {
    setSelectedPatientId(id);
    setShowModal(false);
  };

  const handleBackToList = () => setSelectedPatientId(null);

  return (
    <div className="patients-container">
      <div className="patients-header">
        <div>
          <h1 className="patients-title">Gestion des Patients</h1>
          <p className="patients-subtitle">
            Total: {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="mmd-btn mmd-btn-primary"
          onClick={() => {
            setSelectedPatientId(null);
            handleOpenModal();
          }}
        >
          <i className="bi bi-plus-lg"></i>
          Ajouter un patient
        </button>
      </div>

      {/* Patient detail view */}
      {selectedPatient ? (
        <div className="patients-view-card">
          <div className="patients-view-header">
            <h3>
              Dossier patient — {selectedPatient.user?.nom}{" "}
              {selectedPatient.user?.prenom}
            </h3>
            <button
              className="mmd-btn mmd-btn-secondary mmd-btn-sm"
              onClick={handleBackToList}
            >
              <i className="bi bi-arrow-left"></i> Retour à la liste
            </button>
          </div>

          <div className="patients-view-body">
            <div className="patients-detail-grid">
              <div className="patients-detail-item">
                <span className="patients-detail-label">Nom</span>
                <span className="patients-detail-value">
                  {selectedPatient.user?.nom ?? "—"}
                </span>
              </div>
              <div className="patients-detail-item">
                <span className="patients-detail-label">Prénom</span>
                <span className="patients-detail-value">
                  {selectedPatient.user?.prenom ?? "—"}
                </span>
              </div>
              <div className="patients-detail-item">
                <span className="patients-detail-label">Email</span>
                <span className="patients-detail-value">
                  {selectedPatient.user?.email ?? "—"}
                </span>
              </div>
              <div className="patients-detail-item">
                <span className="patients-detail-label">Téléphone</span>
                <span className="patients-detail-value">
                  {selectedPatient.user?.telephone ?? "—"}
                </span>
              </div>
              <div className="patients-detail-item">
                <span className="patients-detail-label">Date de naissance</span>
                <span className="patients-detail-value">
                  {selectedPatient.date_naissance ?? "—"}
                </span>
              </div>
              <div className="patients-detail-item">
                <span className="patients-detail-label">Âge</span>
                <span className="patients-detail-value">
                  {calculateAge(selectedPatient.date_naissance)} ans
                </span>
              </div>
              <div className="patients-detail-item">
                <span className="patients-detail-label">Genre</span>
                <span className="patients-detail-value">
                  {selectedPatient.sexe === "male" ? "Homme" : "Femme"}
                </span>
              </div>
              <div className="patients-detail-item">
                <span className="patients-detail-label">Adresse</span>
                <span className="patients-detail-value">
                  {selectedPatient.adresse ?? "—"}
                </span>
              </div>
              <div className="patients-detail-item" style={{ gridColumn: "1 / -1" }}>
                <span className="patients-detail-label">Date d'inscription</span>
                <span className="patients-detail-value">
                  {selectedPatient.created_at
                    ? new Date(selectedPatient.created_at).toLocaleDateString("fr-FR")
                    : "—"}
                </span>
              </div>
            </div>

            <div className="patients-view-actions">
              <button
                className="mmd-btn mmd-btn-primary"
                onClick={() => handleOpenModal(selectedPatient)}
              >
                <i className="bi bi-pencil"></i> Modifier
              </button>
              <button
                className="mmd-btn mmd-btn-danger"
                onClick={() => setConfirmDelete(selectedPatient.id)}
              >
                <i className="bi bi-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
            <div className="patients-filters">
              <div className="filter-search">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Sexe</label>
                <select
                  className="mmd-select"
                  value={sexFilter}
                  onChange={(e) => {
                    setSexFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Tous</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Âge (ans)</label>
                <select
                  className="mmd-select"
                  value={ageBucket}
                  onChange={(e) => {
                    setAgeBucket(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Tous</option>
                  <option value="-18">-18</option>
                  <option value="18-35">18-35</option>
                  <option value="36-55">36-55</option>
                  <option value="56+">56+</option>
                </select>
              </div>
            </div>


          {/* Loading state */}
          {loading ? (
            <div className="patients-loading">
              <div className="mmd-loading">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <p>Chargement des patients...</p>
            </div>
          ) : paginatedPatients.length === 0 ? (
            <div className="patients-empty">
              <i className="bi bi-inbox"></i>
              <h3>Aucun patient trouvé</h3>
              <p>Commencez par ajouter un nouveau patient</p>
            </div>
          ) : (
            <div className="mmd-card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="mmd-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Téléphone</th>
                    <th>Âge</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient) => {
                    const age = calculateAge(patient.date_naissance);
                    const isMale = patient.sexe === "male";
                    return (
                      <tr key={patient.id}>
                        <td>
                          <div className="patient-name">
                            <div className="patient-avatar">
                              <img
                                src={isMale ? "/images/male.png" : "/images/female.png"}
                                alt={isMale ? "Homme" : "Femme"}
                              />
                            </div>
                            <div>
                              <strong>
                                {patient.user?.nom} {patient.user?.prenom}
                              </strong>
                            </div>
                          </div>
                        </td>
                        <td>
                          {patient.user?.telephone ? (
                            <a href={`tel:${patient.user.telephone}`}>
                              {patient.user.telephone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {age !== "-" && (
                            <span className="mmd-badge mmd-badge-info">
                              {age} ans
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button
                              className="mmd-btn mmd-btn-info mmd-btn-sm"
                              onClick={() => handleViewPatient(patient.id)}
                              title="Voir"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="mmd-btn mmd-btn-sm"
                              onClick={() => handleOpenModal(patient)}
                              title="Modifier"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="mmd-btn mmd-btn-sm mmd-btn-danger"
                              onClick={() => setConfirmDelete(patient.id)}
                              title="Supprimer"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

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
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Suivant <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer ce patient ?`}
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

      {/* Add/Edit modal */}
      {showModal && (
        <div className="mmd-modal-overlay" onClick={handleCloseModal}>
          <div className="mmd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mmd-modal-header">
              <h3 className="mmd-modal-title">
                {editingId ? "Modifier le patient" : "Ajouter un patient"}
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Nom</label>
                    <input
                      type="text"
                      className="mmd-input"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Prénom</label>
                    <input
                      type="text"
                      className="mmd-input"
                      value={formData.prenom}
                      onChange={(e) =>
                        setFormData({ ...formData, prenom: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Email</label>
                  <input
                    type="email"
                    className="mmd-input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Téléphone</label>
                    <input
                      type="tel"
                      className="mmd-input"
                      value={formData.telephone}
                      onChange={(e) =>
                        setFormData({ ...formData, telephone: e.target.value })
                      }
                    />
                  </div>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Date de naissance</label>
                    <input
                      type="date"
                      className="mmd-input"
                      value={formData.date_naissance}
                      onChange={(e) =>
                        setFormData({ ...formData, date_naissance: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Genre</label>
                    <select
                      className="mmd-select"
                      value={formData.sexe}
                      onChange={(e) =>
                        setFormData({ ...formData, sexe: e.target.value })
                      }
                    >
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                    </select>
                  </div>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Adresse</label>
                    <input
                      type="text"
                      className="mmd-input"
                      value={formData.adresse}
                      onChange={(e) =>
                        setFormData({ ...formData, adresse: e.target.value })
                      }
                    />
                  </div>
                </div>
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

export default PatientsPage;