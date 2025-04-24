import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const API_URL = process.env.REACT_APP_API_URL;

const resolveImgUrl = (imgPath) => {
  if (!imgPath) return "https://via.placeholder.com/150";
  return imgPath;
};




const Profile = () => {
  const [formData, setFormData] = useState({});
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [structures, setStructures] = useState([]);
  const [editingStructure, setEditingStructure] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const navigate = useNavigate();
  const { customer, updateCustomer } = useAuth();

  const updateCustomerState = (data) => {
    updateCustomer(data);
    setPreview(resolveImgUrl(data.profileImg));
  };

  const handleApiRequest = async (url, options) => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");

      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error("Il server ha restituito una risposta non JSON:\n" + text.slice(0, 100));
      }

      if (!res.ok) {
        throw new Error(data.message || "Errore API");
      }

      return data;
    } catch (err) {
      toast.error(`❌ ${err.message}`);
      throw err;
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Accesso negato. Effettua il login.");
      return navigate("/login");
    }

    const fetchProfile = async () => {
      try {
        const data = await handleApiRequest(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        updateCustomerState(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          gender: data.gender || "other",
          phoneNumber: data.phoneNumber || "",
          indirizzoDiCasa: data.indirizzoDiCasa,
        });
      } catch {
        toast.error("Errore nel caricamento del profilo");
      }
    };

    const fetchStructures = async () => {
      try {
        const data = await handleApiRequest(`${API_URL}/struttura/mie`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStructures(data);
      } catch {
        toast.error("Errore nel caricamento delle strutture");
      }
    };

    fetchProfile();
    fetchStructures();
  }, [navigate]);


const handleProfileUpdate = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

 
  try {
    const updatedUser = await handleApiRequest(`${API_URL}/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData), 
    });
    updateCustomerState(updatedUser);
    toast.success("✅ Dati profilo aggiornati!");
  } catch (err) {
    console.error(err);
  }

 
  if (newImage) {
    try {
      const formDataImg = new FormData();
      formDataImg.append("profileImg", newImage);

      const updatedWithImg = await handleApiRequest(
        `${API_URL}/me/image`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataImg,
        }
      );

      updateCustomerState(updatedWithImg);
      toast.success("✅ Immagine aggiornata!");
    } catch (err) {
      console.error(err);
    }
  }
};

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !(file instanceof Blob)) {
      toast.error("File immagine non valido");
      return;
    }
    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDeleteProfile = async () => {
    try {
      const result = await Swal.fire({
        title: "Sei sicuro?",
        text: "Questa azione è irreversibile!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sì, elimina il mio profilo",
        cancelButtonText: "Annulla",
        customClass: {
          confirmButton: "btn btn-danger",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });

      if (!result.isConfirmed) return;

      await handleApiRequest(`${API_URL}/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.clear();
      toast.success("Account eliminato");
      navigate("/");
      window.location.reload();
    } catch {
      toast.error("Errore durante l'eliminazione dell'account");
    }
  };

  const handleDeleteStructure = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "Sei sicuro?",
        text: "Struttura non recuperabile dopo l'eliminazione.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sì, elimina",
        cancelButtonText: "Annulla",
        customClass: {
          confirmButton: "btn btn-danger",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });

      if (!confirm.isConfirmed) return;

      await handleApiRequest(`${API_URL}/struttura/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setStructures((prev) => prev.filter((s) => s._id !== id));
      toast.success("Struttura eliminata!");
    } catch {
      toast.error("Errore durante l'eliminazione struttura");
    }
  };

  const openEditModal = (structure) => {
    setEditingStructure(structure);
    setEditForm({
      name: structure.name,
      description: structure.description,
      city: structure.city,
      address: structure.address,
      country: structure.country,
      pricePerNight: structure.pricePerNight,
    });
    setCoverPreview(resolveImgUrl(structure.images?.[0]));
    setNewCoverImage(null);
  };
  const handleStructureUpdate = async () => {
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("image", newCoverImage);

      Object.entries(editForm).forEach(([key, value]) => {
        formData.append(key, value);
      });


      const updated = await handleApiRequest(`${API_URL}/struttura/${editingStructure._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });


      setStructures((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );

      toast.success("Struttura aggiornata con successo!");
    } catch (err) {
      console.error("Error during structure update:", err);
      toast.error("Errore durante l'aggiornamento struttura");
    }
  };



  if (!customer) return <div className="text-center mt-5">🔄 Caricamento profilo...</div>;

  return (
    <div className="profile-container">
      <div className="container mt-5" style={{ maxWidth: "700px" }}>
        <div className="card shadow-lg border-0 p-4">
          <div className="text-center mb-4">
            <label style={{ cursor: "pointer" }} className="position-relative d-inline-block">
              <img
                src={preview}
                alt="Profilo"
                className="rounded-circle border border-danger profile-img"
                style={{ width: 100, height: 100, objectFit: "cover" }}
              />
              <input type="file" accept="image/*" onChange={handleImageSelect} hidden />
              <span className="position-absolute bottom-0 end-0 bg-danger text-white rounded-circle px-1">✏️</span>
            </label>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">🔠 Nome</label>
                <input
                  className="form-control"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">🔠 Cognome</label>
                <input
                  className="form-control"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">🧬 Genere</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gender: e.target.value }))
                }
              >
                <option value="male">Uomo</option>
                <option value="female">Donna</option>
                <option value="other">Altro</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">📞 Telefono</label>
              <input
                className="form-control"
                value={formData.phoneNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">🏠 Indirizzo</label>
              <input
                className="form-control"
                value={formData.indirizzoDiCasa}
                onChange={(e) => setFormData((prev) => ({ ...prev, indirizzoDiCasa: e.target.value }))}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <button className="btn btn-outline-secondary" type="submit">
                💾 Salva modifiche
              </button>
              <button type="button" className="btn btn-danger px-4" onClick={handleDeleteProfile}>
                🗑️ Elimina profilo
              </button>
            </div>
          </form>
        </div>

        <div className="mt-5">
          <h5>Le tue Strutture:</h5>
          <ul>
            {structures.length > 0 ? (
              structures.map((structure) => (
                <li key={structure._id} className="structure-item d-flex justify-content-between align-items-center">
                  <span>{structure.name}</span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-warning btn-sm mb-2"
                      onClick={() => openEditModal(structure)}
                    >
                      📝 Modifica
                    </button>
                    <button
                      className="btn btn-danger btn-sm mb-2"
                      onClick={() => handleDeleteStructure(structure._id)}
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li>Non hai ancora strutture.</li>
            )}
          </ul>
        </div>


        {editingStructure && (
          <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content p-4">
                <h5 className="mb-3">✏️ Modifica struttura</h5>

                <div className="mb-3 text-center">
                  <label style={{ cursor: "pointer" }}>
                    <img
                      src={coverPreview}
                      alt="Copertina"
                      className="rounded shadow-sm border"
                      style={{ width: 160, height: 100, objectFit: "cover" }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file instanceof Blob) {
                          setNewCoverImage(file);
                          setCoverPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <div className="small mt-2 text-muted">Cambia immagine di copertina</div>
                  </label>
                </div>

                <input className="form-control mb-2" placeholder="Nome"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />

                <textarea className="form-control mb-2" placeholder="Descrizione"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />

                <input className="form-control mb-2" placeholder="Città"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />

                <input className="form-control mb-2" placeholder="Indirizzo"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />

                <input className="form-control mb-2" placeholder="Nazione"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} />

                <input type="number" className="form-control mb-3" placeholder="Prezzo per notte"
                  value={editForm.pricePerNight}
                  onChange={(e) => setEditForm({ ...editForm, pricePerNight: Number(e.target.value) })} />

                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-secondary" onClick={() => setEditingStructure(null)}>
                    Indietro
                  </button>
                  <button className="btn btn-danger" onClick={handleStructureUpdate}>
                    Salva
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
