import { useEffect, useState } from "react";
import api from "../../../api/axios";
import "./monCabinet.css";

const initialFormData = {
  nom: "",
  adresse: "",
  telephone: "",
  specialite: "",
  latitude: "",
  longitude: "",
  logo: null,
};

const MonCabinetPage = () => {
  const [cabinet, setCabinet] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [editing, setEditing] = useState(false);

  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const cabinetId = cabinet?.id ?? null;

  const fetchCabinet = async () => {
    try {
      const res = await api.get("/cabinet/moncabinet");
      setCabinet(res.data);

      if (!editing) {
        if (res.data) {
          setFormData({
            nom: res.data.nom || "",
            adresse: res.data.adresse || "",
            telephone: res.data.telephone || "",
            specialite: res.data.specialite || "",
            latitude: res.data.latitude ?? "",
            longitude: res.data.longitude ?? "",
            logo: null,
          });
        } else {
          setFormData(initialFormData);
        }
      }
    } catch (err) {
      console.log(err);
      setCabinet(null);
      if (!editing) setFormData(initialFormData);
    }
  };

  useEffect(() => {
    fetchCabinet();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      logo: file,
    }));
  };

  const buildMultipartPayload = () => {
    const fd = new FormData();

    const nomValue = String(formData.nom ?? "").trim();
    const adresseValue = String(formData.adresse ?? "").trim();
    const telephoneValue = String(formData.telephone ?? "").trim();
    const specialiteValue = String(formData.specialite ?? "").trim();

    fd.append("nom", nomValue);
    fd.append("adresse", adresseValue);
    fd.append("telephone", telephoneValue);
    fd.append("specialite", specialiteValue);

    const latitudeTrimmed = String(formData.latitude ?? "").trim();
    const longitudeTrimmed = String(formData.longitude ?? "").trim();

    if (latitudeTrimmed !== "") fd.append("latitude", latitudeTrimmed);
    if (longitudeTrimmed !== "") fd.append("longitude", longitudeTrimmed);

    if (formData.logo) {
      fd.append("logo", formData.logo);
    }

    return fd;
  };

  const handleSubmit = async () => {
    try {
      setUpdateError("");
      setUpdateSuccess("");
      setIsSubmitting(true);

      const payload = buildMultipartPayload();

      const res = cabinet
        ? await api.post(`/cabinet/${cabinet.id}`, payload)
        : await api.post("/cabinet", payload);

      const updated = cabinet ? res?.data : res?.data?.cabinet;

      if (!updated || typeof updated !== "object") {
        setUpdateError("Réponse serveur invalide (aucun cabinet renvoyé).");
        return;
      }

      setCabinet(updated);
      setFormData({
        nom: updated.nom || "",
        adresse: updated.adresse || "",
        telephone: updated.telephone || "",
        specialite: updated.specialite || "",
        latitude: updated.latitude ?? "",
        longitude: updated.longitude ?? "",
        logo: null,
      });

      setUpdateSuccess(
        cabinet
          ? "Cabinet mis à jour avec succès."
          : "Cabinet créé avec succès."
      );
      setEditing(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Mise à jour impossible.";
      setUpdateError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = () => {
    setEditing(true);
    setUpdateError("");
    setUpdateSuccess("");
    setIsSubmitting(false);

    if (!cabinet) return;

    setFormData({
      nom: cabinet.nom || "",
      adresse: cabinet.adresse || "",
      telephone: cabinet.telephone || "",
      specialite: cabinet.specialite || "",
      latitude: cabinet.latitude ?? "",
      longitude: cabinet.longitude ?? "",
      logo: null,
    });
  };

  const startCreate = () => {
    setEditing(true);
    setUpdateError("");
    setUpdateSuccess("");
    setIsSubmitting(false);
    setFormData(initialFormData);
  };

  const cancelEdit = () => {
    setEditing(false);
    setUpdateError("");
    setUpdateSuccess("");
    setIsSubmitting(false);

    if (cabinet) {
      setFormData({
        nom: cabinet.nom || "",
        adresse: cabinet.adresse || "",
        telephone: cabinet.telephone || "",
        specialite: cabinet.specialite || "",
        latitude: cabinet.latitude ?? "",
        longitude: cabinet.longitude ?? "",
        logo: null,
      });
    } else {
      setFormData(initialFormData);
    }
  };

  const openDelete = () => {
    setDeleteError("");
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!cabinetId) return;

    try {
      setDeleteError("");
      await api.delete(`/cabinet/${cabinetId}`);
      closeDelete();
      setEditing(false);
      await fetchCabinet();
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message || "Suppression impossible."
      );
    }
  };

  const deleteDisabled = !cabinetId;
  const submitLabel = cabinet ? "Mettre à jour" : "Créer Cabinet";

  return (
    <div className="cabinet-container">
      <div className="cabinet-header">
        <h1 className="cabinet-title">Mon Cabinet</h1>
        <p className="cabinet-subtitle">
          {cabinet ? "Gérez les informations de votre cabinet" : "Aucun cabinet enregistré"}
        </p>
      </div>

      {/* View mode - cabinet exists, not editing */}
      {cabinet && !editing && (
        <div className="cabinet-card">
          <div className="cabinet-detail-grid">
            <div className="cabinet-detail-item">
              <div className="cabinet-detail-label">Nom</div>
              <div className="cabinet-detail-value">{cabinet.nom}</div>
            </div>
            <div className="cabinet-detail-item">
              <div className="cabinet-detail-label">Spécialité</div>
              <div className="cabinet-detail-value">{cabinet.specialite}</div>
            </div>
            <div className="cabinet-detail-item">
              <div className="cabinet-detail-label">Téléphone</div>
              <div className="cabinet-detail-value">{cabinet.telephone}</div>
            </div>
            <div className="cabinet-detail-item">
              <div className="cabinet-detail-label">Adresse</div>
              <div className="cabinet-detail-value">{cabinet.adresse}</div>
            </div>
            <div className="cabinet-detail-item">
              <div className="cabinet-detail-label">Latitude</div>
              <div className="cabinet-detail-value">{cabinet.latitude}</div>
            </div>
            <div className="cabinet-detail-item">
              <div className="cabinet-detail-label">Longitude</div>
              <div className="cabinet-detail-value">{cabinet.longitude}</div>
            </div>

            {cabinet.logo && (
              <div className="cabinet-detail-item cabinet-detail-full">
                <div className="cabinet-detail-label">Logo</div>
                <img
                  src={`/uploads/cabinets/${cabinet.logo}`}
                  alt="Logo du cabinet"
                  className="cabinet-logo"
                />
              </div>
            )}
          </div>

          <div className="cabinet-actions">
            <button className="mmd-btn mmd-btn-primary" onClick={startEdit}>
              <i className="bi bi-pencil"></i> Modifier
            </button>
            <button
              className="mmd-btn mmd-btn-danger"
              onClick={openDelete}
              disabled={deleteDisabled}
            >
              <i className="bi bi-trash"></i> Supprimer
            </button>
          </div>
        </div>
      )}

      {/* Empty state - no cabinet, not editing */}
      {!cabinet && !editing && (
        <div className="cabinet-card">
          <div className="cabinet-empty">
            <div className="cabinet-empty-icon">
              <i className="bi bi-building"></i>
            </div>
            <h3 className="cabinet-empty-title">Aucun cabinet enregistré</h3>
            <p className="cabinet-empty-text">
              Ajoutez votre cabinet pour commencer à gérer vos patients et rendez-vous.
            </p>
            <button className="mmd-btn mmd-btn-primary" onClick={startCreate}>
              <i className="bi bi-plus-lg"></i> Ajouter mon cabinet
            </button>
          </div>
        </div>
      )}

      {/* Edit / Create mode */}
      {editing && (
        <div className="cabinet-card">
          {updateError && (
            <div className="cabinet-alert cabinet-alert--error">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="cabinet-alert cabinet-alert--success">
              <i className="bi bi-check-circle-fill"></i>
              {updateSuccess}
            </div>
          )}

          <div className="cabinet-form-grid">
            <div className="mmd-form-group">
              <label className="mmd-label">Nom</label>
              <input
                name="nom"
                className="mmd-input"
                value={formData.nom}
                onChange={handleChange}
              />
            </div>

            <div className="mmd-form-group">
              <label className="mmd-label">Spécialité</label>
              <input
                name="specialite"
                className="mmd-input"
                value={formData.specialite}
                onChange={handleChange}
              />
            </div>

            <div className="mmd-form-group">
              <label className="mmd-label">Téléphone</label>
              <input
                name="telephone"
                className="mmd-input"
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>

            <div className="mmd-form-group">
              <label className="mmd-label">Adresse</label>
              <input
                name="adresse"
                className="mmd-input"
                value={formData.adresse}
                onChange={handleChange}
              />
            </div>

            <div className="mmd-form-group">
              <label className="mmd-label">Latitude</label>
              <input
                name="latitude"
                className="mmd-input"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="mmd-form-group">
              <label className="mmd-label">Longitude</label>
              <input
                name="longitude"
                className="mmd-input"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>

            <div className="mmd-form-group cabinet-form-full">
              <label className="mmd-label">Logo (optionnel)</label>
              <input
                type="file"
                accept="image/*"
                className="mmd-input"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <div className="cabinet-form-actions">
            <button
              className="mmd-btn mmd-btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : submitLabel}
            </button>
            <button
              className="mmd-btn mmd-btn-secondary"
              onClick={cancelEdit}
              disabled={isSubmitting}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteOpen && cabinet && (
        <div
          className="cabinet-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closeDelete}
        >
          <div className="cabinet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cabinet-modal-header">
              <h3 className="cabinet-modal-title">Supprimer le cabinet ?</h3>
              <button
                type="button"
                className="cabinet-modal-close"
                onClick={closeDelete}
                aria-label="Fermer"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="cabinet-modal-body">
              <p style={{ margin: 0 }}>
                Cette action est irréversible. Le cabinet sera supprimé
                définitivement.
              </p>
              {deleteError && (
                <div className="cabinet-alert cabinet-alert--error" style={{ marginTop: 16 }}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {deleteError}
                </div>
              )}
            </div>

            <div className="cabinet-modal-footer">
              <button
                type="button"
                className="mmd-btn mmd-btn-secondary"
                onClick={closeDelete}
              >
                Annuler
              </button>
              <button
                type="button"
                className="mmd-btn mmd-btn-danger"
                onClick={confirmDelete}
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonCabinetPage;
