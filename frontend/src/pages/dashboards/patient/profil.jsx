import { useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import api from "../../../api/axios";
import "./profil.css";
import AlertModal from '../../../components/AlertModal';
import ConfirmModal from '../../../components/ConfirmModal';

const ProfilPage = () => {
  const { user, logout } = useContext(AuthContext);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom ?? "",
    prenom: user?.prenom ?? "",
    email: user?.email ?? "",
    telephone: user?.telephone ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleModifier = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/patients/${user?.patient_id ?? user?.id}`, form);
      setAlertInfo({ title: "Succès", message: "Profil mis à jour avec succès ✅", variant: "success" });
      setEditMode(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de la mise à jour";
      setAlertInfo({ title: "Erreur", message: typeof msg === "string" ? msg : JSON.stringify(msg), variant: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupprimer = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/patients/${user?.patient_id ?? user?.id}`);
      setConfirmDeleteModal(false);
      setAlertInfo({ title: "Compte supprimé", message: "Votre compte a été supprimé.", variant: "success" });
      setTimeout(() => logout(), 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de la suppression";
      setAlertInfo({ title: "Erreur", message: typeof msg === "string" ? msg : JSON.stringify(msg), variant: "danger" });
      setConfirmDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const userInitials = `${user?.nom?.charAt(0) || ""}${user?.prenom?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="mmd-grid mmd-grid-2" style={{ gap: 24 }}>
      {/* Profile info card */}
      <div className="mmd-card">
        <div className="mmd-card-header">
          <h3 className="mmd-card-title">Mon Profil</h3>
        </div>

        <div className="mmd-flex mmd-gap-16" style={{ marginBottom: 24 }}>
          <div className="mmd-user-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
            {userInitials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>
              {user?.nom} {user?.prenom}
            </div>
            <div className="mmd-text-muted" style={{ fontSize: 14 }}>
              Patient
            </div>
          </div>
        </div>

        {editMode ? (
          <div>
            <div className="mmd-form-group">
              <label className="mmd-label">Nom</label>
              <input
                className="mmd-input"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
            <div className="mmd-form-group">
              <label className="mmd-label">Prénom</label>
              <input
                className="mmd-input"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
            <div className="mmd-form-group">
              <label className="mmd-label">Email</label>
              <input
                className="mmd-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
            <div className="mmd-form-group">
              <label className="mmd-label">Téléphone</label>
              <input
                className="mmd-input"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="mmd-flex-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
              <span className="mmd-text-muted">Nom</span>
              <span style={{ color:"white"}}>{user?.nom ?? "—"}</span>
            </div>
            <div className="mmd-flex-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
              <span className="mmd-text-muted">Prénom</span>
              <span style={{ color:"white"}}>{user?.prenom ?? "—"}</span>
            </div>
            <div className="mmd-flex-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
              <span className="mmd-text-muted">Email</span>
              <span style={{ color:"white"}}>{user?.email ?? "—"}</span>
            </div>
            <div className="mmd-flex-between" style={{ padding: "12px 0" }}>
              <span className="mmd-text-muted">Téléphone</span>
              <span style={{ color:"white"}}>{user?.telephone ?? "—"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions card */}
      <div className="mmd-card">
        <div className="mmd-card-header">
          <h3 className="mmd-card-title">Actions</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button
            type="button"
            className={`mmd-btn ${editMode ? "mmd-btn-primary" : "mmd-btn-info"} mmd-btn-lg`}
            onClick={handleModifier}
            disabled={submitting}
            style={{ justifyContent: "center" }}
          >
            <i className={editMode ? "bi bi-check-circle-fill" : "bi bi-pencil-fill"}></i>
            {editMode ? (submitting ? "Enregistrement..." : "Enregistrer") : "Modifier"}
          </button>

          {editMode && (
            <button
              type="button"
              className="mmd-btn mmd-btn-secondary mmd-btn-lg"
              onClick={() => {
                setEditMode(false);
                setForm({
                  nom: user?.nom ?? "",
                  prenom: user?.prenom ?? "",
                  email: user?.email ?? "",
                  telephone: user?.telephone ?? "",
                });
                setConfirmDeleteModal(false);
              }}
              disabled={submitting}
              style={{ justifyContent: "center" }}
            >
              <i className="bi bi-x-circle-fill"></i>
              Annuler
            </button>
          )}

          <button
            type="button"
            className="mmd-btn mmd-btn-lg mmd-btn-secondary"
            onClick={() => setConfirmDeleteModal(true)}
            disabled={submitting}
            style={{ justifyContent: "center", border: "1px solid var(--danger-color)", color: "var(--danger-color)" }}
          >
            <i className="bi bi-trash-fill"></i>
            Supprimer
          </button>
        </div>
      </div>
      <AlertModal
        isOpen={!!alertInfo}
        title={alertInfo?.title}
        message={alertInfo?.message}
        variant={alertInfo?.variant || "success"}
        onClose={() => { setAlertInfo(null); if (alertInfo?.variant === "success" && alertInfo?.title === "Compte supprimé") logout(); }}
      />
      <ConfirmModal
        isOpen={confirmDeleteModal}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
        onConfirm={handleSupprimer}
        onCancel={() => setConfirmDeleteModal(false)}
        confirmLabel="Supprimer"
      />
    </div>
  );
};

export default ProfilPage;