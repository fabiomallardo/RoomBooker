import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import "./Home.css";

const STRUTTURA_ENDPOINT = "http://localhost:4000/struttura";
const FILTERS = ["Hotel", "Appartamenti", "Bed & Breakfast", "Cottage"];

export default function Home() {
  const [strutture, setStrutture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStrutture = async () => {
      try {
        const res = await fetch(STRUTTURA_ENDPOINT);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setStrutture(data);
      } catch (err) {
        toast.error("Errore durante il recupero delle strutture");
      } finally {
        setLoading(false);
      }
    };

    fetchStrutture();
  }, []);

  const filtered = filter
    ? strutture.filter(({ type }) => type === filter)
    : strutture;

  const filterTitle = filter ? `${filter}` : "Tutte le Strutture";

  const handleFilterClick = (type) => setFilter(type);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
        <ClipLoader color="#dc3545" size={40} />
      </div>
    );
  }

  return (
    <div className="container mt-5 home-page">
      {/* Titolo */}
      <div className="text-center mb-5">
        <h2 className="home-title">
          <span className="highlight">{filterTitle}</span>
        </h2>
        <p className="subtitle">Scopri e prenota la tua prossima esperienza</p>
      </div>

      {/* Filtri */}
      <div className="text-center mb-5">
        <button
          className={`btn me-2 mb-2 ${filter === "" ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() => handleFilterClick("")}
        >
          Tutti
        </button>
        {FILTERS.map((type) => (
          <button
            key={type}
            className={`btn me-2 mb-2 ${filter === type ? "btn-danger" : "btn-outline-danger"}`}
            onClick={() => handleFilterClick(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Lista strutture */}
      {filtered.length === 0 ? (
        <div className="text-center mt-5">
          <h4 className="text-muted">😢 Nessuna struttura trovata per: <strong>{filter}</strong></h4>
          <button className="btn btn-outline-danger mt-3" onClick={() => setFilter("")}>
            🔁 Torna alla lista completa
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filtered.map(({ _id, name, city, country, pricePerNight, type, images }) => (
            <div key={_id} className="col">
              <div className="card struttura-card h-100 shadow-sm border-0">
                <div className="position-relative struttura-img-wrapper">
                  <img
                    src={images?.[0]}
                    alt={name}
                    className="card-img-top struttura-img"
                    onClick={() => navigate(`/struttura/${_id}`)}
                    style={{ cursor: "pointer" }}
                  />
                  <span className="badge struttura-type bg-danger">
                    {type}
                  </span>
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{name}</h5>
                  <p className="card-text text-muted">{city}, {country}</p>
                  <div className="mt-auto">
                    <span className="price-tag">💶 €{pricePerNight}</span>
                    <small className="text-muted"> / notte</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
