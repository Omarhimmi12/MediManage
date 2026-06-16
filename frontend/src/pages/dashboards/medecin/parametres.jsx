import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import api from "../../../api/axios";
import AlertModal from "../../../components/AlertModal";
import "./parametres.css";

const ParametresPage = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    specialite: user?.medecin?.specialite || "",    
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEdit = () => {
    setForm({
      nom: user?.nom || "",
      prenom: user?.prenom || "",
      email: user?.email || "",
      telephone: user?.telephone || "",
      specialite: user?.medecin?.specialite || "",      
    });
    setAlert(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setAlert(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const res = await api.put("/profile/update", form);
      setUser(res.data.data);
      setAlert({ type: "success", message: "Profil mis à jour avec succès." });
      setEditing(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Erreur lors de la mise à jour du profil.";
      setAlert({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/account");
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Erreur lors de la suppression du compte.";
      setAlert({ type: "error", message: msg });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const displayValue = (val) => val || "—";

  return (
    <div className="parametres-container">
      <div className="parametres-header">
        <h1 className="parametres-title">Paramètres</h1>
        <p className="parametres-subtitle">
          Gérez vos informations personnelles et votre compte
        </p>
      </div>

      <AlertModal
        isOpen={alert !== null}
        title={alert?.type === "success" ? "Succès" : "Erreur"}
        message={alert?.message || ""}
        variant={alert?.type === "success" ? "success" : "danger"}
        onClose={() => setAlert(null)}
      />

      <div className="parametres-card">
        <h2 className="parametres-section-title">Profil médecin</h2>

        {!editing ? (
          <div className="parametres-readonly">
            <div className="parametres-info-grid">
              <div className="parametres-info-item">
                <span className="parametres-info-label">Nom</span>
                <span className="parametres-info-value">
                  {displayValue(user?.nom)}
                </span>
              </div>
              <div className="parametres-info-item">
                <span className="parametres-info-label">Prénom</span>
                <span className="parametres-info-value">
                  {displayValue(user?.prenom)}
                </span>
              </div>
              <div className="parametres-info-item">
                <span className="parametres-info-label">Email</span>
                <span className="parametres-info-value">
                  {displayValue(user?.email)}
                </span>
              </div>
              <div className="parametres-info-item">
                <span className="parametres-info-label">Téléphone</span>
                <span className="parametres-info-value">
                  {displayValue(user?.telephone)}
                </span>
              </div>              
            </div>
           
            <div className="parametres-actions">
              <button
                type="button"
                className="mmd-btn mmd-btn-primary"
                onClick={startEdit}
              >
                <i className="bi bi-pencil"></i> Modifier
              </button>
              <button
                type="button"
                className="mmd-btn mmd-btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <i className="bi bi-trash"></i> Supprimer
              </button>
            </div>
          </div>
        ) : (
          /* ---- EDIT FORM ---- */
          <form onSubmit={handleSave}>
            <div className="parametres-form-grid">
              <div className="mmd-form-group">
                <label className="mmd-label">Nom</label>
                <input name="nom" value={form.nom}  onChange={handleChange}
                  className="mmd-input" required
                />
              </div>
              <div className="mmd-form-group">
                <label className="mmd-label">Prénom</label>
                <input name="prenom" value={form.prenom}
                  onChange={handleChange} className="mmd-input"
                />
              </div>
              <div className="mmd-form-group">
                <label className="mmd-label">Email</label>
                <input type="email" name="email"
                  value={form.email} onChange={handleChange}
                  className="mmd-input" required
                />
              </div>
              <div className="mmd-form-group">
                <label className="mmd-label">Téléphone</label>
                <input name="telephone" value={form.telephone}
                  onChange={handleChange} className="mmd-input" required
                />
              </div>
              
            </div>


            <div className="parametres-actions">
              <button type="submit"
                className="mmd-btn mmd-btn-primary" disabled={loading}
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button type="button" className="mmd-btn mmd-btn-secondary"
                onClick={cancelEdit} disabled={loading}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="parametres-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="parametres-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="parametres-modal-title">Confirmer la suppression</h3>
            <p className="parametres-modal-text">
              Êtes-vous sûr de vouloir supprimer définitivement votre compte ?
              Cette action est <strong>irréversible</strong> et supprimera :
            </p>
            <ul className="parametres-modal-list">
              <li>Votre compte médecin</li>
              <li>Votre cabinet</li>
              <li>Tous les comptes secrétaires associés</li>
              <li>Tous les rendez-vous</li>
              <li>Toutes les consultations et paiements</li>
            </ul>
            <div className="parametres-modal-actions">
              <button
                className="mmd-btn mmd-btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Suppression..." : "Supprimer définitivement"}
              </button>
              <button
                className="mmd-btn mmd-btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParametresPage;
