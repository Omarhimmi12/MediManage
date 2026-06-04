import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

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
    if (values.length > 0 && values.every((v) => v && typeof v === "object")) return values;
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
      setLoadError(e?.response?.data?.message || "Impossible de charger les secrétaires.");
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
      setDeleteError(e?.response?.data?.message || "Impossible de supprimer.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflowY: "auto",
    padding: "48px 16px 24px",
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header">Secrétaires</div>

      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <div className="fw-bold text-muted">Liste des secrétaires</div>
          <button type="button" className="btn btn-success" onClick={openAdd}>
            + Ajouter
          </button>
        </div>

        {isLoading ? (
          <div className="text-muted mt-3">Chargement...</div>
        ) : loadError ? (
          <div className="alert alert-danger mt-3">{loadError}</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {secretairesSorted.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="fw-bold text-center">
                      Aucune secrétaire enregistrée.
                    </td>
                  </tr>
                ) : (
                  secretairesSorted.map((s) => (
                    <tr key={s.id}>
                      <td>{s?.user?.nom || "-"}</td>
                      <td>{s?.user?.prenom || "-"}</td>
                      <td>{s?.user?.telephone || "-"}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button type="button" className="btn btn-info btn-sm" onClick={() => openView(s)}>
                            Voir
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>
                            Éditer
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => openDelete(s)}>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {isViewOpen && selected && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={closeView}
          style={overlayStyle}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(920px, 100%)",
              maxHeight: "calc(100vh - 96px)",
              overflow: "auto",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <div className="modal-header" style={{ borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
              <h5 className="modal-title" style={{ fontWeight: 700, fontSize: "1.25rem", color: "#1e293b" }}>
                {selected?.user?.nom || "-"} {selected?.user?.prenom || ""}
              </h5>
              <button type="button" className="btn-close" onClick={closeView} aria-label="Fermer" />
            </div>

            <div className="modal-body" style={{ padding: 28 }}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="border rounded p-3 bg-light">
                    <div className="text-muted small fw-semibold text-uppercase mb-1">Téléphone</div>
                    <div className="fw-semibold">{selected?.user?.telephone || "-"}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3 bg-light">
                    <div className="text-muted small fw-semibold text-uppercase mb-1">Email</div>
                    <div className="fw-semibold">{selected?.user?.email || "-"}</div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="border rounded p-3 bg-light">
                    <div className="text-muted small fw-semibold text-uppercase mb-1">Date d'embauche</div>
                    <div className="fw-semibold">{selected?.date_embauche ? String(selected.date_embauche) : "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: "1px solid #e5e7eb", background: "#f8fafc" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  closeView();
                  openEdit(selected);
                }}
              >
                Éditer
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  closeView();
                  openDelete(selected);
                }}
              >
                Supprimer
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={closeView}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div role="dialog" aria-modal="true" tabIndex={-1} onClick={closeForm} style={overlayStyle}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 100%)",
              maxHeight: "calc(100vh - 96px)",
              overflow: "auto",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <div className="modal-header" style={{ borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
              <h5 className="modal-title" style={{ fontWeight: 700, fontSize: "1.25rem", color: "#1e293b" }}>
                {formMode === "add" ? "Ajouter une secrétaire" : "Éditer la secrétaire"}
              </h5>
              <button type="button" className="btn-close" onClick={closeForm} aria-label="Fermer" />
            </div>

            <div className="modal-body" style={{ padding: 28 }}>
              <p className="text-muted small mb-3">
                {formMode === "add"
                  ? "Créer un compte + fiche secrétaire"
                  : "Mettre à jour les informations de la secrétaire"}
              </p>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nom</label>
                  <input
                    value={form.nom}
                    onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                    className="form-control"
                    placeholder="Nom"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Prénom</label>
                  <input
                    value={form.prenom}
                    onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                    className="form-control"
                    placeholder="Prénom"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Téléphone</label>
                  <input
                    value={form.telephone}
                    onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                    className="form-control"
                    placeholder="Téléphone"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="form-control"
                    placeholder="Email"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Date d'embauche</label>
                  <input
                    type="date"
                    value={form.date_embauche}
                    onChange={(e) => setForm((f) => ({ ...f, date_embauche: e.target.value }))}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Mot de passe {formMode === "add" ? "(requis)" : "(optionnel)"}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="form-control"
                    placeholder={
                      formMode === "add"
                        ? "Mot de passe (min 6 caractères)"
                        : "Laisser vide pour ne pas changer"
                    }
                  />
                </div>
              </div>

              {formError && <div className="alert alert-danger mt-3 mb-0">{formError}</div>}
            </div>

            <div className="modal-footer" style={{ borderTop: "1px solid #e5e7eb", background: "#f8fafc" }}>
              <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={formSubmitting}>
                Annuler
              </button>
              <button type="button" className="btn btn-success" onClick={submitForm} disabled={formSubmitting}>
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
        <div role="dialog" aria-modal="true" tabIndex={-1} onClick={closeDelete} style={overlayStyle}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(700px, 100%)",
              maxHeight: "calc(100vh - 96px)",
              overflow: "auto",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <div className="modal-header" style={{ borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
              <h5 className="modal-title" style={{ fontWeight: 700, fontSize: "1.25rem", color: "#1e293b" }}>
                Supprimer la secrétaire ?
              </h5>
              <button type="button" className="btn-close" onClick={closeDelete} aria-label="Fermer" />
            </div>

            <div className="modal-body" style={{ padding: 28 }}>
              <p style={{ marginBottom: 0 }}>
                Êtes-vous sûr de vouloir supprimer définitivement{" "}
                <strong>
                  {deleteTarget?.user?.nom || ""} {deleteTarget?.user?.prenom || ""}
                </strong>{" "}
                ? Cette action est irréversible.
              </p>
              {deleteError && <div className="alert alert-danger mt-3 mb-0">{deleteError}</div>}
            </div>

            <div className="modal-footer" style={{ borderTop: "1px solid #e5e7eb", background: "#f8fafc" }}>
              <button type="button" className="btn btn-secondary" onClick={closeDelete} disabled={deleteSubmitting}>
                Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={deleteSubmitting}>
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

