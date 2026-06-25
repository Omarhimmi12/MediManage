import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import ConfirmModal from "../../../components/ConfirmModal";

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { per_page: 50 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get("/admin/users", { params });
      setUsers(res.data?.data ?? []);
    } catch (err) {
      setMessage({ type: "danger", text: "Erreur chargement utilisateurs" });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      nom: user.nom,
      prenom: user.prenom || "",
      email: user.email,
      telephone: user.telephone || "",
      role: user.role,
      password: "",
    });
  };

  const closeEdit = () => {
    setEditUser(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitEdit = async () => {
    if (!editUser) return;
    try {
      setSubmitting(true);
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      await api.put(`/admin/users/${editUser.id}`, payload);
      setMessage({ type: "success", text: "Utilisateur mis à jour ✅" });
      closeEdit();
      fetchUsers();
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur mise à jour";
      setMessage({ type: "danger", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteUser = (id, name) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/admin/users/${deleteConfirm.id}`);
      setMessage({ type: "success", text: "Utilisateur supprimé" });
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      setMessage({ type: "danger", text: err?.response?.data?.message || "Erreur suppression" });
      setDeleteConfirm(null);
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      admin: "admin-badge admin-badge-danger",
      medecin: "admin-badge admin-badge-info",
      secretaire: "admin-badge admin-badge-warning",
    };
    const labels = {
      admin: "Admin",
      medecin: "Médecin",
      secretaire: "Secrétaire",
    };
    return <span className={map[role] || "admin-badge admin-badge-secondary"}>{labels[role] || role}</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Gestion des utilisateurs</h2>
        <p className="admin-page-subtitle">Médecins, secrétaires et admins</p>
      </div>

      {message.text && (
        <div className={`admin-alert admin-alert-${message.type}`}>
          {message.text}
          <button className="admin-alert-close" onClick={() => setMessage({ type: "", text: "" })}>&times;</button>
        </div>
      )}

      <div className="admin-filters">
        <div className="admin-search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
        </div>
        <select
          className="admin-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="medecin">Médecin</option>
          <option value="secretaire">Secrétaire</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty">Aucun utilisateur trouvé</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Téléphone</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-avatar-sm">
                        {((u.nom?.[0] || "") + (u.prenom?.[0] || "")).toUpperCase()}
                      </div>
                    <div>
                        <div className={`admin-user-name ${u.role === "admin" ? "admin-user-name--gold" : ""}`}>{u.role === "medecin" ? `Dr. ${u.nom} ${u.prenom}` : `${u.nom} ${u.prenom}`}</div>
                        <div className="admin-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td>{u.telephone || "—"}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-btn admin-btn-sm admin-btn-ghost" onClick={() => openEdit(u)} title="Modifier">
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      {u.role !== "admin" && (
                        <button className="admin-btn admin-btn-sm admin-btn-danger-ghost" onClick={() => confirmDeleteUser(u.id, `${u.nom} ${u.prenom}`)} title="Supprimer">
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Confirmer la suppression"
        message={deleteConfirm ? `Supprimer ${deleteConfirm.name} ? Cette action est irréversible.` : ""}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Edit Modal */}
      {editUser && (
        <div className="admin-modal-overlay" onClick={closeEdit}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Modifier {editUser.nom} {editUser.prenom}</h3>
              <button className="admin-modal-close" onClick={closeEdit}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-label">Nom</label>
                <input className="admin-input" name="nom" value={editForm.nom} onChange={handleEditChange} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Prénom</label>
                <input className="admin-input" name="prenom" value={editForm.prenom} onChange={handleEditChange} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Email</label>
                <input className="admin-input" name="email" value={editForm.email} onChange={handleEditChange} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Téléphone</label>
                <input className="admin-input" name="telephone" value={editForm.telephone} onChange={handleEditChange} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Rôle</label>
                <select className="admin-select" name="role" value={editForm.role} onChange={handleEditChange}>
                  <option value="admin">Admin</option>
                  <option value="medecin">Médecin</option>
                  <option value="secretaire">Secrétaire</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Mot de passe (laisser vide pour ne pas changer)</label>
                <input className="admin-input" name="password" type="password" value={editForm.password} onChange={handleEditChange} placeholder="Nouveau mot de passe" />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={closeEdit}>Annuler</button>
              <button className="admin-btn admin-btn-primary" onClick={submitEdit} disabled={submitting}>
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;
