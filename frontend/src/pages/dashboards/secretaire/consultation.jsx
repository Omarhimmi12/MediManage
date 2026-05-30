import { useContext, useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";

const PAGE_SIZE = 5;

const SecretaireConsultationPage = () => {
  const { user } = useContext(AuthContext);

  const [rdvList, setRdvList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [viewModal, setViewModal] = useState(false);
  const [viewConsultation, setViewConsultation] = useState(null);

  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    rendez_vous_id: "",
    montant: "",
    mode_paiement: "espece",
    statut_paiement: "payé",
  });

  const [editModal, setEditModal] = useState(false);
  const [editConsultationId, setEditConsultationId] = useState(null);
  const [editForm, setEditForm] = useState({
    montant: "",
    mode_paiement: "espece",
    statut_paiement: "en_attente",
  });

  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmConsultationId, setConfirmConsultationId] = useState(null);

  const rdvCandidates = useMemo(() => {
    // RDVs confirmed by secrétaire but without consultation yet
    return rdvList.filter((r) => r.statut === "confirme" && !r.consultation);
  }, [rdvList]);

  const fetchRdv = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.get("/rendez-vous");
      setRdvList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRdv();
  }, []);


  useEffect(() => {
    setPage(1);
  }, [query]);

  // Build both "pending" (confirmed RDV without consultation) and "existing" consultations
  const items = useMemo(() => {
    const visible = rdvList.filter(
      (r) => r.statut === "confirme" || r.statut === "termine"
    );

    return visible
      .map((r) => {
        const hasConsultation = Boolean(r.consultation?.id);

        return {
          kind: hasConsultation ? "existing" : "pending",
          rdvId: r.id,
          consultationId: hasConsultation ? r.consultation.id : null,

          patient: r.patient?.user,
          date: r.date_rdv,
          motif: r.motif,

          // medecin/consultation fields
          diagnostic: r.consultation?.diagnostic ?? "",
          ordonnance: r.consultation?.ordonnance ?? null,
          tarif: r.consultation?.montant ?? "",
          statutPaiement: r.consultation?.statut_paiement ?? "en_attente",
          modePaiement: r.consultation?.mode_paiement ?? null,
        };
      })
      .filter(Boolean);
  }, [rdvList]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((c) => {
      const nom = c.patient?.nom ?? "";
      const prenom = c.patient?.prenom ?? "";
      return `${nom} ${prenom}`.toLowerCase().includes(q);
    });
  }, [items, query]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  }, [filteredItems.length]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const openView = (consultationId) => {
    const target = items.find((it) => it.consultationId === consultationId);
    if (!target) return;

    setViewConsultation(target);
    setViewModal(true);
  };

  const openCreate = (rdvId) => {
    setErrorMsg("");
    setSuccessMsg("");

    setCreateForm({
      rendez_vous_id: rdvId ? String(rdvId) : "",
      montant: "",
      mode_paiement: "espece",
      statut_paiement: "payé",
    });
    setCreateModal(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await api.post("/consultations", {
        rendez_vous_id: Number(createForm.rendez_vous_id),
        diagnostic: null, // secretaire ne renseigne pas diagnostic
        ordonnance: null,
        montant: createForm.montant ? Number(createForm.montant) : null,
        mode_paiement: createForm.mode_paiement,
        statut_paiement: createForm.statut_paiement,
      });

      setSuccessMsg("Consultation créée avec succès.");
      setCreateModal(false);
      await fetchRdv();
      setPage(1);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Erreur lors de la création");
    }
  };

  const askDelete = (consultationId) => {
    setConfirmConsultationId(consultationId);
    setConfirmModal(true);
  };

  const openEdit = (consultationId) => {
    const target = items.find((it) => it.consultationId === consultationId);
    if (!target) return;

    setErrorMsg("");
    setSuccessMsg("");

    setEditConsultationId(consultationId);
    const normalizeStatutPaiement = (value) => {
      const v = String(value ?? "").trim().toLowerCase();
      if (v === "paye" || v === "payé") return "payé";
      if (v === "non_paye" || v === "non_payé") return "non_payé";
      if (!v) return "en_attente";
      return value;
    };

    const normalizeModePaiement = (value) => {
      const v = String(value ?? "").trim().toLowerCase();
      if (!v) return "espece";
      if (v === "espece" || v === "espèce" || v === "espèces") return "espece";
      if (v === "carte_bancaire" || v === "carte bancaire" || v === "carte bancaires") return "carte_bancaire";
      if (v === "cheque" || v === "chèque" || v === "chèques") return "cheque";
      return value;
    };

    setEditForm({
      montant: target.tarif === "" || target.tarif == null ? "" : String(target.tarif),
      mode_paiement: normalizeModePaiement(target.modePaiement) ?? "espece",
      statut_paiement: normalizeStatutPaiement(target.statutPaiement) ?? "en_attente",
    });
    setEditModal(true);
  };

  const updateStatutPaiement = async (consultationId) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");

      await api.put(`/consultations/${consultationId}/paiement/toggle`);

      setSuccessMsg("Statut paiement mis à jour.");
      await fetchRdv();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editConsultationId) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");

      const existingDiagnostic =
        items.find((it) => it.consultationId === editConsultationId)?.diagnostic ?? "";

      const payload = {
        diagnostic: existingDiagnostic.trim() ? existingDiagnostic : "N/A",
        ordonnance: null,
        montant: editForm.montant !== "" ? Number(editForm.montant) : 0,
        mode_paiement: editForm.mode_paiement,
        statut_paiement: editForm.statut_paiement,
      };

      await api.put(`/consultations/${editConsultationId}`, payload);

      setSuccessMsg("Consultation mise à jour.");
      setEditModal(false);
      setEditConsultationId(null);
      await fetchRdv();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const deleteConsultation = async () => {
    if (!confirmConsultationId) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.delete(`/consultations/${confirmConsultationId}`);

      setSuccessMsg("Consultation supprimée.");
      setConfirmModal(false);
      setConfirmConsultationId(null);
      setViewModal(false);
      setViewConsultation(null);

      await fetchRdv();
      setPage(1);
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-0">
      <style>{`
        .statut-paiement-select{
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: none !important;
          padding-right: 0.75rem;
        }
      `}</style>
      <div className="shadow-sm p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Consultations</h5>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ pointerEvents: "auto", position: "relative", zIndex: 1 }}
            onClick={() => {
              const firstPendingRdv = rdvCandidates[0];
              if (!firstPendingRdv) {
                setErrorMsg("Aucun RDV confirmé sans consultation trouvée.");
                setSuccessMsg("");
                return;
              }
              openCreate(firstPendingRdv.id);
            }}
            title="Ajouter consultation (sur un RDV confirmé sans consultation)"
          >
            Ajouter consultation
          </button>
        </div>
      </div>

      {errorMsg ? <div className="alert alert-danger">{errorMsg}</div> : null}
      {successMsg ? <div className="alert alert-success">{successMsg}</div> : null}

      <div className="mb-3">
        <input
          className="form-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un patient..."
        />
      </div>

      <div className="card">
        <div className="card-body p-0">
          {paginatedItems.length === 0 ? (
            <div className="p-4 text-center">Aucun rendez-vous trouvé.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Motif</th>
                    <th>Statut paiement</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedItems.map((c) => (
                    <tr key={c.rdvId}>
                      <td>
                        {c.patient?.nom} {c.patient?.prenom}
                      </td>
                      <td>{c.date}</td>
                      <td>{c.motif}</td>
                      <td>
                        {c.kind === "existing" ? (
                          <span>{c.statutPaiement ?? "en_attente"}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {c.kind === "pending" ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => openCreate(c.rdvId)}
                            >
                              Créer
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => openView(c.consultationId)}
                              >
                                View
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEdit(c.consultationId)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => askDelete(c.consultationId)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-top py-3">
            <div className="d-flex justify-content-center align-items-center gap-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Précédent
              </button>

              <div className="fw-semibold">
                Page {page} / {pageCount}
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create modal (secretaire cannot set ordonnance) */}
      {createModal ? (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Créer consultation</span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setCreateModal(false)}
            >
              Fermer
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={submitCreate}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">RDV</label>
                  <select
                    className="form-select"
                    value={createForm.rendez_vous_id}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        rendez_vous_id: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {rdvCandidates.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.patient?.user?.nom} {r.patient?.user?.prenom} - {r.date_rdv} ({r.motif})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Statut paiement</label>
                  <select
                    className="form-select"
                    value={createForm.statut_paiement}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        statut_paiement: e.target.value,
                      }))
                    }
                  >
                    <option value="en_attente">En attente</option>
                    <option value="payé">Payé</option>
                    <option value="non_payé">Non payé</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Montant (DH)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={createForm.montant}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, montant: e.target.value }))
                    }
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Mode paiement</label>
                  <select
                    className="form-select"
                    value={createForm.mode_paiement}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, mode_paiement: e.target.value }))
                    }
                  >
                    <option value="espece">Espèces</option>
                    <option value="carte_bancaire">Carte Bancaire</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </div>

                <div className="col-12 col-md-6 d-flex align-items-end justify-content-end">
                  <button type="submit" className="btn btn-success w-100">
                    Effectuer consultation
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* View modal */}
      {viewModal && viewConsultation ? (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Consultation details</span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setViewModal(false);
                setViewConsultation(null);
              }}
            >
              Fermer
            </button>
          </div>

          <div className="card-body">
            <div className="mb-2">
              <strong>Patient:</strong>{" "}
              {viewConsultation.patient?.nom} {viewConsultation.patient?.prenom}
            </div>
            <div className="mb-2">
              <strong>Date:</strong> {viewConsultation.date}
            </div>
            <div className="mb-2">
              <strong>Motif:</strong> {viewConsultation.motif}
            </div>

            <hr />

            <div className="mb-2">
              <strong>Diagnostic:</strong> {viewConsultation.diagnostic || "—"}
            </div>
            <div className="mb-2">
              <strong>Ordonnance:</strong>{" "}
              {viewConsultation.ordonnance ? viewConsultation.ordonnance : "—"}
            </div>
            <div className="mb-2">
              <strong>Montant:</strong>{" "}
              {viewConsultation.tarif ? `${viewConsultation.tarif} DH` : "—"}
            </div>
            <div className="mb-2">
              <strong>Mode paiement:</strong> {viewConsultation.modePaiement || "—"}
            </div>
            <div className="mb-2">
              <strong>Statut paiement:</strong>{" "}
              {viewConsultation.statutPaiement ?? "en_attente"}
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit modal */}
      {editModal && editConsultationId ? (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Modifier consultation</span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setEditModal(false);
                setEditConsultationId(null);
              }}
            >
              Fermer
            </button>
          </div>

          <div className="card-body">
            {errorMsg ? <div className="alert alert-danger mb-3">{errorMsg}</div> : null}

            <form onSubmit={submitEdit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Montant (DH)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.montant}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, montant: e.target.value }))
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Mode paiement</label>
                  <select
                    className="form-select"
                    value={editForm.mode_paiement}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, mode_paiement: e.target.value }))
                    }
                  >
                    <option value="espece">Espèces</option>
                    <option value="carte_bancaire">Carte Bancaire</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Statut paiement</label>
                  <select
                    className="form-select"
                    value={editForm.statut_paiement}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, statut_paiement: e.target.value }))
                    }
                  >
                    <option value="en_attente">En attente</option>
                    <option value="payé">Payé</option>
                    <option value="non_payé">Non payé</option>
                  </select>
                </div>

                <div className="col-12 col-md-6 d-flex align-items-end justify-content-end">
                  <button type="submit" className="btn btn-success w-100">
                    Enregistrer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete confirm modal */}
      {confirmModal ? (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Confirmation</span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setConfirmModal(false);
                setConfirmConsultationId(null);
              }}
            >
              Fermer
            </button>
          </div>

          <div className="card-body">
            <div className="mb-3">Supprimer cette consultation ?</div>

            <div className="d-flex gap-2">
              <button type="button" className="btn btn-danger" onClick={deleteConsultation}>
                Supprimer
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setConfirmModal(false);
                  setConfirmConsultationId(null);
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ height: 120 }} />
    </div>
  );
};

export default SecretaireConsultationPage;
