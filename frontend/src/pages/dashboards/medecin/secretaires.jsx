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
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

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
      setFormError(msg || "Erreur lors de l’enregistrement.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const onDelete = async (secretaire) => {
    const ok = window.confirm(
      `Supprimer ${secretaire?.user?.nom || ""} ${secretaire?.user?.prenom || ""} ?`
    );
    if (!ok) return;

    try {
      await api.delete(`/secretaires/${secretaire.id}`);
      fetchSecretaires();
      if (selected?.id === secretaire.id) closeView();
    } catch (e) {
      alert(e?.response?.data?.message || "Impossible de supprimer.");
    }
  };

  return (
    <div className="card">
      <div className="card-header">Secrétaires</div>

      <div className="card-body">
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ gap: 12, flexWrap: "wrap" }}
        >
          <div style={{ fontWeight: 800 }}>Liste des secrétaires</div>

          <button
            type="button"
            className="btn btn-success"
            onClick={openAdd}
          >
            + Ajouter
          </button>
        </div>

        {isLoading ? (
          <div style={{ marginTop: 16 }}>Chargement...</div>
        ) : loadError ? (
          <div
            style={{
              marginTop: 16,
              color: "crimson",
              fontWeight: 800,
            }}
          >
            {loadError}
          </div>
        ) : (
          <div style={{ marginTop: 16, overflowX: "auto" }}>
            <table className="table" style={{ marginBottom: 0 }}>
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
                    <td colSpan={4} style={{ fontWeight: 800 }}>
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
                        <div className="d-flex" style={{ gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openView(s)}
                          >
                            Voir
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openEdit(s)}
                          >
                            Éditer
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onDelete(s)}
                          >
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
          onClick={closeView}
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
            className="modal-content"
            style={{
              width: "min(720px, 100%)",
              background: "#fff",
              padding: 16,
            }}
          >
            <div className="modal-header" style={{ display: "flex", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 1000, fontSize: 20, lineHeight: 1.1 }}>
                  {selected?.user?.nom || "-"} {selected?.user?.prenom || ""}
                </div>
                <div style={{ fontWeight: 800, opacity: 0.9, marginTop: 6 }}>
                  Secrétaire
                </div>
              </div>

              <button type="button" className="btn btn-outline-secondary" onClick={closeView}>
                Fermer
              </button>
            </div>

            <div className="modal-body" style={{ marginTop: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div className="border rounded p-3" style={{ background: "#f8f8f8" }}>
                  <div style={{ opacity: 0.8 }}>Téléphone</div>
                  <div style={{ marginTop: 6 }}>{selected?.user?.telephone || "-"}</div>
                </div>

                <div className="border rounded p-3" style={{ background: "#f8f8f8" }}>
                  <div style={{ opacity: 0.8 }}>Email</div>
                  <div style={{ marginTop: 6 }}>{selected?.user?.email || "-"}</div>
                </div>

                <div
                  className="border rounded p-3"
                  style={{
                    background: "#f8f8f8",
                    gridColumn: "1 / -1",
                  }}
                >
                  <div style={{ opacity: 0.8 }}>Date d’embauche</div>
                  <div style={{ marginTop: 6 }}>
                    {selected?.date_embauche ? String(selected.date_embauche) : "-"}
                  </div>
                </div>
              </div>

              <div
                className="d-flex justify-content-end gap-2 flex-wrap"
                style={{ marginTop: 14 }}
              >
                <button type="button" className="btn btn-outline-secondary" onClick={() => openEdit(selected)}>
                  Éditer
                </button>

                <button type="button" className="btn btn-outline-danger" onClick={() => onDelete(selected)}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeForm}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 10000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-content"
            style={{
              width: "min(760px, 100%)",
              background: "#fff",
              padding: 16,
            }}
          >
            <div className="modal-header" style={{ display: "flex", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 1000, fontSize: 20, lineHeight: 1.1 }}>
                  {formMode === "add"
                    ? "Ajouter une secrétaire"
                    : "Éditer la secrétaire"}
                </div>
                <div style={{ fontWeight: 800, opacity: 0.9, marginTop: 6 }}>
                  {formMode === "add"
                    ? "Créer un compte + fiche"
                    : "Mettre à jour les informations"}
                </div>
              </div>

              <button type="button" className="btn btn-outline-secondary" onClick={closeForm}>
                Fermer
              </button>
            </div>

            <div className="modal-body" style={{ marginTop: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>Nom</label>
                  <input
                    value={form.nom}
                    onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                    className="form-control"
                    placeholder="Nom"
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Prénom</label>
                  <input
                    value={form.prenom}
                    onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                    className="form-control"
                    placeholder="Prénom"
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Téléphone</label>
                  <input
                    value={form.telephone}
                    onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                    className="form-control"
                    placeholder="Téléphone"
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="form-control"
                    placeholder="Email"
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>Date d’embauche</label>
                  <input
                    type="date"
                    value={form.date_embauche}
                    onChange={(e) => setForm((f) => ({ ...f, date_embauche: e.target.value }))}
                    className="form-control"
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>
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

              {formError && (
                <div style={{ marginTop: 12, color: "crimson", fontWeight: 900 }}>
                  {formError}
                </div>
              )}

              <div
                className="modal-footer"
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeForm}
                  disabled={formSubmitting}
                  style={{ opacity: formSubmitting ? 0.6 : 1 }}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={submitForm}
                  disabled={formSubmitting}
                  style={{ opacity: formSubmitting ? 0.7 : 1 }}
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
        </div>
      )}
    </div>
  );
};

export default SecretairesPage;
