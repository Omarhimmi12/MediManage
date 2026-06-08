import { useContext, useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";
import "./consultation.css";

const PAGE_SIZE = 8;

const SecretaireConsultationPage = () => {
  const { user } = useContext(AuthContext);

  const [rdvList, setRdvList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [page, setPage] = useState(1);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // View modal
  const [viewModal, setViewModal] = useState(false);
  const [viewConsultation, setViewConsultation] = useState(null);

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    rendez_vous_id: "",
    montant: "",
    mode_paiement: "espece",
    statut_paiement: "payé",
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editConsultationId, setEditConsultationId] = useState(null);
  const [editForm, setEditForm] = useState({
    montant: "",
    mode_paiement: "espece",
    statut_paiement: "en_attente",
  });
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmConsultationId, setConfirmConsultationId] = useState(null);

  const rdvCandidates = useMemo(() => {
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
  }, [query, statutFilter]);

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
    const sf = statutFilter.trim().toLowerCase();

    let result = items;

    if (q) {
      result = result.filter((c) => {
        const nom = c.patient?.nom ?? "";
        const prenom = c.patient?.prenom ?? "";
        return `${nom} ${prenom}`.toLowerCase().includes(q);
      });
    }

    if (sf) {
      result = result.filter((c) => {
        if (c.kind !== "existing") return false;
        const normalized = String(c.statutPaiement ?? "").trim().toLowerCase();
        if (sf === "payé" || sf === "paye") return normalized === "payé" || normalized === "paye";
        if (sf === "en_attente") return normalized === "en_attente";
        if (sf === "non_payé" || sf === "non_paye") return normalized === "non_payé" || normalized === "non_paye";
        return true;
      });
    }

    return result;
  }, [items, query, statutFilter]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  }, [filteredItems.length]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const getStatusBadge = (statut) => {
    const map = {
      payé: { label: "Payé", class: "mmd-badge-success" },
      en_attente: { label: "En attente", class: "mmd-badge-warning" },
      non_payé: { label: "Non payé", class: "mmd-badge-danger" },
    };
    return map[statut] || { label: statut, class: "" };
  };

  const getModeLabel = (mode) => {
    const map = {
      espece: "Espèces",
      carte_bancaire: "Carte bancaire",
      cheque: "Chèque",
    };
    return map[mode] || mode || "—";
  };

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
    setCreateSubmitting(true);
    try {
      await api.post("/consultations", {
        rendez_vous_id: Number(createForm.rendez_vous_id),
        diagnostic: null,
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
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = (consultationId) => {
    const target = items.find((it) => it.consultationId === consultationId);
    if (!target) return;
    setErrorMsg("");
    setSuccessMsg("");

    const normalizeStatut = (value) => {
      const v = String(value ?? "").trim().toLowerCase();
      if (v === "paye" || v === "payé") return "payé";
      if (v === "non_paye" || v === "non_payé") return "non_payé";
      return "en_attente";
    };

    const normalizeMode = (value) => {
      const v = String(value ?? "").trim().toLowerCase();
      if (v === "espece" || v === "espèce" || v === "espèces") return "espece";
      if (v === "carte_bancaire" || v === "carte bancaire") return "carte_bancaire";
      if (v === "cheque" || v === "chèque" || v === "chèques") return "cheque";
      return "espece";
    };

    setEditConsultationId(consultationId);
    setEditForm({
      montant: target.tarif === "" || target.tarif == null ? "" : String(target.tarif),
      mode_paiement: normalizeMode(target.modePaiement),
      statut_paiement: normalizeStatut(target.statutPaiement),
    });
    setEditModal(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editConsultationId) return;
    setErrorMsg("");
    setSuccessMsg("");
    setEditSaving(true);
    try {
      const existingDiagnostic =
        items.find((it) => it.consultationId === editConsultationId)?.diagnostic ?? "";
      await api.put(`/consultations/${editConsultationId}`, {
        diagnostic: existingDiagnostic.trim() ? existingDiagnostic : "N/A",
        ordonnance: null,
        montant: editForm.montant !== "" ? Number(editForm.montant) : 0,
        mode_paiement: editForm.mode_paiement,
        statut_paiement: editForm.statut_paiement,
      });
      setSuccessMsg("Consultation mise à jour.");
      setEditModal(false);
      setEditConsultationId(null);
      await fetchRdv();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setEditSaving(false);
    }
  };

  const askDelete = (consultationId) => {
    setConfirmConsultationId(consultationId);
    setConfirmModal(true);
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

  if (loading) {
    return (
      <div className="consultation-container">
        <div className="rdv-loading">
          <div>
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p>Chargement des consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-container">
      <div className="consultation-header">
        <div>
          <h1 className="consultation-title">Consultations</h1>
          <p className="consultation-subtitle">
            {filteredItems.length} consultation{filteredItems.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="mmd-btn mmd-btn-primary"
          onClick={() => {
            const firstPendingRdv = rdvCandidates[0];
            if (!firstPendingRdv) {
              setErrorMsg("Aucun RDV confirmé sans consultation trouvé.");
              setSuccessMsg("");
              return;
            }
            openCreate(firstPendingRdv.id);
          }}
        >
          <i className="bi bi-plus-lg"></i>
          Ajouter consultation
        </button>
      </div>

      {errorMsg && (
        <div className="consultation-alert consultation-alert--error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="consultation-alert consultation-alert--success">
          <i className="bi bi-check-circle-fill"></i>
          <span>{successMsg}</span>
        </div>
      )}

      <div className="consultation-filters">
        <div className="consultation-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="mmd-select mmd-select-filter"
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="payé">Payé</option>
          <option value="en_attente">En attente</option>
          <option value="non_payé">Non payé</option>
        </select>
      </div>

      {/* Table */}
      <div className="consultation-table-card">
        {paginatedItems.length === 0 ? (
          <div className="consultation-empty">Aucune consultation trouvée.</div>
        ) : (
          <>
            <table className="mmd-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Motif</th>
                  <th>Statut paiement</th>
                  <th>Actions</th>
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
                        <span className={`mmd-badge ${getStatusBadge(c.statutPaiement).class}`}>
                          {getStatusBadge(c.statutPaiement).label}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        {c.kind === "pending" ? (
                          <button
                            className="mmd-btn mmd-btn-primary mmd-btn-sm"
                            onClick={() => openCreate(c.rdvId)}
                          >
                            <i className="bi bi-plus-lg"></i> Créer
                          </button>
                        ) : (
                          <>
                            <button
                              className="mmd-btn mmd-btn-secondary mmd-btn-sm"
                              onClick={() => openView(c.consultationId)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="mmd-btn mmd-btn-info mmd-btn-sm"
                              onClick={() => openEdit(c.consultationId)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="mmd-btn mmd-btn-danger mmd-btn-sm"
                              onClick={() => askDelete(c.consultationId)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pageCount > 1 && (
              <div className="consultation-pagination">
                <button
                  className="mmd-btn mmd-btn-secondary mmd-btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <i className="bi bi-chevron-left"></i> Précédent
                </button>
                <span className="consultation-pagination-info">
                  Page {page} / {pageCount}
                </span>
                <button
                  className="mmd-btn mmd-btn-secondary mmd-btn-sm"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page >= pageCount}
                >
                  Suivant <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create modal */}
      {createModal && (
        <div className="consultation-modal-card">
          <div className="consultation-modal-header">
            <h3 className="consultation-modal-title">Créer une consultation</h3>
            <button
              className="consultation-modal-close"
              onClick={() => setCreateModal(false)}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>

          <div className="consultation-modal-body">
            <form onSubmit={submitCreate}>
              <div className="consultation-form-row">
                <div className="mmd-form-group">
                  <label className="mmd-label">RDV</label>
                  <select
                    className="mmd-select"
                    value={createForm.rendez_vous_id}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, rendez_vous_id: e.target.value }))
                    }
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {rdvCandidates.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.patient?.user?.nom} {r.patient?.user?.prenom} — {r.date_rdv} ({r.motif})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Montant (DH)</label>
                  <input
                    type="number"
                    className="mmd-input"
                    value={createForm.montant}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, montant: e.target.value }))
                    }
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Mode paiement</label>
                  <select
                    className="mmd-select"
                    value={createForm.mode_paiement}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, mode_paiement: e.target.value }))
                    }
                  >
                    <option value="espece">Espèces</option>
                    <option value="carte_bancaire">Carte bancaire</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Statut paiement</label>
                  <select
                    className="mmd-select"
                    value={createForm.statut_paiement}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, statut_paiement: e.target.value }))
                    }
                  >
                    <option value="payé">Payé</option>
                    <option value="en_attente">En attente</option>
                    <option value="non_payé">Non payé</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div className="consultation-modal-footer">
            <button
              type="button"
              className="mmd-btn mmd-btn-secondary"
              onClick={() => setCreateModal(false)}
              disabled={createSubmitting}
            >
              Annuler
            </button>
            <button
              type="button"
              className="mmd-btn mmd-btn-primary"
              onClick={submitCreate}
              disabled={createSubmitting}
            >
              {createSubmitting ? "Création..." : "Créer la consultation"}
            </button>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewModal && viewConsultation && (
        <div className="consultation-modal-card">
          <div className="consultation-modal-header">
            <h3 className="consultation-modal-title">Détails de la consultation</h3>
            <button
              className="consultation-modal-close"
              onClick={() => {
                setViewModal(false);
                setViewConsultation(null);
              }}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>

          <div className="consultation-modal-body">
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Patient</span>
              <span className="consultation-detail-value">
                {viewConsultation.patient?.nom} {viewConsultation.patient?.prenom}
              </span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Date</span>
              <span className="consultation-detail-value">{viewConsultation.date}</span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Motif</span>
              <span className="consultation-detail-value">{viewConsultation.motif}</span>
            </div>

            <div className="consultation-detail-divider" />

            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Diagnostic</span>
              <span className="consultation-detail-value">
                {viewConsultation.diagnostic || "—"}
              </span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Ordonnance</span>
              <span className="consultation-detail-value">
                {viewConsultation.ordonnance || "—"}
              </span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Montant</span>
              <span className="consultation-detail-value">
                {viewConsultation.tarif ? `${viewConsultation.tarif} DH` : "—"}
              </span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Mode paiement</span>
              <span className="consultation-detail-value">
                {getModeLabel(viewConsultation.modePaiement)}
              </span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Statut paiement</span>
              <span className="consultation-detail-value">
                <span className={`mmd-badge ${getStatusBadge(viewConsultation.statutPaiement).class}`}>
                  {getStatusBadge(viewConsultation.statutPaiement).label}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModal && editConsultationId && (
        <div className="consultation-modal-card">
          <div className="consultation-modal-header">
            <h3 className="consultation-modal-title">Modifier la consultation</h3>
            <button
              className="consultation-modal-close"
              onClick={() => {
                setEditModal(false);
                setEditConsultationId(null);
              }}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>

          <div className="consultation-modal-body">
            <form onSubmit={submitEdit}>
              <div className="consultation-form-row">
                <div className="mmd-form-group">
                  <label className="mmd-label">Montant (DH)</label>
                  <input
                    type="number"
                    className="mmd-input"
                    value={editForm.montant}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, montant: e.target.value }))
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Mode paiement</label>
                  <select
                    className="mmd-select"
                    value={editForm.mode_paiement}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, mode_paiement: e.target.value }))
                    }
                  >
                    <option value="espece">Espèces</option>
                    <option value="carte_bancaire">Carte bancaire</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Statut paiement</label>
                  <select
                    className="mmd-select"
                    value={editForm.statut_paiement}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, statut_paiement: e.target.value }))
                    }
                  >
                    <option value="payé">Payé</option>
                    <option value="en_attente">En attente</option>
                    <option value="non_payé">Non payé</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div className="consultation-modal-footer">
            <button
              type="button"
              className="mmd-btn mmd-btn-secondary"
              onClick={() => {
                setEditModal(false);
                setEditConsultationId(null);
              }}
              disabled={editSaving}
            >
              Annuler
            </button>
            <button
              type="button"
              className="mmd-btn mmd-btn-primary"
              onClick={submitEdit}
              disabled={editSaving}
            >
              {editSaving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmModal && (
        <div className="mmd-modal-overlay" onClick={() => setConfirmModal(false)}>
          <div className="mmd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mmd-modal-header">
              <h3 className="mmd-modal-title">Confirmer la suppression</h3>
              <button
                className="mmd-modal-close"
                onClick={() => setConfirmModal(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="mmd-modal-body">
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action est irréversible.
              </p>
            </div>
            <div className="mmd-modal-footer">
              <button
                className="mmd-btn mmd-btn-secondary"
                onClick={() => setConfirmModal(false)}
              >
                Annuler
              </button>
              <button
                className="mmd-btn mmd-btn-danger"
                onClick={deleteConsultation}
              >
                <i className="bi bi-trash"></i> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaireConsultationPage;
