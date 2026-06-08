import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import "./paiements.css";

const PAGE_SIZE = 8;

const PaiementsPage = () => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchPaiements();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, statutFilter]);

  const fetchPaiements = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await api.get("/paiements");
      setPaiements(Array.isArray(res.data) ? res.data : []);
    } catch {
      setErrorMsg("Impossible de charger les paiements.");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sf = statutFilter.trim().toLowerCase();

    let result = paiements;

    if (q) {
      result = result.filter((p) => {
        const name = String(p.patient_name ?? "").toLowerCase();
        return name.includes(q);
      });
    }

    if (sf) {
      result = result.filter((p) => {
        const normalized = String(p.statut ?? "").trim().toLowerCase();
        if (sf === "payé" || sf === "paye") return normalized === "payé" || normalized === "paye" || normalized === "valide";
        if (sf === "en_attente") return normalized === "en_attente";
        if (sf === "non_payé" || sf === "non_paye") return normalized === "non_payé" || normalized === "non_paye";
        return true;
      });
    }

    return result;
  }, [paiements, query, statutFilter]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  }, [filteredItems.length]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const getStatusBadge = (statut) => {
    const normalized = String(statut ?? "").trim().toLowerCase();
    const map = {
      paye: { label: "Payé", class: "mmd-badge-success" },
      payé: { label: "Payé", class: "mmd-badge-success" },
      valide: { label: "Payé", class: "mmd-badge-success" },
      en_attente: { label: "En attente", class: "mmd-badge-warning" },
      non_paye: { label: "Non payé", class: "mmd-badge-danger" },
      non_payé: { label: "Non payé", class: "mmd-badge-danger" },
    };
    return map[normalized] || { label: statut || "—", class: "" };
  };

  const getModeLabel = (mode) => {
    const map = {
      espece: "Espèces",
      espèce: "Espèces",
      espèces: "Espèces",
      carte_bancaire: "Carte bancaire",
      "carte bancaire": "Carte bancaire",
      carte: "Carte bancaire",
      cb: "Carte bancaire",
      cheque: "Chèque",
      chèque: "Chèque",
      virement: "Virement",
    };
    const key = String(mode ?? "").trim().toLowerCase();
    return map[key] || mode || "—";
  };

  if (loading) {
    return (
      <div className="paiements-container">
        <div className="paiements-loading">
          <div>
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p>Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paiements-container">
      <div className="paiements-header">
        <div>
          <h1 className="paiements-title">Paiements</h1>
          <p className="paiements-subtitle">
            {filteredItems.length} paiement{filteredItems.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="paiements-alert paiements-alert--error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="paiements-filters">
        <div className="paiements-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="mmd-select mmd-select-filter"
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="payé">Payé</option>
          <option value="en_attente">En attente</option>
          <option value="non_payé">Non payé</option>
        </select>
      </div>

      <div className="paiements-table-card">
        {paginatedItems.length === 0 ? (
          <div className="paiements-empty">
            <i className="bi bi-cash-stack"></i>
            <h3>Aucun paiement</h3>
            <p>Aucun paiement trouvé pour le moment.</p>
          </div>
        ) : (
          <>
            <table className="mmd-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Mode paiement</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((p) => (
                  <tr key={p.id}>
                    <td>{p.patient_name || "—"}</td>
                    <td>{p.montant} DH</td>
                    <td>{p.date_paiement}</td>
                    <td>{getModeLabel(p.mode_paiement)}</td>
                    <td>
                      <span className={`mmd-badge ${getStatusBadge(p.statut).class}`}>
                        {getStatusBadge(p.statut).label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pageCount > 1 && (
              <div className="paiements-pagination">
                <button
                  className="mmd-btn mmd-btn-secondary mmd-btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <i className="bi bi-chevron-left"></i> Précédent
                </button>
                <span className="paiements-pagination-info">
                  Page {page} / {pageCount}
                </span>
                <button
                  className="mmd-btn mmd-btn-secondary mmd-btn-sm"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page >= pageCount}
                >
                  Suivant <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaiementsPage;
