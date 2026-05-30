import { useEffect, useState } from "react";
import api from "../../../api/axios";

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

      // IMPORTANT: don’t overwrite user edits while editing
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
    if (!cabinet) return;
    try {
      setUpdateError("");
      setUpdateSuccess("");
      setIsSubmitting(true);

      const payload = buildMultipartPayload();

      console.log("[MonCabinet] formData lat/lng:", formData.latitude, formData.longitude);
      console.log(
        "[MonCabinet] FormData entries:",
        Array.from(payload.entries()).map(([k, v]) => [k, v])
      );
      console.log(
        "[MonCabinet] FormData lat/lng (get):",
        payload.get("latitude"),
        payload.get("longitude")
      );

      const res = cabinet
        ? await api.post(`/cabinet/${cabinet.id}`, payload)
        : await api.post("/cabinet", payload);

      const updated = res?.data ?? null;
      console.log("[MonCabinet] PUT response:", updated);

      if (!updated || typeof updated !== "object") {
        setUpdateError(
          "Réponse serveur invalide (aucun cabinet renvoyé)."
        );
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
        cabinet ? "Cabinet mis à jour avec succès." : "Cabinet créé avec succès."
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
    <div className="card shadow-sm p-4">
      <h4>Mon Cabinet</h4>

      {cabinet && !editing ? (
        <>
          <div style={{ marginBottom: 10 }}>
            <p>
              <strong>Nom:</strong> {cabinet.nom}
            </p>
            <p>
              <strong>Adresse:</strong> {cabinet.adresse}
            </p>
            <p>
              <strong>Téléphone:</strong> {cabinet.telephone}
            </p>
            <p>
              <strong>Spécialité:</strong> {cabinet.specialite}
            </p>
            <p>
              <strong>Latitude:</strong> {cabinet.latitude}
            </p>
            <p>
              <strong>Longitude:</strong> {cabinet.longitude}
            </p>

            {cabinet.logo ? (
              <p>
                <strong>Logo:</strong>{" "}
                <img
                  src={`/uploads/cabinets/${cabinet.logo}`}
                  alt="Logo du cabinet"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    border: "2px solid #0b0b0b",
                  }}
                />
              </p>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={startEdit}>
              Modifier
            </button>

            <button
              className="btn btn-danger"
              onClick={openDelete}
              disabled={deleteDisabled}
              title={
                deleteDisabled
                  ? "Aucun cabinet à supprimer"
                  : "Supprimer le cabinet"
              }
            >
              Supprimer
            </button>
          </div>
        </>
      ) : !cabinet && !editing ? (
        <>
          <div style={{ marginBottom: 10, fontWeight: 900 }}>
            Tu n'as aucun cabinet.
          </div>

          <button className="btn btn-success" onClick={startCreate}>
            Ajouter mon cabinet
          </button>
        </>
      ) : (
        <>
          <div className="mb-3">
            <label>Nom</label>
            <input
              name="nom"
              className="form-control"
              value={formData.nom}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Adresse</label>
            <input
              name="adresse"
              className="form-control"
              value={formData.adresse}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Téléphone</label>
            <input
              name="telephone"
              className="form-control"
              value={formData.telephone}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Spécialité</label>
            <input
              name="specialite"
              className="form-control"
              value={formData.specialite}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Latitude</label>
            <input
              name="latitude"
              className="form-control"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Longitude</label>
            <input
              name="longitude"
              className="form-control"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Logo (optionnel)</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleLogoChange}
            />
          </div>

          {updateError && (
            <div
              style={{
                marginBottom: 12,
                color: "crimson",
                fontWeight: 900,
                whiteSpace: "pre-wrap",
              }}
            >
              {updateError}
            </div>
          )}

          {updateSuccess && (
            <div
              style={{
                marginBottom: 12,
                color: "seagreen",
                fontWeight: 900,
                whiteSpace: "pre-wrap",
              }}
            >
              {updateSuccess}
            </div>
          )}

          <button
            className="btn btn-success me-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : submitLabel}
          </button>

          <button className="btn btn-secondary" onClick={cancelEdit} disabled={isSubmitting}>
            Annuler
          </button>
        </>
      )}

      {/* Delete confirmation modal */}
      {isDeleteOpen && cabinet && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeDelete}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(560px, 100%)",
              background: "#fff",
              border: "3px solid #0b0b0b",
              boxShadow: "10px 10px 0 #0b0b0b",
              padding: 16,
            }}
          >
            <div style={{ fontWeight: 1000, fontSize: 18 }}>
              Supprimer le cabinet ?
            </div>

            <div style={{ marginTop: 10, fontWeight: 800, opacity: 0.9 }}>
              Cette action est irréversible. Le cabinet sera supprimé
              définitivement.
            </div>

            {deleteError && (
              <div style={{ marginTop: 12, color: "crimson", fontWeight: 900 }}>
                {deleteError}
              </div>
            )}

            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDelete}
              >
                Annuler
              </button>

              <button
                type="button"
                className="btn btn-danger"
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
