import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import L from "leaflet";
import "./DettaglioStruttura.css";
import "leaflet/dist/leaflet.css";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";



export default function DettaglioStruttura() {
  const { id } = useParams();
  const [struttura, setStruttura] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [booking, setBooking] = useState({ checkIn: "", checkOut: "", guests: 1 });
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [userId, setUserId] = useState(null);
  const [showBookings, setShowBookings] = useState(false);
  const [strutturaBookings, setStrutturaBookings] = useState([]);


  const mapRef = useRef(null);
  const modalMapRef = useRef(null);
  const coordinatesRef = useRef(null);
  const touchStartX = useRef(null);

  const openCageApiKey = process.env.REACT_APP_OPENCAGE_API_KEY;

  useEffect(() => {
    const fetchStrutturaDetails = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/struttura/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setStruttura(data);
        setMainImage(data.images?.[0] || null);
      } catch {
        toast.error("Errore durante il recupero dei dettagli");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/struttura/${id}/reviews`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setReviews(data);
      } catch {
        toast.error("Errore nel caricamento delle recensioni");
      }
    };

    const getUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserId(data.customerId);
      } catch {
        console.error("Errore autenticazione");
      }
    };

    fetchStrutturaDetails();
    fetchReviews();
    getUser();

    const saved = localStorage.getItem(`booking-${id}`);
    if (saved) setBooking(JSON.parse(saved));
  }, [id]);

  useEffect(() => {
    if (!struttura) return;

    const fetchCoordinates = async () => {
      try {
        const address = `${struttura.address}, ${struttura.city}, ${struttura.country}`;
        const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${openCageApiKey}`);
        const data = await res.json();
        if (data.status.code !== 200 || !data.results.length) throw new Error();
        const { lat, lng } = data.results[0].geometry;
        coordinatesRef.current = { lat, lng };

        requestAnimationFrame(() => {
          const mapElement = document.getElementById("map");
          if (!mapElement) return;
          if (!mapRef.current) {
            mapRef.current = createMap("map", lat, lng);
          } else {
            mapRef.current.setView([lat, lng], 15);
          }
        });
      } catch {
        toast.error("Errore nel caricamento della mappa");
      }
    };

    fetchCoordinates();
  }, [struttura, openCageApiKey]);

  const createMap = (id, lat, lng, interactive = false) => {
    const map = L.map(id, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const defaultIcon = new L.Icon({
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
    marker.bindPopup(struttura.name);
    return map;
  };

  const openModalMap = () => {
    setShowMapModal(true);
    setTimeout(() => {
      const el = document.getElementById("fullscreenMap");
      if (!el || modalMapRef.current || !coordinatesRef.current) return;
      const { lat, lng } = coordinatesRef.current;
      modalMapRef.current = createMap("fullscreenMap", lat, lng, true);
    }, 300);
  };

  const closeModalMap = () => {
    if (modalMapRef.current) {
      modalMapRef.current.remove();
      modalMapRef.current = null;
    }
    setShowMapModal(false);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      const nextIndex = delta < 0 ? fullscreenIndex + 1 : fullscreenIndex - 1;
      if (nextIndex >= 0 && nextIndex < struttura.images.length) {
        setFullscreenIndex(nextIndex);
      }
    }
  };

  const calculateNights = () => {
    const inDate = new Date(booking.checkIn);
    const outDate = new Date(booking.checkOut);
    const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  const navigate = useNavigate();

  const handleBooking = async () => {
    const { checkIn, checkOut, guests } = booking;
    const nights = calculateNights();

    if (!checkIn || !checkOut || guests < 1 || nights === 0) {
      toast.error("Inserisci date valide e numero ospiti");
      return false;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Devi essere loggato per prenotare");
      return false;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/struttura/${id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ checkIn, checkOut, guests }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem(`booking-${id}`, JSON.stringify(booking));
      toast.success("✅ Prenotazione confermata!");
      return true;
    } catch (err) {
      toast.error("Data già occupata");
      return false;
    }
  };





  const handleReviewSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Devi essere loggato per recensire");
    if (!newReview.comment.trim() || newReview.rating === 0) {
      return toast.error("Completa tutti i campi");
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/struttura/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newReview),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReviews([...reviews, data]);
      setNewReview({ rating: 0, comment: "" });
      toast.success("Recensione inviata");
    } catch (err) {
      toast.error(err.message || "Errore nell'invio");
    }
  };

  const fetchStrutturaBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Devi essere loggato per vedere le prenotazioni");

      const res = await fetch(`${process.env.REACT_APP_API_URL}/struttura/${id}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStrutturaBookings(data);
      setShowBookings(true);
    } catch (err) {
      toast.error(err.message || "Errore nel caricamento prenotazioni");
    }
  };


  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore nell'eliminazione");
      setReviews(reviews.filter((r) => r._id !== reviewId));
      toast.success("Recensione eliminata");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Devi essere loggato");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Errore durante la cancellazione");

      setStrutturaBookings((prev) => prev.filter((b) => b._id !== bookingId));
      toast.success("Prenotazione annullata");
    } catch (err) {
      toast.error(err.message || "Errore");
    }
  };


  const getAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) return <div className="text-center mt-5">Caricamento...</div>;
  if (!struttura) return <div className="text-center mt-5">⚠️ Dettagli non disponibili</div>;

  const { name, description, address, city, country, pricePerNight, type, images = [] } = struttura;

  return (
    <div className="container dettaglio-struttura">
      {/* Hero */}
      <div className="hero-banner mb-5" style={{ backgroundImage: `url(${mainImage})` }}>
        <div className="overlay p-4">
          <h1 className="text-white">{name}</h1>
          <span className="badge bg-light text-dark fs-6">{type}</span>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-8 order-md-1 order-2">
          <h3 className="mb-3 text-danger">{name}</h3>
          <p className="text-muted">{description}</p>
          <ul className="list-unstyled mb-4">
            <li><strong>📍 Indirizzo:</strong> {address}, {city}, {country}</li>
            <li><strong>💶 Prezzo per notte:</strong> €{pricePerNight}</li>
          </ul>

          <div className="row">
            {images.map((img, i) => (
              <div className="col-4 col-sm-3 mb-3" key={i}>
                <img
                  src={img}
                  alt={`Img ${i}`}
                  className={`img-fluid rounded thumb-image ${mainImage === img ? "active" : ""}`}
                  onClick={() => setFullscreenIndex(i)}
                />
              </div>
            ))}
          </div>



          <div className="mt-5">
            <h4 className="d-flex align-items-center gap-2">
              ⭐ Recensioni ({reviews.length})
              {reviews.length > 0 && (
                <span className="badge bg-warning text-dark">
                  Media: {getAverageRating()} / 5.0
                </span>
              )}
            </h4>


            {reviews.length === 0 ? (
              <p>Nessuna recensione disponibile.</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="border p-3 mb-3 rounded shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={review.customerId?.profileImg || "/default-avatar.png"}
                        alt="avatar"
                        className="rounded-circle"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                      <div>
                        <strong>{review.customerId?.firstName} {review.customerId?.lastName}</strong><br />
                        <span>Voto: {review.rating} / 5</span>
                      </div>
                    </div>
                    {review.customerId?._id === userId && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        Elimina
                      </button>
                    )}
                  </div>
                  <p className="mb-0 mt-2">{review.comment}</p>
                  {review.createdAt && (
                    <small className="text-muted">
                      {format(new Date(review.createdAt), "dd MMMM yyyy", { locale: it })}
                    </small>
                  )}
                </div>
              ))
            )}

            {/* Nuova recensione */}
            <div className="mt-4">
              <h5>Lascia una recensione</h5>
              <div className="my-2 d-flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    onClick={() => setNewReview({ ...newReview, rating: n })}
                    style={{
                      cursor: "pointer",
                      fontSize: "1.5rem",
                      color: n <= newReview.rating ? "#fbc02d" : "#ccc"
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                className="form-control mb-2"
                rows="3"
                placeholder="Scrivi il tuo commento..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              />
              <button className="btn btn-danger" onClick={handleReviewSubmit}>Invia Recensione</button>
            </div>
          </div>



        </div>

        <div className="col-md-4 order-md-2 order-1">
          <div id="map" className="map-preview mb-3" onClick={openModalMap} />
          <div className="card p-3 shadow-sm booking-form">
            <h5>📅 Prenota ora</h5>
            <input type="date" className="form-control my-2" value={booking.checkIn} onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })} />
            <input type="date" className="form-control my-2" value={booking.checkOut} onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })} />
            <input type="number" min="1" className="form-control my-2" value={booking.guests} onChange={(e) => setBooking({ ...booking, guests: parseInt(e.target.value) })} />
            <button
              className="btn btn-danger w-100 mt-2"
              onClick={async () => {
                const success = await handleBooking();
                if (success) {
                  setStrutturaBookings((prev) => [
                    ...prev,
                    {
                      _id: Date.now().toString(),
                      checkIn: booking.checkIn,
                      checkOut: booking.checkOut,
                      guests: booking.guests
                    }
                  ]);
                  setShowBookings(true);
                }
              }}
            >
              📩 Conferma prenotazione
            </button>


            <button
              className="btn btn-outline-dark w-100 mt-2"
              onClick={fetchStrutturaBookings}
            >
              📖 Controlla prenotazioni di questa struttura
            </button>

            {showBookings && (
              <div className="mt-4">
                <h5>Prenotazioni per questa struttura:</h5>

                {strutturaBookings.length === 0 ? (
                  <p className="text-muted">Nessuna prenotazione trovata</p>
                ) : (
                  <>
                    {strutturaBookings.map((b) => {
                      const isOwner = b.customerId === userId || b.customerId?._id === userId;

                      return (
                        <div key={b._id} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-start">
                          <div>
                            <div><strong>🧍 Ospiti:</strong> {b.guests}</div>
                            <div><strong>📅 Dal:</strong> {format(new Date(b.checkIn), "dd MMM yyyy", { locale: it })}</div>
                            <div><strong>📅 Al:</strong> {format(new Date(b.checkOut), "dd MMM yyyy", { locale: it })}</div>
                          </div>

                          {isOwner && (
                            <button
                              className="btn btn-sm btn-outline-danger ms-3"
                              onClick={() => handleCancelBooking(b._id)}
                            >
                              ❌ Annulla
                            </button>
                          )}
                        </div>
                      );
                    })}


                    <div className="mt-3 alert alert-info">
                      {(() => {
                        const totalNights = strutturaBookings.reduce((acc, b) => {
                          const inDate = new Date(b.checkIn)
                          const outDate = new Date(b.checkOut)
                          const diff = (outDate - inDate) / (1000 * 60 * 60 * 24)
                          return acc + (diff > 0 ? diff : 0)
                        }, 0)

                        const totalRevenue = totalNights * struttura.pricePerNight

                        return (
                          <>
                            🛌 <strong>{strutturaBookings.length}</strong> prenotazioni •{" "}
                            <strong>{totalNights}</strong> notti totali {" "}
                          </>
                        )
                      })()}
                    </div>
                  </>
                )}
              </div>
            )}


          </div>
        </div>
      </div>

      <AnimatePresence>
  {showMapModal && (
    <motion.div
      className="fullscreen-map-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="fullscreen-map-container"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button className="btn-close-map" onClick={closeModalMap}>✖</button>
        <div id="fullscreenMap"></div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


<AnimatePresence>
  {fullscreenIndex !== null && (
    <motion.div
      className="fullscreen-gallery"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.img
        key={fullscreenIndex}
        src={struttura.images[fullscreenIndex]}
        alt={`Fullscreen ${fullscreenIndex}`}
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      <button className="gallery-close" onClick={() => setFullscreenIndex(null)}>✖</button>

      {fullscreenIndex > 0 && (
        <button className="gallery-arrow left" onClick={() => setFullscreenIndex(fullscreenIndex - 1)}>

          <svg width="24" height="24" viewBox="0 0 24 24"><path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" /></svg>
        </button>
      )}
      {fullscreenIndex < struttura.images.length - 1 && (
        <button className="gallery-arrow right" onClick={() => setFullscreenIndex(fullscreenIndex + 1)}>
      
          <svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" /></svg>
        </button>
      )}

      <div className="gallery-counter">
        {fullscreenIndex + 1} / {struttura.images.length}
      </div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}
