import { useEffect, useState } from "react";
import api from "../../../api/axios";

const PatientsPage = () => {

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const patientsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.log(err);
    }
  };


  const filteredPatients = patients.filter((p) =>
    `${p.user?.nom || ""} ${p.user?.prenom || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  /* Pagination */

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage) || 1;

  const startIndex = (currentPage - 1) * patientsPerPage;

  const paginatedPatients = filteredPatients.slice(
    startIndex,
    startIndex + patientsPerPage
  );

  return (
    <div className="card shadow-sm">

      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Liste des Patients</h5>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="card-body">

        {paginatedPatients.length === 0 ? (
          <p>Aucun patient trouvé.</p>
        ) : (
          <>
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Nom complet</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                </tr>
              </thead>
              <tbody>

                {paginatedPatients.map((p, index) => (
                  <tr
                    key={p.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedPatient(p)}
                  >
                    <td>{startIndex + index + 1}</td>
                    <td>{p.user?.nom} {p.user?.prenom}</td>
                    <td>{p.user?.email}</td>
                    <td>{p.user?.telephone}</td>
                  </tr>
                ))}

              </tbody>
            </table>

            <div className="d-flex justify-content-center mt-3">
              <button
                className="btn btn-outline-primary me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Précédent
              </button>

              <span className="align-self-center">
                Page {currentPage} / {totalPages}
              </span>

              <button
                className="btn btn-outline-primary ms-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {selectedPatient && (
          <div className="card mt-4 p-4 bg-light">
            <h5>Détails du Patient</h5>

            <p><strong>Nom :</strong> {selectedPatient.user?.nom} {selectedPatient.user?.prenom}</p>
            <p><strong>Email :</strong> {selectedPatient.user?.email}</p>
            <p><strong>Téléphone :</strong> {selectedPatient.user?.telephone}</p>
            <p><strong>Sexe :</strong> {selectedPatient.sexe}</p>
            <p><strong>Date naissance :</strong> {selectedPatient.date_naissance}</p>
            <p><strong>Adresse :</strong> {selectedPatient.adresse}</p>

            <button
              className="btn btn-secondary mt-2"
              onClick={() => setSelectedPatient(null)}
            >
              Fermer
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientsPage;