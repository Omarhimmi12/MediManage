import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import api from "../../api/axios";

import "./patientDashboard.css";

const MAROC_VILLES = [
  "Agadir",
  "Al Hoceima",
  "Casablanca",
  "Chefchaouen",
  "El Jadida",
  "Essaouira",
  "Fès",
  "Guelmim",
  "Ifrane",
  "Kenitra",
  "Khemisset",
  "Khouribga",
  "Laayoune",
  "Marrakech",
  "M'diq",
  "Meknès",
  "Mohammedia",
  "Nador",
  "Oujda",
  "Ouarzazate",
  "Rabat",
  "Safi",
  "Salé",
  "Settat",
  "Sidi Ifni",
  "Sidi Kacem",
  "Tanger",
  "Taounate",
  "Tetouan",
  "Tiznit",
  "Tanger-Assilah",
  "Temara",
  "Zagora",
];

const normalize = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // keep same UX pattern as medecinDashboard (activeSection sidebar)
  const [activeSection, setActiveSection] = useState("rdv");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userDisplayLabel = useMemo(() => {
    const nom = user?.nom ? String(user.nom) : "";
    const prenom = user?.prenom ? String(user.prenom) : "";
    return [nom, prenom].filter(Boolean).join(" ");
  }, [user?.nom, user?.prenom]);

  // RDV
  const [rdvList, setRdvList] = useState([]);
  const [loadingRdv, setLoadingRdv] = useState(true);

  // Cabinets search
  const [cabinets, setCabinets] = useState([]);
  const [cabinetsLoading, setCabinetsLoading] = useState(true);
  const [cabinetsError, setCabinetsError] = useState("");
  const [cabinetQuery, setCabinetQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Toutes");

  // Consultations
  const [consultations, setConsultations] = useState([]);
  const [consultationsLoading, setConsultationsLoading] = useState(true);
  const [consultationsError, setConsultationsError] = useState("");

  // Modal RDV
  const [rdvModalOpen, setRdvModalOpen] = useState(false);
  const [rdvCabinet, setRdvCabinet] = useState(null);
  const [rdvForm, setRdvForm] = useState({
    dateRdv: "",
    heureDebut: "",
    heureFin: "",
    motif: "",
  });
  const [rdvSubmitting, setRdvSubmitting] = useState(false);

  const [consultationViewOpen, setConsultationViewOpen] = useState(false);
  const [consultationView, setConsultationView] = useState(null);

  const modalCloseBtnRef = useRef(null);

  const fetchMyRdv = async () => {
    try {
      setLoadingRdv(true);
      const res = await api.get("/mon-rendez-vous");
      setRdvList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setRdvList([]);
    } finally {
      setLoadingRdv(false);
    }
  };

  const fetchAvailableCabinets = async () => {
    setCabinetsError("");
    try {
      setCabinetsLoading(true);
      const res = await api.get("/cabinets/available");
      setCabinets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("fetchAvailableCabinets error:", err);
      setCabinets([]);
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Erreur inconnue";
      setCabinetsError(
        status ? `HTTP ${status}: ${String(message)}` : String(message)
      );
    } finally {
      setCabinetsLoading(false);
    }
  };

  const fetchMyConsultations = async () => {
    setConsultationsError("");
    try {
      setConsultationsLoading(true);
      const res = await api.get("/mes-consultations");
      setConsultations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("fetchMyConsultations error:", err);
      setConsultations([]);
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Erreur inconnue";
      setConsultationsError(
        status ? `HTTP ${status}: ${String(message)}` : String(message)
      );
    } finally {
      setConsultationsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRdv();
    fetchAvailableCabinets();
    fetchMyConsultations();
  }, []);

  const cancelRdv = async (id) => {
    await api.put(`/rendez-vous/${id}/cancel`);
    fetchMyRdv();
  };

  const detectCabinetCity = (cabinetItem) => {
    const addr = normalize(
      cabinetItem?.adresseComplete || cabinetItem?.adresse
    );
    if (!addr) return null;

    const found = MAROC_VILLES.find((v) => {
      const vN = normalize(v);
      return vN && addr.includes(vN);
    });

    return found ?? null;
  };

  const filteredCabinets = useMemo(() => {
    const q = normalize(cabinetQuery).trim();
    const city = selectedCity;

    return cabinets.filter((c) => {
      const haystack = [c.nom, c.specialite, c.medecinNom]
        .filter(Boolean)
        .join(" ");

      const haystackN = normalize(haystack);

      const matchesQuery = !q ? true : haystackN.includes(q);

      const matchesCity =
        city === "Toutes" ? true : detectCabinetCity(c) === city;

      return matchesQuery && matchesCity;
    });
  }, [cabinetQuery, cabinets, selectedCity]);

  const openRdvModal = (cabinetItem) => {
    setRdvCabinet(cabinetItem);
    setRdvForm({
      dateRdv: "",
      heureDebut: "",
      heureFin: "",
      motif: "",
    });
    setRdvModalOpen(true);
    setRdvSubmitting(false);
    setTimeout(() => modalCloseBtnRef.current?.focus?.(), 0);
  };

  const closeRdvModal = () => {
    setRdvModalOpen(false);
    setRdvCabinet(null);
  };

  const submitRdv = async () => {
    if (!rdvCabinet) return;

    const medecinId = rdvCabinet?.medecin_id;
    const cabinetId = rdvCabinet?.id;

    if (!medecinId || !cabinetId) {
      alert("Impossible de créer le rendez-vous.");
      return;
    }

    const { dateRdv, heureDebut, heureFin, motif } = rdvForm;

    if (!dateRdv || !heureDebut || !heureFin || !motif) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setRdvSubmitting(true);

      await api.post("/rendez-vous", {
        medecin_id: medecinId,
        cabinet_id: cabinetId,
        date_rdv: dateRdv,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        motif,
      });

      alert("Rendez-vous créé avec succès ✅");
      closeRdvModal();
      fetchMyRdv();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Création RDV impossible.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setRdvSubmitting(false);
    }
  };

  const openGoogleMapsDirections = (cabinetItem) => {
    const destLat = cabinetItem?.latitude;
    const destLng = cabinetItem?.longitude;

    if (!destLat || !destLng) {
      alert("Coordonnées du cabinet indisponibles pour le trajet.");
      return;
    }

    const destination = `${destLat},${destLng}`;

    if (!navigator.geolocation) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
        "_blank"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(
          destination
        )}&travelmode=driving`;
        window.open(url, "_blank");
      },
      () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          destination
        )}&travelmode=driving`;
        window.open(url, "_blank");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const renderRdvSection = () => {
    if (loadingRdv) return <div className="p-3">Loading...</div>;

    return (
      <>
        <div className="card mt-4">
          <div className="card-header">Mes Rendez-vous</div>
          <div className="card-body">
            {rdvList.length === 0 ? (
              <p>Aucun rendez-vous.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rdvList.map((rdv) => {
                    const statut = String(rdv?.statut ?? "").toLowerCase();
                    const isTermine = statut.includes("termin");
                    const isAnnule = statut.includes("annule");
                    const canAnnuler = !isTermine && !isAnnule;

                    return (
                      <tr key={rdv.id}>
                        <td>{rdv.date_rdv}</td>
                        <td>{rdv.heure_debut}</td>
                        <td>
                          <span className="badge bg-info">{rdv.statut}</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              if (!canAnnuler) return;
                              cancelRdv(rdv.id);
                            }}
                            disabled={!canAnnuler}
                            style={
                              !canAnnuler
                                ? { opacity: 0.6, cursor: "not-allowed" }
                                : undefined
                            }
                          >
                            Annuler
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderConsultationsSection = () => {
    return (
      <div className="card mt-4">
        <div className="card-header">Mes Consultations</div>
        <div className="card-body">
          {consultationsError ? (
            <div className="alert alert-warning">
              Impossible de charger les consultations:{" "}
              <b>{consultationsError}</b>
            </div>
          ) : null}

          {consultationsLoading ? (
            <div>Chargement consultations...</div>
          ) : consultations.length === 0 ? (
            <div>Aucune consultation.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Médecin</th>
                    <th>Cabinet</th>
                    <th>Montant</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((cons) => {
                    const cabinetName = cons?.cabinetNom ?? "—";

                    return (
                      <tr key={cons.id}>
                        <td>{cons.date_consultation ?? "—"}</td>
                        <td>{cons.medecinNom ?? "—"}</td>
                        <td>{cabinetName}</td>
                        <td>{cons.montant ?? "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setConsultationView(cons);
                              setConsultationViewOpen(true);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCabinetsSection = () => {
    return (
      <div className="card mt-4">
        <div className="card-header">Trouver un cabinet</div>
        <div className="card-body">
          <div className="mb-3" style={{ fontWeight: 900 }}>
            Cabinets: {cabinetsLoading ? "..." : cabinets.length} | Résultats
            filtrés: {cabinetsLoading ? "..." : filteredCabinets.length}
          </div>

          {cabinetsError ? (
            <div className="alert alert-warning">
              Impossible de charger les cabinets: <b>{cabinetsError}</b>
            </div>
          ) : null}

          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-6">
              <label className="form-label">Recherche</label>
              <input
                className="form-control"
                value={cabinetQuery}
                onChange={(e) => setCabinetQuery(e.target.value)}
                placeholder="Nom cabinet / Spécialité / Médecin"
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Ville (Maroc)</label>
              <select
                className="form-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="Toutes">Toutes</option>
                {MAROC_VILLES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2 d-grid gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setCabinetQuery("");
                  setSelectedCity("Toutes");
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-3">
            {cabinetsLoading ? (
              <div>Chargement cabinets...</div>
            ) : filteredCabinets.length === 0 ? (
              <div>Aucun cabinet trouvé.</div>
            ) : (
              <div className="row g-3">
                {filteredCabinets.map((c) => {
                  const city = detectCabinetCity(c);
                  return (
                    <div key={c.id} className="col-12 col-md-6 col-lg-4">
                      <div className="border rounded p-3 h-100">
                        <div className="fw-bold" style={{ fontSize: 16 }}>
                          {c.nom}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: 13, marginTop: 2 }}
                        >
                          Dr: {c.medecinNom ?? "—"}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 14 }}>
                          Spécialité: {c.specialite}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 13 }}>
                          {c.adresse}
                        </div>
                        {city ? (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            Ville: {city}
                          </div>
                        ) : null}

                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => openRdvModal(c)}
                          >
                            Prendre un RDV
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openGoogleMapsDirections(c)}
                          >
                            Y aller
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex mmd-patient-dashboard">
      <div
        className={`mmd-sidebar ${isSidebarCollapsed ? "mmd-sidebar--collapsed" : ""}`}
      >
        <div className="mmd-brand">
          <img className="mmd-brand__img" src="/images/brand.png" alt="MediManage" />
          <span className="mmd-brand__text">MediManage</span>
        </div>

        {[
          ["rdv", "Mes Rendez-vous", "bi-calendar-check"],
          ["consultations", "Mes Consultations", "bi-heart-pulse"],
          ["cabinets", "Trouver un cabinet", "bi-building"],
        ].map(([key, label, icon]) => {
          const isActive = activeSection === key;
          return (
            <button
              key={key}
              className={`mmd-navbtn btn ${isActive ? "mmd-navbtn--active" : ""}`}
              onClick={() => setActiveSection(key)}
              type="button"
            >
              <span className="mmd-navbtn__icon" aria-hidden="true">
                <i className={`bi ${icon}`} />
              </span>
              <span className="mmd-navbtn__label">{label}</span>
            </button>
          );
        })}


        <button
          className="btn btn-outline-light w-100 mt-4 mmd-sidebar__logout"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          type="button"
        >
          <span className="mmd-navbtn__icon" aria-hidden="true">
            <i className="bi bi-box-arrow-right" />
          </span>
          <span className="mmd-navbtn__label">Déconnexion</span>
        </button>
      </div>

      <button
        type="button"
        className="mmd-sidebar-toggle"
        aria-label="Toggle sidebar"
        onClick={() => setIsSidebarCollapsed((v) => !v)}
      >
        {isSidebarCollapsed ? "»" : "«"}
      </button>

        <div className="mmd-content">
        <div className="mmd-topbar mmd-topbar--fixed">
          <div className="mmd-topbar__spacer" />

          <div className="mmd-profile">
            <button
              type="button"
              className="mmd-profile__button"
              onClick={() => setIsProfileOpen((v) => !v)}
            >
              <span className="mmd-profile__label">{userDisplayLabel}</span>
              <span className="mmd-profile__chevron" aria-hidden="true">
                ▼
              </span>
            </button>

            {isProfileOpen ? (
              <div className="mmd-profile__menu" role="menu">
                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("rdv");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-calendar-check" />
                  </span>
                  <span className="mmd-profile__itemLabel">Mes Rendez-vous</span>
                </button>

                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("consultations");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-heart-pulse" />
                  </span>
                  <span className="mmd-profile__itemLabel">
                    Mes Consultations
                  </span>
                </button>

                <button
                  type="button"
                  className="mmd-profile__item"
                  onClick={() => {
                    setActiveSection("cabinets");
                    setIsProfileOpen(false);
                  }}
                >
                  <span className="mmd-profile__itemIcon" aria-hidden="true">
                    <i className="bi bi-building" />
                  </span>
                  <span className="mmd-profile__itemLabel">Cabinets</span>
                </button>

                <div className="mmd-profile__divider" />

                <button
                  type="button"
                  className="mmd-profile__item mmd-profile__item--logout"
                  onClick={async () => {
                    await logout();
                    setIsProfileOpen(false);
                    navigate("/login");
                  }}
                >
                  Déconnexion
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mmd-topbar--placeholder" />

        {/* Main content */}
        {activeSection === "rdv" ? renderRdvSection() : null}
        {activeSection === "consultations"
          ? renderConsultationsSection()
          : null}
        {activeSection === "cabinets" ? renderCabinetsSection() : null}

        {/* Consultation View Modal */}
        {consultationViewOpen ? (
          <div
            className="modal show"
            style={{
              display: "block",
              background: "rgba(0,0,0,0.45)",
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              overflowY: "auto",
              padding: 16,
            }}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="modal-dialog"
              style={{ maxWidth: 720, margin: "60px auto" }}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Détails Consultation</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                      setConsultationViewOpen(false);
                      setConsultationView(null);
                    }}
                  />
                </div>

                <div className="modal-body">
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>
                    {consultationView?.date_consultation ?? "—"}
                  </div>

                  <div className="mb-2">
                    <b>Médecin:</b> {consultationView?.medecinNom ?? "—"}
                  </div>
                  <div className="mb-2">
                    <b>Cabinet:</b> {consultationView?.cabinetNom ?? "—"}
                  </div>

                  <div className="mb-2">
                    <b>Montant:</b> {consultationView?.montant ?? "—"}
                  </div>
                  <div className="mb-2">
                    <b>Mode paiement:</b>{" "}
                    {consultationView?.mode_paiement ?? "—"}
                  </div>

                  <div className="mb-0">
                    <b>Ordonnance:</b>{" "}
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {consultationView?.ordonnance ?? "—"}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setConsultationViewOpen(false);
                      setConsultationView(null);
                    }}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* RDV modal */}
        {rdvModalOpen ? (
          <div
            className="modal show"
            style={{
              display: "block",
              background: "rgba(0,0,0,0.45)",
              position: "fixed",
              inset: 0,
              zIndex: 1050,
              overflowY: "auto",
              padding: 16,
            }}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="modal-dialog"
              style={{ maxWidth: 560, margin: "80px auto" }}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Prendre un RDV</h5>
                  <button
                    ref={modalCloseBtnRef}
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeRdvModal}
                    disabled={rdvSubmitting}
                  />
                </div>

                <div className="modal-body">
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>
                    {rdvCabinet?.nom}{" "}
                    <span className="text-muted" style={{ fontWeight: 600 }}>
                      - Dr {rdvCabinet?.medecinNom ?? "—"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={rdvForm.dateRdv}
                      onChange={(e) =>
                        setRdvForm((p) => ({ ...p, dateRdv: e.target.value }))
                      }
                      min={new Date().toISOString().slice(0, 10)}
                      disabled={rdvSubmitting}
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Heure début</label>
                      <input
                        type="time"
                        className="form-control"
                        value={rdvForm.heureDebut}
                        onChange={(e) =>
                          setRdvForm((p) => ({
                            ...p,
                            heureDebut: e.target.value,
                          }))
                        }
                        disabled={rdvSubmitting}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Heure fin</label>
                      <input
                        type="time"
                        className="form-control"
                        value={rdvForm.heureFin}
                        onChange={(e) =>
                          setRdvForm((p) => ({
                            ...p,
                            heureFin: e.target.value,
                          }))
                        }
                        disabled={rdvSubmitting}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label">Motif</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={rdvForm.motif}
                      onChange={(e) =>
                        setRdvForm((p) => ({ ...p, motif: e.target.value }))
                      }
                      placeholder="Ex: Consultation générale"
                      disabled={rdvSubmitting}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeRdvModal}
                    disabled={rdvSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={submitRdv}
                    disabled={rdvSubmitting}
                  >
                    {rdvSubmitting ? "Envoi..." : "Confirmer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PatientDashboard;
