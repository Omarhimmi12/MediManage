import { useContext, useEffect, useMemo, useState } from "react";
import ConfirmModal from "../../../components/ConfirmModal";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";
import "./consultation.css";

const PAGE_SIZE = 5;

const MedecinConsultationPage = () => {
  const { user } = useContext(AuthContext);

  const [rdvList, setRdvList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    rendez_vous_id: "",
    consultation_id: "",
    diagnostic: "",
    ordonnance: "",
  });

  const [viewModal, setViewModal] = useState(false);
  const [viewConsultation, setViewConsultation] = useState(null);
  const [confirmDeleteCons, setConfirmDeleteCons] = useState(null);

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

    const onFocus = () => {
      fetchRdv();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const items = useMemo(() => {
    const visible = rdvList.filter(
      (r) => r.statut === "confirme" || r.statut === "termine"
    );

    return visible
      .map((r) => {
        const consultation = r.consultation ?? null;
        const hasConsultation = Boolean(consultation?.id);

        const diagnostic = consultation?.diagnostic ?? "";
        const ordonnance = consultation?.ordonnance ?? null;

        const isShellPending = hasConsultation && !String(diagnostic).trim();

        return {
          kind: isShellPending
            ? "pending"
            : hasConsultation
            ? "existing"
            : "pending",
          rdvId: r.id,
          consultationId: hasConsultation ? consultation.id : null,
          patient: r.patient?.user,
          date: r.date_rdv,
          motif: r.motif,

          diagnostic,
          ordonnance: ordonnance ?? "",
          montant: consultation?.montant ?? "",
          statutPaiement: consultation?.statut_paiement ?? null,
          modePaiement: consultation?.mode_paiement ?? null,
        };
      })
      .filter(Boolean);
  }, [rdvList]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((it) => {
      const nom = it.patient?.nom ?? "";
      const prenom = it.patient?.prenom ?? "";
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

  const openCreate = (rdvId, consultationId) => {
    setErrorMsg("");
    setSuccessMsg("");

    setCreateForm({
      rendez_vous_id: String(rdvId),
      consultation_id: consultationId ? String(consultationId) : "",
      diagnostic: "",
      ordonnance: "",
    });
    setCreateModal(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (createForm.consultation_id) {
        await api.put(`/consultations/${createForm.consultation_id}`, {
          diagnostic: createForm.diagnostic,
          ordonnance: createForm.ordonnance || null,
        });

        setSuccessMsg("Consultation finalisée avec succès.");
      } else {
        await api.post("/consultations", {
          rendez_vous_id: Number(createForm.rendez_vous_id),
          diagnostic: createForm.diagnostic,
          ordonnance: createForm.ordonnance || null,
        });

        setSuccessMsg("Consultation créée avec succès.");
      }

      setCreateModal(false);
      await fetchRdv();
      setPage(1);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || "Erreur lors de la création"
      );
    }
  };

  const openView = (consultationId) => {
    const target = items.find((it) => it.consultationId === consultationId);
    if (!target) return;

    setViewConsultation(target);
    setViewModal(true);
  };

  const deleteConsultation = async (consultationId) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.delete(`/consultations/${consultationId}`);
      setSuccessMsg("Consultation supprimée.");
      setViewModal(false);
      setConfirmDeleteCons(null);
      await fetchRdv();
      setPage(1);
    } catch (err) {
      setConfirmDeleteCons(null);
      setErrorMsg(
        err?.response?.data?.message || "Erreur lors de la suppression"
      );
    }
  };

  const viewClose = () => {
    setViewModal(false);
    setViewConsultation(null);
  };

  if (loading) {
    return (
      <div className="consultation-container">
        <div className="patients-loading">
          <div className="mmd-loading">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p>Chargement des consultations...</p>
        </div>
      </div>
    );
  }

  const pendingCount = items.filter((it) => it.kind === "pending").length;

  return (
    <div className="consultation-container">
      <div className="consultation-header">
        <div>
          <h1 className="consultation-title">Consultations</h1>
          <p className="consultation-subtitle">
            {items.length} consultation{items.length !== 1 ? "s" : ""} ·{" "}
            {pendingCount} en attente
          </p>
        </div>

        <button
          type="button"
          className="mmd-btn mmd-btn-primary"
          onClick={() => {
            const firstPending = items.find((it) => it.kind === "pending");
            if (firstPending) openCreate(firstPending.rdvId);
          }}
          disabled={pendingCount === 0}
        >
          <i className="bi bi-plus-lg"></i>
          Ajouter consultation
        </button>
      </div>

      {errorMsg && (
        <div className="consultation-alert consultation-alert--error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="consultation-alert consultation-alert--success">
          <i className="bi bi-check-circle-fill"></i>
          {successMsg}
        </div>
      )}

      <div className="consultation-filters">
        <div className="consultation-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un patient..."
          />
        </div>
      </div>

      <div className="consultation-table-card">
        {paginatedItems.length === 0 ? (
          <div className="consultation-empty">
            <i
              className="bi bi-inbox"
              style={{ fontSize: 48, display: "block", marginBottom: 12, color: "var(--text-tertiary)" }}
            ></i>
            Aucun rendez-vous trouvé.
          </div>
        ) : (
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
              {paginatedItems.map((it) => (
                <tr key={it.rdvId}>
                  <td>
                    {it.patient?.nom} {it.patient?.prenom}
                  </td>
                  <td>
                    {new Date(it.date).toLocaleDateString("fr-FR")}
                  </td>
                  <td>{it.motif}</td>
                  <td>
                    {it.kind === "existing" ? (
                      <span
                        className={`mmd-badge ${
                          it.statutPaiement === "paye"
                            ? "mmd-badge-success"
                            : "mmd-badge-warning"
                        }`}
                      >
                        {it.statutPaiement === "paye" ? "Payé" : "En attente"}
                      </span>
                    ) : (
                      <span className="mmd-badge mmd-badge-info">—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      {it.kind === "pending" ? (
                        <button
                          type="button"
                          className="mmd-btn mmd-btn-primary mmd-btn-sm"
                          onClick={() =>
                            openCreate(it.rdvId, it.consultationId)
                          }
                        >
                          {it.consultationId ? "Finaliser" : "Créer"}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="mmd-btn mmd-btn-sm"
                            onClick={() => openView(it.consultationId)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="mmd-btn mmd-btn-sm mmd-btn-danger"
                            onClick={() => setConfirmDeleteCons(it.consultationId)}
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
        )}

        {pageCount > 1 && (
          <div className="consultation-pagination">
            <button
              type="button"
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
              type="button"
              className="mmd-btn mmd-btn-secondary mmd-btn-sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
            >
              Suivant <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Create modal */}
      {createModal && (
        <div className="consultation-modal-card">
          <div className="consultation-modal-header">
            <h3 className="consultation-modal-title">Créer consultation</h3>
            <button
              type="button"
              className="consultation-modal-close"
              onClick={() => setCreateModal(false)}
              aria-label="Fermer"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
          <div className="consultation-modal-body">
            <form onSubmit={submitCreate}>
              <div className="consultation-form-row">
                <div className="mmd-form-group">
                  <label className="mmd-label">Diagnostic</label>
                  <input
                    className="mmd-input"
                    value={createForm.diagnostic}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        diagnostic: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">
                    Ordonnance (optionnel)
                  </label>
                  <textarea
                    className="mmd-textarea"
                    value={createForm.ordonnance}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        ordonnance: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="consultation-modal-footer">
                <button type="submit" className="mmd-btn mmd-btn-primary">
                  Effectuer consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewModal && viewConsultation && (
        <div className="consultation-modal-card">
          <div className="consultation-modal-header">
            <h3 className="consultation-modal-title">
              Détails consultation
            </h3>
            <button
              type="button"
              className="consultation-modal-close"
              onClick={viewClose}
              aria-label="Fermer"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
          <div className="consultation-modal-body">
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Patient</span>
              <span className="consultation-detail-value">
                {viewConsultation.patient?.nom}{" "}
                {viewConsultation.patient?.prenom}
              </span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Date</span>
              <span className="consultation-detail-value">
                {new Date(viewConsultation.date).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Motif</span>
              <span className="consultation-detail-value">
                {viewConsultation.motif}
              </span>
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
                {viewConsultation.montant
                  ? `${viewConsultation.montant} DH`
                  : "—"}
              </span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">Mode paiement</span>
              <span className="consultation-detail-value">
                {viewConsultation.modePaiement || "—"}
              </span>
            </div>
            <div className="consultation-detail-row">
              <span className="consultation-detail-label">
                Statut paiement
              </span>
              <span className="consultation-detail-value">
                <span
                  className={`mmd-badge ${
                    viewConsultation.statutPaiement === "paye"
                      ? "mmd-badge-success"
                      : "mmd-badge-warning"
                  }`}
                >
                  {viewConsultation.statutPaiement === "paye"
                    ? "Payé"
                    : "En attente"}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteCons}
        title="Confirmer la suppression"
        message="Supprimer cette consultation ?"
        onConfirm={() => deleteConsultation(confirmDeleteCons)}
        onCancel={() => setConfirmDeleteCons(null)}
        confirmLabel="Supprimer"
      />
    </div>
  );
};

export default MedecinConsultationPage;