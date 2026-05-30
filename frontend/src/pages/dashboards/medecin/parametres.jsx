import { useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import api from "../../../api/axios";

const ParametresPage = () => {

  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    telephone: user?.telephone || ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const updateProfile = async () => {
    try {
      await api.put("/profile", formData);
      alert("Profil mis à jour !");
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <h4>Paramètres du Profil</h4>

      <div className="mb-3">
        <label>Nom</label>
        <input
          name="nom"
          className="form-control"
          value={formData.nom}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label>Prénom</label>
        <input
          name="prenom"
          className="form-control"
          value={formData.prenom}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label>Téléphone</label>
        <input
          name="telephone"
          className="form-control"
          value={formData.telephone}
          onChange={handleChange}
        />
      </div>

      <button className="btn btn-primary" onClick={updateProfile}>
        Sauvegarder
      </button>
    </div>
  );
};

export default ParametresPage;