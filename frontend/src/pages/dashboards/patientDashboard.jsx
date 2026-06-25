import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { NotificationContext } from "../../context/notificationContext";
import NotificationDropdown from "../../components/NotificationDropdown";
import MessagingPage from "../messaging/MessagingPage";
import api from "../../api/axios";
import exportConsultationPDF from "../../utils/exportConsultationPDF";
import ProfilPage from "./patient/profil";
import "./patientDashboard.css";

const MAROC_VILLES = [
  "Agadir", "Al Hoceima", "Casablanca", "Chefchaouen", "El Jadida",
  "Essaouira", "Fès", "Guelmim", "Ifrane", "Kenitra", "Khemisset",
  "Khouribga", "Laayoune", "Marrakech", "M'diq", "Meknès", "Mohammedia",
  "Nador", "Oujda", "Ouarzazate", "Rabat", "Safi", "Salé", "Settat",
  "Sidi Ifni", "Sidi Kacem", "Tanger", "Taounate", "Tetouan", "Tiznit",
  "Tanger-Assilah", "Temara", "Zagora",
];

const normalize = (s) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { unreadCount, toggleDropdown, closeDropdown, dropdownOpen } = useContext(NotificationContext);

  const [activeSection, setActiveSection] = useState("rdv");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
  const [rdvForm, setRdvForm] = useState({ dateRdv: "", heureDebut: "", heureFin: "", motif: "Consultation générale" });
  const MOTIFS_RDV = ["Consultation générale", "Suivi médical", "Urgence", "Vaccination", "Certificat médical", "Autre"];
  const [rdvSubmitting, setRdvSubmitting] = useState(false);

  // Consultation detail
  const [consultationViewOpen, setConsultationViewOpen] = useState(false);
  const [consultationView, setConsultationView] = useState(null);

  const modalCloseBtnRef = useRef(null);

  const navItems = [
    { key: "profil", label: "Profil", icon: "bi-person-circle" },
    { key: "rdv", label: "Mes Rendez-vous", icon: "bi-calendar-check-fill" },
    { key: "consultations", label: "Consultations", icon: "bi-heart-pulse-fill" },
    { key: "cabinets", label: "Trouver un cabinet", icon: "bi-building-fill" },
    { key: "messages", label: "Messages", icon: "bi-chat-dots-fill" },
  ];

  const fetchMyRdv = async () => {
    try {
      setLoadingRdv(true);
      const res = await api.get("/mon-rendez-vous");
      setRdvList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
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
      setCabinets([]);
      setCabinetsError(err?.response?.data?.message || err?.message || "Erreur");
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
      setConsultations([]);
      setConsultationsError(err?.response?.data?.message || err?.message || "Erreur");
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
    const addr = normalize(cabinetItem?.adresseComplete || cabinetItem?.adresse);
    if (!addr) return null;
    return MAROC_VILLES.find((v) => normalize(v) && addr.includes(normalize(v))) ?? null;
  };

  const filteredCabinets = useMemo(() => {
    const q = normalize(cabinetQuery).trim();
    const city = selectedCity;
    return cabinets.filter((c) => {
      const haystack = [c.nom, c.specialite, c.medecinNom].filter(Boolean).join(" ");
      const haystackN = normalize(haystack);
      const matchesQuery = !q || haystackN.includes(q);
      const matchesCity = city === "Toutes" || detectCabinetCity(c) === city;
      return matchesQuery && matchesCity;
    });
  }, [cabinetQuery, cabinets, selectedCity]);

  const openRdvModal = (cabinetItem) => {
    setRdvCabinet(cabinetItem);
    setRdvForm({ dateRdv: "", heureDebut: "", heureFin: "", motif: MOTIFS_RDV[0] });
    setRdvModalOpen(true);
    setRdvSubmitting(false);
    setTimeout(() => modalCloseBtnRef.current?.focus?.(), 0);
  };

  const closeRdvModal = () => {
    setRdvModalOpen(false);
    setRdvCabinet(null);
  };

  const [messageModal, setMessageModal] = useState({ open: false, title: "", body: "", variant: "info", actionLabel: "OK" });

  const closeMessageModal = () => setMessageModal((p) => ({ ...p, open: false }));

  const openMessageModal = ({ title, body, variant = "info", actionLabel = "OK" }) => {
    setMessageModal({ open: true, title: title ?? "Message", body: body ?? "", variant, actionLabel });
    setRdvSubmitting(false);
  };

  const submitRdv = async () => {
    if (!rdvCabinet) return;
    const medecinId = rdvCabinet?.medecin_id;
    const cabinetId = rdvCabinet?.id;
    if (!medecinId || !cabinetId) {
      openMessageModal({ variant: "danger", title: "Erreur", body: "Impossible de créer le rendez-vous." });
      return;
    }
    const { dateRdv, heureDebut, heureFin, motif } = rdvForm;
    if (!dateRdv || !heureDebut || !heureFin || !motif) {
      openMessageModal({ variant: "warning", title: "Champs manquants", body: "Veuillez remplir tous les champs." });
      return;
    }
    try {
      setRdvSubmitting(true);
      await api.post("/rendez-vous", { medecin_id: medecinId, cabinet_id: cabinetId, date_rdv: dateRdv, heure_debut: heureDebut, heure_fin: heureFin, motif });
      openMessageModal({ variant: "success", title: "Succès", body: "Rendez-vous créé avec succès ✅", actionLabel: "Continuer" });
      closeRdvModal();
      fetchMyRdv();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Création RDV impossible.";
      openMessageModal({ variant: "danger", title: "Erreur", body: typeof msg === "string" ? msg : JSON.stringify(msg) });
    } finally {
      setRdvSubmitting(false);
    }
  };

  const openGoogleMapsDirections = (cabinetItem) => {
    const destLat = cabinetItem?.latitude;
    const destLng = cabinetItem?.longitude;
    if (!destLat || !destLng) {
      openMessageModal({ variant: "warning", title: "Coordonnées manquantes", body: "Coordonnées du cabinet indisponibles pour le trajet." });
      return;
    }
    const destination = `${destLat},${destLng}`;
    if (!navigator.geolocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`, "_blank");
      },
      () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`, "_blank"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const renderProfilSection = () => <ProfilPage />;

  const renderRdvSection = () => {
    if (loadingRdv) return <div className="mmd-text-muted mmd-mt-16">Chargement...</div>;
    return (
      <div className="mmd-card mmd-mt-24">
        <div className="mmd-card-header"><h3 className="mmd-card-title">Mes Rendez-vous</h3></div>
        {rdvList.length === 0 ? (
          <p className="mmd-text-muted">Aucun rendez-vous.</p>
        ) : (
          <table className="mmd-table">
            <thead><tr><th>Date</th><th>Heure</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {rdvList.map((rdv) => {
                const s = String(rdv?.statut ?? "").toLowerCase();
                const dis = s.includes("termin") || s.includes("annule");
                return (
                  <tr key={rdv.id}>
                    <td>{rdv.date_rdv}</td>
                    <td>{rdv.heure_debut}</td>
                    <td><span className="mmd-badge mmd-badge-info">{rdv.statut}</span></td>
                    <td><button className="mmd-btn mmd-btn-danger mmd-btn-sm" onClick={() => cancelRdv(rdv.id)} disabled={dis}>Annuler</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderConsultationsSection = () => (
    <div className="mmd-card mmd-mt-24">
      <div className="mmd-card-header"><h3 className="mmd-card-title">Mes Consultations</h3></div>
      {consultationsError && <div className="mmd-alert mmd-alert-warning">Erreur: <b>{consultationsError}</b></div>}
      {consultationsLoading ? (
        <div className="mmd-text-muted">Chargement...</div>
      ) : consultations.length === 0 ? (
        <div className="mmd-text-muted">Aucune consultation.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="mmd-table">
            <thead><tr><th>Date</th><th>Médecin</th><th>Cabinet</th><th>Montant</th><th>Actions</th></tr></thead>
            <tbody>
              {consultations.map((cons) => (
                <tr key={cons.id}>
                  <td>{cons.date_consultation ?? "—"}</td>
                  <td>{cons.medecinNom ?? "—"}</td>
                  <td>{cons.cabinetNom ?? "—"}</td>
                  <td>{cons.montant ?? "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="mmd-btn mmd-btn-info mmd-btn-sm" onClick={() => { setConsultationView(cons); setConsultationViewOpen(true); }}><i className="bi bi-eye-fill"></i> Voir</button>
                      <button className="mmd-btn mmd-btn-info mmd-btn-sm" onClick={() => exportConsultationPDF(cons)} title="Exporter en PDF"><i className="bi bi-download"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCabinetsSection = () => (
    <div className="mmd-card mmd-mt-24">
      <div className="mmd-card-header"><h3 className="mmd-card-title">Trouver un cabinet</h3></div>
      {cabinetsError && <div className="mmd-alert mmd-alert-warning">Erreur: <b>{cabinetsError}</b></div>}
      <div className="mmd-grid mmd-grid-3 mmd-mb-16">
        <div><label className="mmd-label">Recherche</label><input className="mmd-input" value={cabinetQuery} onChange={(e) => setCabinetQuery(e.target.value)} placeholder="Nom / Spécialité / Médecin" /></div>
        <div><label className="mmd-label">Ville</label><select className="mmd-select" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}><option value="Toutes">Toutes</option>{MAROC_VILLES.map((v) => <option key={v} value={v}>{v}</option>)}</select></div>
        <div style={{ display: "flex", alignItems: "flex-end" }}><button className="mmd-btn mmd-btn-secondary" onClick={() => { setCabinetQuery(""); setSelectedCity("Toutes"); }}>Réinitialiser</button></div>
      </div>
      {cabinetsLoading ? (
        <div className="mmd-text-muted">Chargement...</div>
      ) : filteredCabinets.length === 0 ? (
        <div className="mmd-text-muted">Aucun cabinet trouvé.</div>
      ) : (
        <div className="mmd-grid mmd-grid-3" style={{ gap: 16 }}>
          {filteredCabinets.map((c) => (
            <div key={c.id} className="mmd-card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{c.nom}</div>
              <div className="mmd-text-muted" style={{ fontSize: 13, marginBottom: 4 }}>Dr: {c.medecinNom ?? "—"}</div>
              <div style={{ fontSize: 14, marginBottom: 4 }}>Spécialité: {c.specialite}</div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>{c.adresse}</div>
              <div className="mmd-flex mmd-gap-12">
                <button className="mmd-btn mmd-btn-primary mmd-btn-sm" onClick={() => openRdvModal(c)}>Prendre un RDV</button>
                <button className="mmd-btn mmd-btn-info mmd-btn-sm" onClick={() => openGoogleMapsDirections(c)}>Y aller</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const userInitials = `${user?.nom?.charAt(0) || ""}${user?.prenom?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="mmd-dashboard-wrapper">
      <aside className={`mmd-sidebar ${isSidebarCollapsed ? "mmd-sidebar--collapsed" : ""}`}>
        <div className="mmd-sidebar-header">
          <div className="mmd-logo">
            <div className="mmd-logo-icon"><img src="/images/brand.png" alt="MediManage" style={{ width: 28, height: 28, objectFit: "contain" }} /></div>
            {!isSidebarCollapsed && <span className="mmd-logo-text">MediManage</span>}
          </div>
        </div>
        <nav className="mmd-sidebar-nav">
          {navItems.map(({ key, label, icon }) => (
            <button key={key}
              className={`mmd-nav-item ${activeSection === key ? "mmd-nav-item--active" : ""}`}
              onClick={() => setActiveSection(key)}
              title={label}
            >
              <span className="mmd-nav-icon"><i className={`bi ${icon}`}></i></span>
              {!isSidebarCollapsed && <span className="mmd-nav-label">{label}</span>}
              {key === "messages" && !isSidebarCollapsed && unreadCount > 0 && (
                <span className="mmd-nav-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="mmd-sidebar-footer">
          <button className="mmd-logout-btn" onClick={async () => { await logout(); navigate("/login"); }} title="Déconnexion">
            <span className="mmd-nav-icon"><i className="bi bi-box-arrow-right"></i></span>
            {!isSidebarCollapsed && <span className="mmd-nav-label">Déconnexion</span>}
          </button>
        </div>
      </aside>

      <button type="button" className="mmd-sidebar-toggle" aria-label="Toggle sidebar" onClick={() => setIsSidebarCollapsed((v) => !v)}>
        <i className={`bi ${isSidebarCollapsed ? "bi-chevron-double-right" : "bi-chevron-double-left"}`}></i>
      </button>

      <div className="mmd-main-container">
        <header className="mmd-topbar">
          <div className="mmd-topbar-left">
            <div className="mmd-search-box">
              <i className="bi bi-search"></i>
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mmd-search-input" />
            </div>
          </div>
          <div className="mmd-topbar-right">
            <div style={{ position: "relative" }}>
              <button className="mmd-topbar-icon-btn" aria-label="Notifications" onClick={toggleDropdown}>
                <i className="bi bi-bell"></i>
                {unreadCount > 0 && <span className="mmd-notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
              </button>
              {dropdownOpen && <NotificationDropdown onClose={closeDropdown} />}
            </div>
            <div className="mmd-profile-dropdown">
              <button className="mmd-profile-btn" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <div className="mmd-user-avatar">{userInitials}</div>
                <div className="mmd-user-info">
                  <span className="mmd-user-name">{user?.nom} {user?.prenom}</span>
                  <span className="mmd-user-role">Patient</span>
                </div>
                <i className="bi bi-chevron-down" style={{ color: "var(--text-secondary)" }}></i>
              </button>
              {isProfileOpen && (
                <div className="mmd-profile-menu">
                  <button className="mmd-profile-menu-item" onClick={() => { setActiveSection("profil"); setIsProfileOpen(false); }}><i className="bi bi-person-circle"></i><span>Mon Profil</span></button>
                  <button className="mmd-profile-menu-item" onClick={() => { setActiveSection("rdv"); setIsProfileOpen(false); }}><i className="bi-calendar-check-fill"></i><span>Mes Rendez-vous</span></button>
                  <button className="mmd-profile-menu-item" onClick={() => { setActiveSection("consultations"); setIsProfileOpen(false); }}><i className="bi-heart-pulse-fill"></i><span>Consultations</span></button>
                  <button className="mmd-profile-menu-item" onClick={() => { setActiveSection("cabinets"); setIsProfileOpen(false); }}><i className="bi-building-fill"></i><span>Cabinets</span></button>
                  <button className="mmd-profile-menu-item" onClick={() => { setActiveSection("messages"); setIsProfileOpen(false); }}>
                    <i className="bi-chat-dots-fill"></i><span>Messages</span>
                    {unreadCount > 0 && <span className="mmd-profile-badge">{unreadCount}</span>}
                  </button>
                  <div className="mmd-profile-menu-divider"></div>
                  <button className="mmd-profile-menu-item mmd-profile-menu-item--danger" onClick={async () => { await logout(); navigate("/login"); }}><i className="bi bi-box-arrow-right"></i><span>Déconnexion</span></button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mmd-content-wrapper">
          {activeSection === "profil" && renderProfilSection()}
          {activeSection === "rdv" && renderRdvSection()}
          {activeSection === "consultations" && renderConsultationsSection()}
          {activeSection === "cabinets" && renderCabinetsSection()}
          {activeSection === "messages" && <MessagingPage />}
        </main>
      </div>

      {/* Consultation View Modal */}
      {consultationViewOpen && (
        <div className="mmd-modal-overlay"><div className="mmd-modal" style={{ maxWidth: 720 }}>
          <div className="mmd-modal-header"><h5 className="mmd-modal-title">Détails Consultation</h5><button className="mmd-modal-close" onClick={() => { setConsultationViewOpen(false); setConsultationView(null); }}>&times;</button></div>
          <div className="mmd-modal-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{consultationView?.date_consultation ?? "—"}</div>
            <div className="mmd-mb-16"><b>Médecin:</b> {consultationView?.medecinNom ?? "—"}</div>
            <div className="mmd-mb-16"><b>Cabinet:</b> {consultationView?.cabinetNom ?? "—"}</div>
            <div className="mmd-mb-16"><b>Montant:</b> {consultationView?.montant ?? "—"}</div>
            <div className="mmd-mb-16"><b>Mode paiement:</b> {consultationView?.mode_paiement ?? "—"}</div>
            <div className="d-flex align-items-center gap-4"><b>Ordonnance:</b><p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{consultationView?.ordonnance ?? "—"}</p></div>
          </div>
          <div className="mmd-modal-footer"><button className="mmd-btn mmd-btn-secondary" onClick={() => { setConsultationViewOpen(false); setConsultationView(null); }}>Fermer</button></div>
        </div></div>
      )}

      {messageModal.open && (
        <div className="mmd-modal-overlay"><div className="mmd-modal" style={{ maxWidth: 520 }}>
          <div className="mmd-modal-header"><h5 className="mmd-modal-title">{messageModal.title}</h5><button className="mmd-modal-close" onClick={closeMessageModal}>&times;</button></div>
          <div className="mmd-modal-body"><div className={`mmd-alert ${messageModal.variant === "success" ? "mmd-alert-success" : messageModal.variant === "warning" ? "mmd-alert-warning" : messageModal.variant === "danger" ? "mmd-alert-danger" : "mmd-alert-info"}`} style={{ marginBottom: 0 }}>{messageModal.body}</div></div>
          <div className="mmd-modal-footer"><button className="mmd-btn mmd-btn-primary" onClick={closeMessageModal}>{messageModal.actionLabel}</button></div>
        </div></div>
      )}

      {rdvModalOpen && (
        <div className="mmd-modal-overlay"><div className="mmd-modal" style={{ maxWidth: 560 }}>
          <div className="mmd-modal-header"><h5 className="mmd-modal-title">Prendre un RDV</h5><button ref={modalCloseBtnRef} className="mmd-modal-close" onClick={closeRdvModal} disabled={rdvSubmitting}>&times;</button></div>
          <div className="mmd-modal-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{rdvCabinet?.nom} <span className="mmd-text-muted">- Dr {rdvCabinet?.medecinNom ?? "—"}</span></div>
            <div className="mmd-form-group"><label className="mmd-label">Date</label><input type="date" className="mmd-input" value={rdvForm.dateRdv} onChange={(e) => setRdvForm((p) => ({ ...p, dateRdv: e.target.value }))} min={new Date().toISOString().slice(0, 10)} disabled={rdvSubmitting} /></div>
            <div className="mmd-grid mmd-grid-2" style={{ gap: 16 }}>
              <div className="mmd-form-group"><label className="mmd-label">Heure début</label><input type="time" className="mmd-input" value={rdvForm.heureDebut} onChange={(e) => setRdvForm((p) => ({ ...p, heureDebut: e.target.value }))} disabled={rdvSubmitting} /></div>
              <div className="mmd-form-group"><label className="mmd-label">Heure fin</label><input type="time" className="mmd-input" value={rdvForm.heureFin} onChange={(e) => setRdvForm((p) => ({ ...p, heureFin: e.target.value }))} disabled={rdvSubmitting} /></div>
            </div>
            <div className="mmd-form-group"><label className="mmd-label">Motif</label><select className="mmd-select" value={rdvForm.motif} onChange={(e) => setRdvForm((p) => ({ ...p, motif: e.target.value }))} disabled={rdvSubmitting}>{MOTIFS_RDV.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
          </div>
          <div className="mmd-modal-footer"><button className="mmd-btn mmd-btn-secondary" onClick={closeRdvModal} disabled={rdvSubmitting}>Annuler</button><button className="mmd-btn mmd-btn-primary" onClick={submitRdv} disabled={rdvSubmitting}>{rdvSubmitting ? "Envoi..." : "Confirmer"}</button></div>
        </div></div>
      )}
    </div>
  );
};

export default PatientDashboard;
