import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import api from "../../../api/axios";

const SecretairePatients = () => {
  const { user } = useContext(AuthContext);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // view dossier
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  // form add patient
  const [showAdd, setShowAdd] = useState(false);

  // edit patient (inline form)
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState([]);
  const [editSaving, setEditSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    antecedents: "",
    allergies: "",
    notes_generales: "",
  });

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    password_confirmation: "",
    date_naissance: "",
    adresse: "",
    sexe: "male",
    // dossier medical (optionnel)
    antecedents: "",
    allergies: "",
    notes_generales: "",
  });
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await api.get("/patients");
        setPatients(res.data ?? []);
      } catch (err) {
        console.log(err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const resetAddForm = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      password: "",
      password_confirmation: "",
      date_naissance: "",
      adresse: "",
      sexe: "male",
      antecedents: "",
      allergies: "",
      notes_generales: "",
    });
    setFormErrors([]);
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    try {
      await api.post("/patients", {
        ...form,
        password_confirmation: form.password_confirmation,
      });

      resetAddForm();
      setShowAdd(false);

      const res = await api.get("/patients");
      setPatients(res.data ?? []);
    } catch (err) {
      if (err?.response?.data?.message) {
        setFormErrors([err.response.data.message]);
      } else if (err?.response?.data?.errors) {
        setFormErrors(Object.values(err.response.data.errors).flat());
      } else {
        setFormErrors(["Erreur lors de l'ajout du patient."]);
      }
    }
  };

  const handleViewDossier = (id) => {
    setSelectedPatientId(id);
  };

  const startEditPatient = (p) => {
    setEditFormErrors([]);
    setEditingPatientId(p.id);
    setSelectedPatientId(null);

    setEditForm({
      nom: p.user?.nom ?? "",
      prenom: p.user?.prenom ?? "",
      telephone: p.user?.telephone ?? "",
      antecedents: p.dossierMedical?.antecedents ?? "",
      allergies: p.dossierMedical?.allergies ?? "",
      notes_generales: p.dossierMedical?.notes_generales ?? "",
    });
  };

  const cancelEditPatient = () => {
    setEditingPatientId(null);
    setEditFormErrors([]);
    setEditForm({
      nom: "",
      prenom: "",
      telephone: "",
      antecedents: "",
      allergies: "",
      notes_generales: "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditFormErrors([]);

    try {
      await api.put(`/patients/${editingPatientId}`, {
        nom: editForm.nom,
        prenom: editForm.prenom,
        telephone: editForm.telephone,
        antecedents: editForm.antecedents,
        allergies: editForm.allergies,
        notes_generales: editForm.notes_generales,
      });

      cancelEditPatient();

      const res = await api.get("/patients");
      setPatients(res.data ?? []);
    } catch (err) {
      const msg = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;

      if (msg) setEditFormErrors([msg]);
      else if (errors) setEditFormErrors(Object.values(errors).flat());
      else setEditFormErrors(["Erreur lors de la mise à jour du patient."]);
    } finally {
      setEditSaving(false);
    }
  };

  const handleBackToList = () => setSelectedPatientId(null);

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-0">
      <div className="p-3 mb-4 d-flex justify-content-between">
        <h3 className="mb-0">Liste patients</h3>
        <button
          className="btn btn-dark"
          onClick={() => {
            setShowAdd(true);
            setSelectedPatientId(null);
            resetAddForm();
          }}
        >
          Ajouter
        </button>
      </div>

      {editingPatientId ? (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>
              Modifier patient —{" "}
              {patients.find((p) => p.id === editingPatientId)?.user?.nom ?? ""}{" "}
              {patients.find((p) => p.id === editingPatientId)?.user?.prenom ?? ""}
            </span>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={cancelEditPatient}
              disabled={editSaving}
            >
              Fermer
            </button>
          </div>

          <div className="card-body">
            {editFormErrors.length > 0 && (
              <div className="alert alert-danger">
                <ul className="mb-0">
                  {editFormErrors.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Nom</label>
                  <input
                    className="form-control"
                    value={editForm.nom}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, nom: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Prénom</label>
                  <input
                    className="form-control"
                    value={editForm.prenom}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, prenom: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Téléphone</label>
                  <input
                    className="form-control"
                    value={editForm.telephone}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, telephone: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Antécédents</label>
                  <input
                    className="form-control"
                    value={editForm.antecedents}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        antecedents: e.target.value,
                      }))
                    }
                    placeholder="ex: diabète, HTA..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Allergies</label>
                  <input
                    className="form-control"
                    value={editForm.allergies}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        allergies: e.target.value,
                      }))
                    }
                    placeholder="ex: pénicilline..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Notes générales</label>
                  <input
                    className="form-control"
                    value={editForm.notes_generales}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        notes_generales: e.target.value,
                      }))
                    }
                    placeholder="ex: remarques..."
                  />
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={editSaving}
                  >
                    {editSaving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : selectedPatient ? (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>
              Dossier médical — {selectedPatient.user?.nom}{" "}
              {selectedPatient.user?.prenom}
            </span>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleBackToList}
            >
              ← Retour
            </button>
          </div>

          <div className="card-body">
            <div className="mb-3">
              <strong>Date création :</strong>{" "}
              {selectedPatient.dossierMedical?.date_creation ?? "-"}
            </div>

            <div className="mb-3">
              <strong>Nom :</strong>{" "}
              {selectedPatient.user?.nom ?? "-"}
            </div>

            <div className="mb-3">
              <strong>Prénom :</strong>{" "}
              {selectedPatient.user?.prenom ?? "-"}
            </div>

            <div className="mb-3">
              <strong>Téléphone :</strong>{" "}
              {selectedPatient.user?.telephone ?? "-"}
            </div>

            <div className="mb-3">
              <strong>Antécédents :</strong>{" "}
              {selectedPatient.dossierMedical?.antecedents ?? "-"}
            </div>

            <div className="mb-3">
              <strong>Allergies :</strong>{" "}
              {selectedPatient.dossierMedical?.allergies ?? "-"}
            </div>

            <div className="mb-3">
              <strong>Notes générales :</strong>{" "}
              {selectedPatient.dossierMedical?.notes_generales ?? "-"}
            </div>

            <div className="text-muted small mt-3">
              View mode.
            </div>
          </div>
        </div>
      ) : (
        <>
          {showAdd && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Ajouter patient</span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setShowAdd(false);
                    setFormErrors([]);
                  }}
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

                <form onSubmit={handleAddPatient}>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">Nom</label>
                      <input
                        className="form-control"
                        value={form.nom}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, nom: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Prénom</label>
                      <input
                        className="form-control"
                        value={form.prenom}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, prenom: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Téléphone</label>
                      <input
                        className="form-control"
                        value={form.telephone}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, telephone: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, email: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Mot de passe</label>
                      <input
                        className="form-control"
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, password: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">
                        Confirmer le mot de passe
                      </label>
                      <input
                        className="form-control"
                        type="password"
                        value={form.password_confirmation}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            password_confirmation: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Date naissance</label>
                      <input
                        className="form-control"
                        type="date"
                        value={form.date_naissance}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            date_naissance: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Sexe</label>
                      <select
                        className="form-select"
                        value={form.sexe}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, sexe: e.target.value }))
                        }
                        required
                      >
                        <option value="male">male</option>
                        <option value="female">female</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Adresse</label>
                      <input
                        className="form-control"
                        value={form.adresse}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, adresse: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        Antécédents (optionnel)
                      </label>
                      <input
                        className="form-control"
                        value={form.antecedents}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            antecedents: e.target.value,
                          }))
                        }
                        placeholder="ex: diabète, HTA..."
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        Allergies (optionnel)
                      </label>
                      <input
                        className="form-control"
                        value={form.allergies}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            allergies: e.target.value,
                          }))
                        }
                        placeholder="ex: pénicilline..."
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        Notes générales (optionnel)
                      </label>
                      <input
                        className="form-control"
                        value={form.notes_generales}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            notes_generales: e.target.value,
                          }))
                        }
                        placeholder="ex: remarques..."
                      />
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        Ajouter
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="card">            
            <div className="card-body">
              {patients.length === 0 ? (
                <p className="mb-0">Aucun patient.</p>
              ) : (
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Tel</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.id}>
                        <td>{p.user?.nom ?? "-"}</td>
                        <td>{p.user?.prenom ?? "-"}</td>
                        <td>{p.user?.telephone ?? "-"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <button
                            className="btn btn-outline-primary btn-sm me-2"
                            onClick={() => handleViewDossier(p.id)}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-outline-secondary btn-sm me-2"
                            onClick={() => startEditPatient(p)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={async () => {
                              if (!window.confirm("Supprimer ce patient ?")) return;
                              try {
                                await api.delete(`/patients/${p.id}`);
                                // Refresh only the cabinet-scoped list
                                const res = await api.get("/patients");
                                setPatients(res.data ?? []);
                                if (selectedPatientId === p.id) setSelectedPatientId(null);
                              } catch (err) {
                                alert(
                                  err?.response?.data?.message ||
                                    "Erreur suppression patient"
                                );
                              }
                            }}
                          >
                            Delete
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SecretairePatients;
