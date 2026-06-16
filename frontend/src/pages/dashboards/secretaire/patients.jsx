import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import api from "../../../api/axios";
import ConfirmModal from "../../../components/ConfirmModal";
import AlertModal from "../../../components/AlertModal";
import "./patients.css";

const SecretairePatients = () => {
  const { user } = useContext(AuthContext);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // view dossier
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  // form add patient
  const [showAdd, setShowAdd] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    password_confirmation: "",
    date_naissance: "",
    adresse: "",
    sexe: "male",
    antecedents: "",
    allergies: "",
    notes_generales: "",
  });

  // edit patient
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    antecedents: "",
    allergies: "",
    notes_generales: "",
  });

  // confirmation & alert modals
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/patients");
      setPatients(res.data ?? []);
    } catch (err) {
      console.log(err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.trim().toLowerCase();
    return patients.filter((p) => {
      const nom = (p.user?.nom ?? "").toLowerCase();
      const prenom = (p.user?.prenom ?? "").toLowerCase();
      const email = (p.user?.email ?? "").toLowerCase();
      return nom.includes(q) || prenom.includes(q) || email.includes(q);
    });
  }, [patients, searchQuery]);

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const resetAddForm = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      password: "",
      password_confirmation: "",
      date_naissance: "",
      adresse: "",
      sexe: "male",
      antecedents: "",
      allergies: "",
      notes_generales: "",
    });
    setFormErrors([]);
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setFormSubmitting(true);

    try {
      await api.post("/patients", {
        ...form,
        password_confirmation: form.password_confirmation,
      });

      resetAddForm();
      setShowAdd(false);
      await fetchPatients();
    } catch (err) {
      if (err?.response?.data?.message) {
        setFormErrors([err.response.data.message]);
      } else if (err?.response?.data?.errors) {
        setFormErrors(Object.values(err.response.data.errors).flat());
      } else {
        setFormErrors(["Erreur lors de l'ajout du patient."]);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleViewDossier = (id) => {
    setSelectedPatientId(id);
  };

  const handleBackToList = () => setSelectedPatientId(null);

  const startEditPatient = (p) => {
    setEditFormErrors([]);
    setEditingPatientId(p.id);
    setSelectedPatientId(null);

    setEditForm({
      nom: p.user?.nom ?? "",
      prenom: p.user?.prenom ?? "",
      telephone: p.user?.telephone ?? "",
      antecedents: p.dossierMedical?.antecedents ?? "",
      allergies: p.dossierMedical?.allergies ?? "",
      notes_generales: p.dossierMedical?.notes_generales ?? "",
    });
  };

  const cancelEditPatient = () => {
    setEditingPatientId(null);
    setEditFormErrors([]);
    setEditForm({
      nom: "",
      prenom: "",
      telephone: "",
      antecedents: "",
      allergies: "",
      notes_generales: "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditFormErrors([]);

    try {
      await api.put(`/patients/${editingPatientId}`, {
        nom: editForm.nom,
        prenom: editForm.prenom,
        telephone: editForm.telephone,
        antecedents: editForm.antecedents,
        allergies: editForm.allergies,
        notes_generales: editForm.notes_generales,
      });

      cancelEditPatient();
      await fetchPatients();
    } catch (err) {
      const msg = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;
      if (msg) setEditFormErrors([msg]);
      else if (errors) setEditFormErrors(Object.values(errors).flat());
      else setEditFormErrors(["Erreur lors de la mise à jour du patient."]);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/patients/${deleteConfirmId}`);
      if (selectedPatientId === deleteConfirmId) setSelectedPatientId(null);
      setDeleteConfirmId(null);
      await fetchPatients();
    } catch (err) {
      setDeleteConfirmId(null);
      setAlertInfo({
        variant: "danger",
        message: err?.response?.data?.message || "Erreur suppression patient",
      });
    }
  };

  if (loading) {
    return (
      <div className="secretaire-patients-container">
        <div className="secretaire-patients-loading">
          <div className="mmd-loading">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p>Chargement des patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="secretaire-patients-container">
      <div className="secretaire-patients-header">
        <div>
          <h1 className="secretaire-patients-title">Gestion des Patients</h1>
          <p className="secretaire-patients-subtitle">
            Total: {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="mmd-btn mmd-btn-primary"
          onClick={() => {
            setShowAdd(true);
            setSelectedPatientId(null);
            resetAddForm();
          }}
        >
          <i className="bi bi-plus-lg"></i>
          Ajouter un patient
        </button>
      </div>

      {/* Edit form (inline card) */}
      {editingPatientId ? (
        <div className="secretaire-patients-edit-card">
          <div className="secretaire-patients-edit-header">
            <h3>
              Modifier patient —{" "}
              {patients.find((p) => p.id === editingPatientId)?.user?.nom ?? ""}{" "}
              {patients.find((p) => p.id === editingPatientId)?.user?.prenom ?? ""}
            </h3>
            <button
              className="mmd-btn mmd-btn-secondary mmd-btn-sm"
              onClick={cancelEditPatient}
              disabled={editSaving}
            >
              Fermer
            </button>
          </div>

          <div className="secretaire-patients-edit-body">
            {editFormErrors.length > 0 && (
              <div className="mmd-alert mmd-alert-danger">
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {editFormErrors.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="secretaire-patients-form-grid">
                <div className="mmd-form-group">
                  <label className="mmd-label">Nom</label>
                  <input
                    className="mmd-input"
                    value={editForm.nom}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, nom: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Prénom</label>
                  <input
                    className="mmd-input"
                    value={editForm.prenom}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, prenom: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Téléphone</label>
                  <input
                    className="mmd-input"
                    value={editForm.telephone}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, telephone: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Antécédents</label>
                  <input
                    className="mmd-input"
                    value={editForm.antecedents}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        antecedents: e.target.value,
                      }))
                    }
                    placeholder="ex: diabète, HTA..."
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Allergies</label>
                  <input
                    className="mmd-input"
                    value={editForm.allergies}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        allergies: e.target.value,
                      }))
                    }
                    placeholder="ex: pénicilline..."
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Notes générales</label>
                  <input
                    className="mmd-input"
                    value={editForm.notes_generales}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        notes_generales: e.target.value,
                      }))
                    }
                    placeholder="ex: remarques..."
                  />
                </div>
              </div>

              <div className="secretaire-patients-form-actions">
                <button
                  type="submit"
                  className="mmd-btn mmd-btn-primary"
                  disabled={editSaving}
                >
                  {editSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : selectedPatient ? (
        /* View dossier card */
        <div className="secretaire-patients-view-card">
          <div className="secretaire-patients-view-header">
            <h3>
              Dossier médical — {selectedPatient.user?.nom}{" "}
              {selectedPatient.user?.prenom}
            </h3>
            <button
              className="mmd-btn mmd-btn-secondary mmd-btn-sm"
              onClick={handleBackToList}
            >
              ← Retour
            </button>
          </div>

          <div className="secretaire-patients-view-body">
            <div className="secretaire-patients-detail-grid">
              <div className="secretaire-patients-detail-item">
                <span className="secretaire-patients-detail-label">Nom</span>
                <span className="secretaire-patients-detail-value">
                  {selectedPatient.user?.nom ?? "—"}
                </span>
              </div>
              <div className="secretaire-patients-detail-item">
                <span className="secretaire-patients-detail-label">Prénom</span>
                <span className="secretaire-patients-detail-value">
                  {selectedPatient.user?.prenom ?? "—"}
                </span>
              </div>
              <div className="secretaire-patients-detail-item">
                <span className="secretaire-patients-detail-label">Téléphone</span>
                <span className="secretaire-patients-detail-value">
                  {selectedPatient.user?.telephone ?? "—"}
                </span>
              </div>
              <div className="secretaire-patients-detail-item">
                <span className="secretaire-patients-detail-label">Date création</span>
                <span className="secretaire-patients-detail-value">
                  {selectedPatient.dossierMedical?.date_creation ?? "—"}
                </span>
              </div>
              <div className="secretaire-patients-detail-item">
                <span className="secretaire-patients-detail-label">Antécédents</span>
                <span className="secretaire-patients-detail-value">
                  {selectedPatient.dossierMedical?.antecedents ?? "—"}
                </span>
              </div>
              <div className="secretaire-patients-detail-item">
                <span className="secretaire-patients-detail-label">Allergies</span>
                <span className="secretaire-patients-detail-value">
                  {selectedPatient.dossierMedical?.allergies ?? "—"}
                </span>
              </div>
              <div className="secretaire-patients-detail-item" style={{ gridColumn: "1 / -1" }}>
                <span className="secretaire-patients-detail-label">Notes générales</span>
                <span className="secretaire-patients-detail-value">
                  {selectedPatient.dossierMedical?.notes_generales ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Add patient modal */}
          {showAdd && (
            <div className="mmd-modal-overlay" onClick={() => { setShowAdd(false); setFormErrors([]); }}>
              <div className="mmd-modal secretaire-patients-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mmd-modal-header">
                  <h3 className="mmd-modal-title">Ajouter un patient</h3>
                  <button
                    className="mmd-modal-close"
                    onClick={() => { setShowAdd(false); setFormErrors([]); }}
                    aria-label="Fermer"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>

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

                  <form onSubmit={handleAddPatient}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Nom</label>
                        <input className="mmd-input" value={form.nom}
                          onChange={(e) => setForm((s) => ({ ...s, nom: e.target.value }))}
                          required />
                      </div>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Prénom</label>
                        <input className="mmd-input" value={form.prenom}
                          onChange={(e) => setForm((s) => ({ ...s, prenom: e.target.value }))}
                          required />
                      </div>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Téléphone</label>
                        <input className="mmd-input" value={form.telephone}
                          onChange={(e) => setForm((s) => ({ ...s, telephone: e.target.value }))}
                          required />
                      </div>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Email</label>
                        <input className="mmd-input" type="email" value={form.email}
                          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                          required />
                      </div>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Mot de passe</label>
                        <input className="mmd-input" type="password" value={form.password}
                          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                          required />
                      </div>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Confirmer le mot de passe</label>
                        <input className="mmd-input" type="password" value={form.password_confirmation}
                          onChange={(e) => setForm((s) => ({ ...s, password_confirmation: e.target.value }))}
                          required />
                      </div>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Date naissance</label>
                        <input className="mmd-input" type="date" value={form.date_naissance}
                          onChange={(e) => setForm((s) => ({ ...s, date_naissance: e.target.value }))}
                          required />
                      </div>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Sexe</label>
                        <select className="mmd-select" value={form.sexe}
                          onChange={(e) => setForm((s) => ({ ...s, sexe: e.target.value }))}
                          required>
                          <option value="male">Homme</option>
                          <option value="female">Femme</option>
                        </select>
                      </div>
                    </div>

                    <div className="mmd-form-group">
                      <label className="mmd-label">Adresse</label>
                      <input className="mmd-input" value={form.adresse}
                        onChange={(e) => setForm((s) => ({ ...s, adresse: e.target.value }))}
                        required />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Antécédents (optionnel)</label>
                        <input className="mmd-input" value={form.antecedents}
                          onChange={(e) => setForm((s) => ({ ...s, antecedents: e.target.value }))}
                          placeholder="ex: diabète, HTA..." />
                      </div>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Allergies (optionnel)</label>
                        <input className="mmd-input" value={form.allergies}
                          onChange={(e) => setForm((s) => ({ ...s, allergies: e.target.value }))}
                          placeholder="ex: pénicilline..." />
                      </div>
                      <div className="mmd-form-group">
                        <label className="mmd-label">Notes générales (optionnel)</label>
                        <input className="mmd-input" value={form.notes_generales}
                          onChange={(e) => setForm((s) => ({ ...s, notes_generales: e.target.value }))}
                          placeholder="ex: remarques..." />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="mmd-modal-footer">
                  <button type="button" className="mmd-btn mmd-btn-secondary"
                    onClick={() => { setShowAdd(false); setFormErrors([]); }}
                    disabled={formSubmitting}>
                    Annuler
                  </button>
                  <button type="button" className="mmd-btn mmd-btn-primary"
                    onClick={handleAddPatient}
                    disabled={formSubmitting}>
                    {formSubmitting ? "Création..." : "Ajouter"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="secretaire-patients-filters">
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
          </div>

          {/* Table card */}
          <div className="mmd-card" style={{ padding: 0, overflow: "hidden" }}>
            {filteredPatients.length === 0 ? (
              <div className="secretaire-patients-empty">
                <i className="bi bi-inbox"></i>
                <h3>Aucun patient trouvé</h3>
                <p>Commencez par ajouter un nouveau patient</p>
              </div>
            ) : (
              <>
                <table className="mmd-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Téléphone</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPatients.map((p) => (
                      <tr key={p.id}>
                        <td>{p.user?.nom ?? "—"}</td>
                        <td>{p.user?.prenom ?? "—"}</td>
                        <td>{p.user?.telephone ?? "—"}</td>
                        <td className="text-center">
                          <div className="secretaire-patients-actions">
                            <button
                              className="mmd-btn mmd-btn-info mmd-btn-sm"
                              onClick={() => handleViewDossier(p.id)}
                              title="Voir dossier"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="mmd-btn mmd-btn-sm"
                              onClick={() => startEditPatient(p)}
                              title="Modifier"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="mmd-btn mmd-btn-sm mmd-btn-danger"
                              onClick={() => setDeleteConfirmId(p.id)}
                              title="Supprimer"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="secretaire-patients-pagination">
                    <button
                      className="mmd-btn mmd-btn-secondary mmd-btn-sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i> Précédent
                    </button>
                    <span className="secretaire-patients-pagination-info">
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
              </>
            )}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />

      <AlertModal
        isOpen={alertInfo !== null}
        title="Erreur"
        message={alertInfo?.message || ""}
        variant="danger"
        onClose={() => setAlertInfo(null)}
      />
    </div>
  );
};

export default SecretairePatients;
