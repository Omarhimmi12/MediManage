import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import "./secretaires.css";

const initialForm = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  password: "",
  date_embauche: "",
};

const getSecretairesFromApiResponse = (resData) => {
  if (Array.isArray(resData)) return resData;
  if (resData && Array.isArray(resData.data)) return resData.data;
  if (resData && Array.isArray(resData.secretaires)) return resData.secretaires;

  if (resData && typeof resData === "object") {
    const values = Object.values(resData);
    if (values.length > 0 && values.every((v) => v && typeof v === "object"))
      return values;
  }

  return [];
};

const SecretairesPage = () => {
  const [secretaires, setSecretaires] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [selected, setSelected] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchSecretaires = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/secretaires");
      const extracted = getSecretairesFromApiResponse(res.data);
      setSecretaires(extracted);
    } catch (e) {
      setLoadError(
        e?.response?.data?.message || "Impossible de charger les secrétaires."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecretaires();
  }, []);

  const secretairesSorted = useMemo(() => {
    return [...secretaires].sort((a, b) => {
      const an = (a?.user?.nom || "").toLowerCase();
      const bn = (b?.user?.nom || "").toLowerCase();
      return an.localeCompare(bn);
    });
  }, [secretaires]);

  const openView = (secretaire) => {
    setSelected(secretaire);
    setIsViewOpen(true);
  };

  const closeView = () => {
    setIsViewOpen(false);
    setSelected(null);
  };

  const openAdd = () => {
    setFormMode("add");
    setFormError("");
    setFormSubmitting(false);
    setForm(initialForm);
    setIsFormOpen(true);
  };

  const openEdit = (secretaire) => {
    setFormMode("edit");
    setFormError("");
    setFormSubmitting(false);
    setSelected(secretaire);
    setForm({
      nom: secretaire?.user?.nom || "",
      prenom: secretaire?.user?.prenom || "",
      email: secretaire?.user?.email || "",
      telephone: secretaire?.user?.telephone || "",
      password: "",
      date_embauche: secretaire?.date_embauche
        ? String(secretaire.date_embauche).slice(0, 10)
        : "",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormMode("add");
    setFormError("");
    setFormSubmitting(false);
    setSelected(null);
    setForm(initialForm);
  };

  const submitForm = async () => {
    if (formSubmitting) return;

    if (!form.nom.trim() || !form.email.trim()) {
      setFormError("Nom et Email sont requis.");
      return;
    }
    if (formMode === "add" && form.password.trim().length < 6) {
      setFormError("Mot de passe requis (min 6 caractères).");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      if (formMode === "add") {
        await api.post("/secretaires", {
          nom: form.nom,
          prenom: form.prenom || null,
          email: form.email,
          telephone: form.telephone || null,
          password: form.password,
          date_embauche: form.date_embauche || null,
        });
      } else {
        if (!selected?.id) throw new Error("Secrétaire manquant (ID).");

        await api.put(`/secretaires/${selected.id}`, {
          nom: form.nom,
          prenom: form.prenom || null,
          email: form.email,
          telephone: form.telephone || null,
          password: form.password.trim() ? form.password : undefined,
          date_embauche: form.date_embauche || null,
        });
      }

      closeForm();
      fetchSecretaires();
    } catch (e) {
      const msg = e?.response?.data?.message;
      setFormError(msg || "Erreur lors de l'enregistrement.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDelete = (secretaire) => {
    setDeleteTarget(secretaire);
    setDeleteError("");
    setDeleteSubmitting(false);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeleteTarget(null);
    setDeleteError("");
    setDeleteSubmitting(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteSubmitting(true);
    setDeleteError("");

    try {
      await api.delete(`/secretaires/${deleteTarget.id}`);
      closeDelete();
      fetchSecretaires();
      if (selected?.id === deleteTarget.id) closeView();
    } catch (e) {
      setDeleteError(
        e?.response?.data?.message || "Impossible de supprimer."
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="secretaires-container">
      <div className="secretaires-header">
        <div>
          <h1 className="secretaires-title">Secrétaires</h1>
          <p className="secretaires-subtitle">
            {secretaires.length} secrétaire
            {secretaires.length !== 1 ? "s" : ""} enregistrée
            {secretaires.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          className="mmd-btn mmd-btn-primary"
          onClick={openAdd}
        >
          <i className="bi bi-plus-lg"></i>
          Ajouter
        </button>
      </div>

      {isLoading ? (
        <div className="secretaires-loading">
          <div className="mmd-loading">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p>Chargement...</p>
        </div>
      ) : loadError ? (
        <div className="secretaires-alert secretaires-alert--error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {loadError}
        </div>
      ) : (
        <div className="secretaires-table-card">
          {secretairesSorted.length === 0 ? (
            <div className="secretaires-empty">
              <i className="bi bi-people"></i>
              <h3>Aucune secrétaire enregistrée</h3>
              <p>Ajoutez votre première secrétaire.</p>
            </div>
          ) : (
            <table className="mmd-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {secretairesSorted.map((s) => (
                  <tr key={s.id}>
                    <td>{s?.user?.nom || "—"}</td>
                    <td>{s?.user?.prenom || "—"}</td>
                    <td>{s?.user?.telephone || "—"}</td>
                    <td>
                      <div className="secretaires-actions">
                        <button
                          type="button"
                          className="mmd-btn mmd-btn-info mmd-btn-sm"
                          onClick={() => openView(s)}
                        >
                          <i className="bi bi-eye"></i> 
                        </button>
                        <button
                          type="button"
                          className="mmd-btn mmd-btn-sm mmd-btn-secondary"
                          onClick={() => openEdit(s)}
                        >
                          <i className="bi bi-pencil"></i> 
                        </button>
                        <button
                          type="button"
                          className="mmd-btn mmd-btn-sm mmd-btn-danger"
                          onClick={() => openDelete(s)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewOpen && selected && (
        <div
          className="secretaires-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closeView}
        >
          <div className="secretaires-modal" onClick={(e) => e.stopPropagation()}>
            <div className="secretaires-modal-header">
              <h3 className="secretaires-modal-title">
                {selected?.user?.nom || "—"} {selected?.user?.prenom || ""}
              </h3>
              <button
                type="button"
                className="secretaires-modal-close"
                onClick={closeView}
                aria-label="Fermer"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="secretaires-modal-body">
              <div className="secretaires-detail-grid">
                <div className="secretaires-detail-card">
                  <div className="secretaires-detail-label">Téléphone</div>
                  <div className="secretaires-detail-value">
                    {selected?.user?.telephone || "—"}
                  </div>
                </div>
                <div className="secretaires-detail-card">
                  <div className="secretaires-detail-label">Email</div>
                  <div className="secretaires-detail-value">
                    {selected?.user?.email || "—"}
                  </div>
                </div>
                <div className="secretaires-detail-card secretaires-detail-full">
                  <div className="secretaires-detail-label">
                    Date d'embauche
                  </div>
                  <div className="secretaires-detail-value">
                    {selected?.date_embauche
                      ? new Date(selected.date_embauche).toLocaleDateString(
                          "fr-FR"
                        )
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="secretaires-modal-footer">
              <button
                type="button"
                className="mmd-btn mmd-btn-secondary"
                onClick={() => {
                  closeView();
                  openEdit(selected);
                }}
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                type="button"
                className="mmd-btn mmd-btn-danger"
                onClick={() => {
                  closeView();
                  openDelete(selected);
                }}
              >
                <i className="bi bi-trash"></i> 
              </button>
             
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div
          className="secretaires-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closeForm}
        >
          <div className="secretaires-modal" onClick={(e) => e.stopPropagation()}>
            <div className="secretaires-modal-header">
              <h3 className="secretaires-modal-title">
                {formMode === "add"
                  ? "Ajouter une secrétaire"
                  : "Éditer la secrétaire"}
              </h3>
              <button
                type="button"
                className="secretaires-modal-close"
                onClick={closeForm}
                aria-label="Fermer"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="secretaires-modal-body">
              <p className="secretaires-form-hint">
                {formMode === "add"
                  ? "Créer un compte + fiche secrétaire"
                  : "Mettre à jour les informations de la secrétaire"}
              </p>

              <div className="secretaires-form-grid">
                <div className="mmd-form-group">
                  <label className="mmd-label">Nom</label>
                  <input value={form.nom} onChange={(e) =>
                      setForm((f) => ({ ...f, nom: e.target.value }))
                    }
                    className="mmd-input"
                    placeholder="Nom"
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Prénom</label>
                  <input value={form.prenom} onChange={(e) =>
                      setForm((f) => ({ ...f, prenom: e.target.value }))
                    }
                    className="mmd-input"
                    placeholder="Prénom"
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Téléphone</label>
                  <input
                    value={form.telephone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, telephone: e.target.value }))
                    }
                    className="mmd-input"
                    placeholder="Téléphone"
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Email</label>
                  <input type="email" value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="mmd-input" placeholder="Email"
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Date d'embauche</label>
                  <input type="date" value={form.date_embauche}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        date_embauche: e.target.value,
                      }))
                    }
                    className="mmd-input"
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">
                    Mot de passe{" "}
                    {formMode === "add" ? "(requis)" : "(optionnel)"}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="mmd-input"
                    placeholder={
                      formMode === "add"
                        ? "Mot de passe (min 6 caractères)"
                        : "Laisser vide pour ne pas changer"
                    }
                  />
                </div>
              </div>

              {formError && (
                <div className="secretaires-alert secretaires-alert--error" style={{ marginTop: 16 }}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {formError}
                </div>
              )}
            </div>

            <div className="secretaires-modal-footer">
              <button type="button" className="mmd-btn mmd-btn-secondary"
                onClick={closeForm} disabled={formSubmitting}
              >
                Annuler
              </button>
              <button type="button" className="mmd-btn mmd-btn-primary"
                onClick={submitForm} disabled={formSubmitting}
              >
                {formSubmitting
                  ? "Enregistrement..."
                  : formMode === "add"
                  ? "Créer"
                  : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && deleteTarget && (
        <div className="secretaires-modal-overlay"
          role="dialog" aria-modal="true" onClick={closeDelete}
        >
          <div className="secretaires-modal" onClick={(e) => e.stopPropagation()}>
            <div className="secretaires-modal-header">
              <h3 className="secretaires-modal-title">
                Supprimer la secrétaire ?
              </h3>
              <button type="button" className="secretaires-modal-close"
                onClick={closeDelete} aria-label="Fermer"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="secretaires-modal-body">
              <p>Êtes-vous sûr de vouloir supprimer définitivement{" "}
                <strong>
                  {deleteTarget?.user?.nom || ""}{" "}
                  {deleteTarget?.user?.prenom || ""}
                </strong>{" "}
                ? Cette action est irréversible.
              </p>
              {deleteError && (
                <div className="secretaires-alert secretaires-alert--error" style={{ marginTop: 16 }}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {deleteError}
                </div>
              )}
            </div>

            <div className="secretaires-modal-footer">
              <button type="button" className="mmd-btn mmd-btn-secondary"
                onClick={closeDelete} disabled={deleteSubmitting}
              >
                Annuler
              </button>
              <button type="button" className="mmd-btn mmd-btn-danger"
                onClick={confirmDelete} disabled={deleteSubmitting}
              >
                {deleteSubmitting ? "Suppression..." : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretairesPage;
