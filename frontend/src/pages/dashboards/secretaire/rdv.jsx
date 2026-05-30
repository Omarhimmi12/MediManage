import { useContext, useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";

const PAGE_SIZE = 5;

const motifOptions = [
  "Consultation de routine",
  "Douleur au ventre",
  "Suivi de grossesse",
  "Contrôle médical",
  "Vaccination",
  "Urgence dentaire",
  "Renouvellement ordonnance",
];

const statusOptions = [
  "en_attente",
  "confirme",
  "annule",
  "termine",
];

const SecretaireRdvPage = () => {
  const { user } = useContext(AuthContext);

  const [rdvList, setRdvList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [queryPatient, setQueryPatient] = useState("");
  const [status, setStatus] = useState("all");
  const [motif, setMotif] = useState("all");

  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [patients, setPatients] = useState([]);

  const [formErrors, setFormErrors] = useState([]);

  const form = useMemo(
    () => ({
      patient_id: "",
      date_rdv: "",
      heure_debut: "",
      heure_fin: "",
      motif: "",
      medecin_id: "",
      cabinet_id: "",
    }),
    []
  );

  const [addForm, setAddForm] = useState(form);

  const cabinetId = user?.secretaire?.cabinet?.id ?? "";
  const medecinId = user?.secretaire?.cabinet?.medecin_id ?? "";

  useEffect(() => {
    setAddForm((s) => ({
      ...s,
      cabinet_id: cabinetId,
      medecin_id: medecinId,
    }));
  }, [cabinetId, medecinId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const rdvRes = await api.get("/rendez-vous");
      setRdvList(Array.isArray(rdvRes.data) ? rdvRes.data : []);

      const patientsRes = await api.get("/patients");
      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
    } catch (err) {
      console.log(err);
      setRdvList([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [queryPatient, status, motif]);

  const filteredRdv = useMemo(() => {
    const q = queryPatient.trim().toLowerCase();

    return rdvList.filter((r) => {
      const nom = r?.patient?.user?.nom ?? "";
      const prenom = r?.patient?.user?.prenom ?? "";
      const patientStr = `${nom} ${prenom}`.toLowerCase();

      const matchPatient = !q || patientStr.includes(q);
      const matchStatus =
        status === "all" ? true : String(r?.statut) === status;
      const matchMotif = motif === "all" ? true : String(r?.motif) === motif;

      return matchPatient && matchStatus && matchMotif;
    });
  }, [rdvList, queryPatient, status, motif]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(filteredRdv.length / PAGE_SIZE));
  }, [filteredRdv.length]);

  const paginatedRdv = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRdv.slice(start, start + PAGE_SIZE);
  }, [filteredRdv, page]);

  const selectedPatient = useMemo(() => {
    return (
      patients.find((p) => String(p.id) === String(addForm.patient_id)) ??
      null
    );
  }, [patients, addForm.patient_id]);

  const initAddForm = () => {
    setFormErrors([]);
    setShowAdd(true);
    setAddForm((s) => ({
      ...s,
      patient_id: "",
      date_rdv: "",
      heure_debut: "",
      heure_fin: "",
      motif: "",
      medecin_id: medecinId,
      cabinet_id: cabinetId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    try {
      await api.post("/rendez-vous", {
        patient_id: addForm.patient_id ? Number(addForm.patient_id) : null,
        medecin_id: addForm.medecin_id ? Number(addForm.medecin_id) : null,
        cabinet_id: addForm.cabinet_id ? Number(addForm.cabinet_id) : null,
        date_rdv: addForm.date_rdv,
        heure_debut: addForm.heure_debut,
        heure_fin: addForm.heure_fin,
        motif: addForm.motif,
      });

      setShowAdd(false);
      await fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;
      if (msg) setFormErrors([msg]);
      else if (errors) setFormErrors(Object.values(errors).flat());
      else setFormErrors(["Erreur lors de la création du rendez-vous."]);
    }
  };

  const updateStatus = async (id, nextStatut) => {
    try {
      await api.put(`/rendez-vous/${id}/statut`, { statut: nextStatut });

      // No full refetch: update only the affected row
      setRdvList((prev) =>
        prev.map((r) =>
          String(r.id) === String(id) ? { ...r, statut: nextStatut } : r
        )
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Erreur lors de la mise à jour";
      setFormErrors([msg]);
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-0">
      <div className="row p-3 mb-4 d-flex justify-content-between align-items-center">
        <div className="col-6">
          <h5 className="mb-0">Gestion des Rendez-vous</h5>
        </div>

        <button className="col-4 btn btn-primary" onClick={initAddForm}>
          Nouveau RDV
        </button>
      </div>

      {showAdd && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Ajouter rendez-vous</span>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowAdd(false)}
            >
              Fermer
            </button>
          </div>

          <div className="card-body">
            {formErrors.length > 0 && (
              <div className="alert alert-danger">
                <ul className="mb-0">
                  {formErrors.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Patient</label>
                  <select
                    className="form-select"
                    value={addForm.patient_id}
                    onChange={(e) =>
                      setAddForm((s) => ({ ...s, patient_id: e.target.value }))
                    }
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.user?.nom} {p.user?.prenom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Date</label>
                  <input
                    className="form-control"
                    type="date"
                    value={addForm.date_rdv}
                    onChange={(e) =>
                      setAddForm((s) => ({ ...s, date_rdv: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Motif</label>
                  <select
                    className="form-select"
                    value={addForm.motif}
                    onChange={(e) =>
                      setAddForm((s) => ({ ...s, motif: e.target.value }))
                    }
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {motifOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Heure début</label>
                  <input
                    className="form-control"
                    type="time"
                    value={addForm.heure_debut}
                    onChange={(e) =>
                      setAddForm((s) => ({ ...s, heure_debut: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Heure fin</label>
                  <input
                    className="form-control"
                    type="time"
                    value={addForm.heure_fin}
                    onChange={(e) =>
                      setAddForm((s) => ({ ...s, heure_fin: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-success">
                    Créer RDV
                  </button>
                </div>

                <div className="col-12">
                  {selectedPatient ? (
                    <div className="small mt-1">
                      Patient sélectionné : {selectedPatient.user?.nom}{" "}
                      {selectedPatient.user?.prenom}
                    </div>
                  ) : null}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters row (same UX as medecin rdv) */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            value={queryPatient}
            onChange={(e) => setQueryPatient(e.target.value)}
            placeholder="Rechercher un patient"
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          >
            <option value="all">Tous les motifs</option>
            {motifOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr style={{ background: "#1f2933" }}>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Heure début</th>
                  <th>Heure fin</th>
                  <th>Motif</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRdv.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ color: "#0000" }}>
                      <span style={{ color: "#000", fontWeight: 500 }}>
                        Aucun rendez-vous trouvé.
                      </span>
                    </td>
                  </tr>
                ) : (
                  paginatedRdv.map((r) => (
                    <tr key={r.id}>
                      <td>{r.patient?.user?.nom} {r.patient?.user?.prenom}</td>
                      <td>{r.date_rdv}</td>
                      <td>{String(r?.heure_debut ?? "").slice(0, 5)}</td>
                      <td>{String(r?.heure_fin ?? "").slice(0, 5)}</td>
                      <td>{r.motif}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={String(r?.statut ?? "")}
                          onChange={(e) =>
                            updateStatus(r.id, e.target.value)
                          }
                          style={{
                            border: "2px solid #0ea5e9",
                            fontWeight: 700,
                            background: "#e0f2fe",
                            cursor: "pointer",
                          }}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb" }} className="py-3">
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

      <div style={{ height: 120 }} />
    </div>
  );
};

export default SecretaireRdvPage;
