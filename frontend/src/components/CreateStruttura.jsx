import { useState } from "react";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./CreateHotel.css"; 

export default function CreateHotel() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    address: "",
    city: "",
    country: "",
    pricePerNight: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files,
      }));

      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviews(previews);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      type,
      description,
      address,
      city,
      country,
      pricePerNight,
      images,
    } = formData;

    if (
      !name ||
      !type ||
      !description ||
      !address ||
      !city ||
      !country ||
      !pricePerNight ||
      !images.length
    ) {
      toast.error("Tutti i campi sono obbligatori.");
      return;
    }

    if (isNaN(pricePerNight) || pricePerNight <= 0) {
      toast.error("Il prezzo per notte deve essere un numero maggiore di zero.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Utente non autenticato.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("name", name);
    data.append("type", type);
    data.append("description", description);
    data.append("address", address);
    data.append("city", city);
    data.append("country", country);
    data.append("pricePerNight", pricePerNight);

    Array.from(images).forEach((image) => {
      data.append("images", image);
    });

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/struttura`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Errore nella creazione della struttura");

      toast.success("✅ Struttura creata con successo!");

   
      setFormData({
        name: "",
        type: "",
        description: "",
        address: "",
        city: "",
        country: "",
        pricePerNight: "",
        images: [],
      });
      setImagePreviews([]);
      e.target.reset();
    } catch (err) {
      console.error("Errore nella creazione:", err);
      toast.error(err.message || "Errore durante la creazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 struttura-bg">
      <div className="struttura-card p-4 m-3 shadow rounded-4 w-100" style={{ maxWidth: "650px" }}>
        <h2 className="mb-4 text-center fw-bold">Nuova Struttura</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome della struttura</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Tipo struttura</label>
            <select name="type" value={formData.type} onChange={handleChange} className="form-select" required>
              <option value="">Seleziona</option>
              <option value="Hotel">Hotel</option>
              <option value="Appartamenti">Appartamenti</option>
              <option value="Cottage">Cottage</option>
              <option value="Residence">Residence</option>
              <option value="Bed & Breakfast">Bed & Breakfast</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Descrizione</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Indirizzo</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Città</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Paese</label>
            <input type="text" name="country" value={formData.country} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Prezzo per notte (€)</label>
            <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Immagini della struttura</label>
            <input type="file" name="images" multiple onChange={handleChange} className="form-control" accept="image/*" required />
            <div className="mt-3 d-flex flex-wrap gap-3">
              {imagePreviews.map((img, i) => (
                <img key={i} src={img} alt={`preview-${i}`} className="img-preview" />
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-danger w-100" disabled={loading}>
            {loading ? "Caricamento..." : "Crea Struttura"}
          </button>
        </form>
      </div>
    </div>
  );
}

