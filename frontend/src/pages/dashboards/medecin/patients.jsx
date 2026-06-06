import { useState, useEffect } from "react";
import api from "../../../api/axios";
import "./patients.css";

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAge, setFilterAge] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    date_naissance: "",
    genre: "M",
    adresse: "",
    ville: "",
    codepostal: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get("/patients");
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      `${patient.user?.nom} ${patient.user?.prenom}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      patient.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const age = patient.date_naissance
      ? new Date().getFullYear() - new Date(patient.date_naissance).getFullYear()
      : 0;
    const matchesAge =
      filterAge === "all" ||
      (filterAge === "child" && age < 18) ||
      (filterAge === "adult" && age >= 18 && age < 65) ||
      (filterAge === "elderly" && age >= 65);

    const matchesGender =
      filterGender === "all" || patient.user?.genre === filterGender;

    return matchesSearch && matchesAge && matchesGender;
  });

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const handleOpenModal = (patient = null) => {
    if (patient) {
      setEditingId(patient.id);
      setFormData({
        nom: patient.user?.nom || "",
        prenom: patient.user?.prenom || "",
        email: patient.user?.email || "",
        telephone: patient.user?.telephone || "",
        date_naissance: patient.date_naissance || "",
        genre: patient.user?.genre || "M",
        adresse: patient.adresse || "",
        ville: patient.ville || "",
        codepostal: patient.codepostal || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        date_naissance: "",
        genre: "M",
        adresse: "",
        ville: "",
        codepostal: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting patient:", formData);
    handleCloseModal();
    await fetchPatients();
  };

  const handleDelete = async (patientId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient?")) {
      try {
        const response = await fetch(`/api/patient/${patientId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchPatients();
        }
      } catch (error) {
        console.error("Error deleting patient:", error);
      }
    }
  };

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return "-";
    const age = new Date().getFullYear() - new Date(dateNaissance).getFullYear();
    return age;
  };

  const getAgeGroup = (age) => {
    if (age < 18) return "Enfant";
    if (age < 65) return "Adulte";
    return "Senior";
  };

  return (
    <div className="patients-container">
      <div className="patients-header">
        <div>
          <h1 className="patients-title">Gestion des Patients</h1>
          <p className="patients-subtitle">
            Total: {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="mmd-btn mmd-btn-primary"
          onClick={() => handleOpenModal()}
        >
          <i className="bi bi-plus-lg"></i>
          Ajouter un patient
        </button>
      </div>

      <div className="patients-filters">
        <div className="filter-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Âge</label>
          <select
            value={filterAge}
            onChange={(e) => {
              setFilterAge(e.target.value);
              setCurrentPage(1);
            }}
            className="mmd-select"
          >
            <option value="all">Tous</option>
            <option value="child">Enfants (&lt; 18 ans)</option>
            <option value="adult">Adultes (18-64 ans)</option>
            <option value="elderly">Seniors (≥ 65 ans)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Genre</label>
          <select
            value={filterGender}
            onChange={(e) => {
              setFilterGender(e.target.value);
              setCurrentPage(1);
            }}
            className="mmd-select"
          >
            <option value="all">Tous</option>
            <option value="M">Homme</option>
            <option value="F">Femme</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="patients-loading">
          <div className="mmd-loading">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p>Chargement des patients...</p>
        </div>
      ) : paginatedPatients.length === 0 ? (
        <div className="patients-empty">
          <i className="bi bi-inbox"></i>
          <h3>Aucun patient trouvé</h3>
          <p>Commencez par ajouter un nouveau patient</p>
        </div>
      ) : (
        <div className="mmd-card">
          <table className="mmd-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Âge</th>
                <th>Genre</th>
                <th>Ville</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.map((patient) => {
                const age = calculateAge(patient.date_naissance);
                return (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-name">
                        <div className="patient-avatar">
                          {patient.user?.nom?.charAt(0)}
                          {patient.user?.prenom?.charAt(0)}
                        </div>
                        <div>
                          <strong>{patient.user?.nom} {patient.user?.prenom}</strong>
                          {age !== "-" && (
                            <span className="patient-subtext">
                              {getAgeGroup(age)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${patient.user?.email}`}>
                        {patient.user?.email}
                      </a>
                    </td>
                    <td>
                      <a href={`tel:${patient.user?.telephone}`}>
                        {patient.user?.telephone || "-"}
                      </a>
                    </td>
                    <td>
                      {age !== "-" && (
                        <span className="mmd-badge mmd-badge-info">
                          {age} ans
                        </span>
                      )}
                    </td>
                    <td>
                      {patient.user?.genre === "M" ? (
                        <span>
                          <i className="bi bi-gender-male me-1"></i>Homme
                        </span>
                      ) : (
                        <span>
                          <i className="bi bi-gender-female me-1"></i>Femme
                        </span>
                      )}
                    </td>
                    <td>{patient.ville || "-"}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          className="mmd-btn mmd-btn-sm"
                          onClick={() => handleOpenModal(patient)}
                          title="Modifier"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="mmd-btn mmd-btn-sm mmd-btn-danger"
                          onClick={() => handleDelete(patient.id)}
                          title="Supprimer"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="mmd-btn mmd-btn-secondary mmd-btn-sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i> Précédent
              </button>
              <span className="pagination-info">
                Page {currentPage} / {totalPages}
              </span>
              <button
                className="mmd-btn mmd-btn-secondary mmd-btn-sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="mmd-modal-overlay" onClick={handleCloseModal}>
          <div className="mmd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mmd-modal-header">
              <h3 className="mmd-modal-title">
                {editingId ? "Modifier le patient" : "Ajouter un patient"}
              </h3>
              <button
                className="mmd-modal-close"
                onClick={handleCloseModal}
                aria-label="Fermer"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mmd-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Nom</label>
                    <input
                      type="text"
                      className="mmd-input"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Prénom</label>
                    <input
                      type="text"
                      className="mmd-input"
                      value={formData.prenom}
                      onChange={(e) =>
                        setFormData({ ...formData, prenom: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Email</label>
                  <input
                    type="email"
                    className="mmd-input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Téléphone</label>
                    <input
                      type="tel"
                      className="mmd-input"
                      value={formData.telephone}
                      onChange={(e) =>
                        setFormData({ ...formData, telephone: e.target.value })
                      }
                    />
                  </div>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Date de naissance</label>
                    <input
                      type="date"
                      className="mmd-input"
                      value={formData.date_naissance}
                      onChange={(e) =>
                        setFormData({ ...formData, date_naissance: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Genre</label>
                    <select
                      className="mmd-select"
                      value={formData.genre}
                      onChange={(e) =>
                        setFormData({ ...formData, genre: e.target.value })
                      }
                    >
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </div>
                  <div className="mmd-form-group">
                    <label className="mmd-label">Ville</label>
                    <input
                      type="text"
                      className="mmd-input"
                      value={formData.ville}
                      onChange={(e) =>
                        setFormData({ ...formData, ville: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Adresse</label>
                  <input
                    type="text"
                    className="mmd-input"
                    value={formData.adresse}
                    onChange={(e) =>
                      setFormData({ ...formData, adresse: e.target.value })
                    }
                  />
                </div>

                <div className="mmd-form-group">
                  <label className="mmd-label">Code Postal</label>
                  <input
                    type="text"
                    className="mmd-input"
                    value={formData.codepostal}
                    onChange={(e) =>
                      setFormData({ ...formData, codepostal: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mmd-modal-footer">
                <button
                  type="button"
                  className="mmd-btn mmd-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Annuler
                </button>
                <button type="submit" className="mmd-btn mmd-btn-primary">
                  {editingId ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
