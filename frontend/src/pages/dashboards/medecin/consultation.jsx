import { useContext, useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";

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
    const visible = rdvList.filter((r) => r.statut === "confirme" || r.statut === "termine");

    return visible
      .map((r) => {
        const consultation = r.consultation ?? null;
        const hasConsultation = Boolean(consultation?.id);

        const diagnostic = consultation?.diagnostic ?? "";
        const ordonnance = consultation?.ordonnance ?? null;

        // If a consultation shell exists but diagnostic is still empty,
        // treat it as "pending" for medecin to finalize with PUT.
        const isShellPending = hasConsultation && !String(diagnostic).trim();

        return {
          kind: isShellPending ? "pending" : hasConsultation ? "existing" : "pending",
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
        // Finalize existing shell created by secretaire
        await api.put(`/consultations/${createForm.consultation_id}`, {
          diagnostic: createForm.diagnostic,
          ordonnance: createForm.ordonnance || null,
        });

        setSuccessMsg("Consultation finalisée avec succès.");
      } else {
        // Legacy fallback: create consultation directly
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
      setErrorMsg(err?.response?.data?.message || "Erreur lors de la création");
    }
  };

  const openView = (consultationId) => {
    const target = items.find((it) => it.consultationId === consultationId);
    if (!target) return;

    setViewConsultation(target);
    setViewModal(true);
  };

  const deleteConsultation = async (consultationId) => {
    if (!window.confirm("Supprimer cette consultation ?")) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.delete(`/consultations/${consultationId}`);
      setSuccessMsg("Consultation supprimée.");
      setViewModal(false);
      await fetchRdv();
      setPage(1);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const viewClose = () => {
    setViewModal(false);
    setViewConsultation(null);
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-0">
      <div className="shadow-sm p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Consultations</h5>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              const firstPending = items.find((it) => it.kind === "pending");
              if (firstPending) openCreate(firstPending.rdvId);
            }}
            disabled={items.find((it) => it.kind === "pending") == null}
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
                  {paginatedItems.map((it) => (
                    <tr key={it.rdvId}>
                      <td>
                        {it.patient?.nom} {it.patient?.prenom}
                      </td>
                      <td>{it.date}</td>
                      <td>{it.motif}</td>
                      <td>{it.kind === "existing" ? (it.statutPaiement ?? "en_attente") : "—"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {it.kind === "pending" ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => openCreate(it.rdvId, it.consultationId)}
                            >
                              {it.consultationId ? "Finaliser" : "Créer"}
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => openView(it.consultationId)}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteConsultation(it.consultationId)}
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

      {/* Create modal */}
      {createModal ? (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Créer consultation</span>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setCreateModal(false)}>
              Fermer
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={submitCreate}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Diagnostic</label>
                  <input
                    className="form-control"
                    value={createForm.diagnostic}
                    onChange={(e) => setCreateForm((s) => ({ ...s, diagnostic: e.target.value }))}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Ordonnance (optionnel)</label>
                  <textarea
                    className="form-control"
                    value={createForm.ordonnance}
                    onChange={(e) => setCreateForm((s) => ({ ...s, ordonnance: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Médecin: pas de montant à saisir */}

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

      {/* View modal (simple card) */}
      {viewModal && viewConsultation ? (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Consultation details</span>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={viewClose}>
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
              <strong>Ordonnance:</strong> {viewConsultation.ordonnance ? viewConsultation.ordonnance : "—"}
            </div>
            <div className="mb-2">
              <strong>Montant:</strong> {viewConsultation.montant ? `${viewConsultation.montant} DH` : "—"}
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
    </div>
  );
};

export default MedecinConsultationPage;
