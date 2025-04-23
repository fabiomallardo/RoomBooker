import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './Register.css'; 

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dataDiNascita: '',
    password: '',
    gender: 'male',
    role: 'customer',
    profileImg: null,
    phoneNumber: '',
    indirizzoDiCasa: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleBtnRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: "POST",
        body: formDataToSend,
      });

      const contentType = res.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      const data = isJson ? await res.json() : { message: "❌ Risposta non valida dal server" };

      if (!res.ok) throw new Error(data.message || "❌ Errore generico");

      const gender = data.customer.gender;
const name = data.customer.firstName;

const greeting =
  gender === "female" ? `👋🏻 Benvenuta ${name}` :
  gender === "male" ? `👋🏻 Benvenuto ${name}` :
  `Benvenutə ${name}`; 

toast.success(greeting);

      localStorage.setItem("token", data.token);
      localStorage.setItem("customer", JSON.stringify(data.customer));

      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } catch (err) {
      console.error("❌ Errore nella registrazione:", err);
      toast.error(err.message || "Errore imprevisto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/google/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Errore accesso Google");

      toast.success(`👋 Ciao ${data.customer.firstName}!`);
      localStorage.setItem("token", data.token);
      localStorage.setItem("customer", JSON.stringify(data.customer));

      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } catch (err) {
      toast.error("❌ Login Google fallito");
      console.error(err);
    }
  };

  useEffect(() => {
    if (window.google && googleBtnRef.current) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
  
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: "100%", 
      });
  
    
      setTimeout(() => {
        const btn = googleBtnRef.current?.querySelector("div");
        if (btn) {
          btn.style.width = "100%";
          btn.style.display = "flex";
          btn.style.justifyContent = "center";
        }
      }, 100); 
    }
  }, []);
  
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 register-bg">
      <div className="register-card p-3 m-3 shadow rounded-4 w-100" style={{ maxWidth: "600px" }}>
        <h2 className="mb-4 text-center fw-bold">Crea il tuo account</h2>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <input name="firstName" onChange={handleChange} className="form-control" placeholder="🔠 Nome" required />
            </div>
            <div className="col-md-6">
              <input name="lastName" onChange={handleChange} className="form-control" placeholder="🔠 Cognome" required />
            </div>
          </div>

          <div className="mt-3">
            <input type="email" name="email" onChange={handleChange} className="form-control" placeholder="📧 Email" required />
          </div>

          <div className="mt-3">
  <label className="form-label">📅 Data di nascita</label>
  <input
    type="date"
    name="dataDiNascita"
    onChange={handleChange}
    className="form-control"
    required
  />
</div>


          <div className="mt-3">
            <input type="password" name="password" onChange={handleChange} className="form-control" placeholder="🔑 Password" required />
          </div>

          <div className="mt-3">
            <input type="number" name="phoneNumber" onChange={handleChange} className="form-control" placeholder="📞 Telefono" required />
          </div>

          <div className="mt-3">
            <input name="indirizzoDiCasa" onChange={handleChange} className="form-control" placeholder="🏠 Indirizzo" required />
          </div>

          <div className="mt-3">
            <select name="gender" onChange={handleChange} className="form-select" required>
              <option value="male">Uomo</option>
              <option value="female">Donna</option>
              <option value="other">Altro</option>
            </select>
          </div>

          <div className="mt-3">
            <select name="role" onChange={handleChange} className="form-select" required>
              <option value="customer">Cliente</option>
              <option value="host">Host</option>
            </select>
          </div>

          <div className="mt-3">
            <label className="form-label">👤 Immagine profilo</label>
            <input type="file" name="profileImg" accept="image/*" onChange={handleChange} className="form-control" />
          </div>

          <button type="submit" className="btn btn-danger mt-4 w-100" disabled={isSubmitting}>
            {isSubmitting ? "Registrazione in corso..." : "Registrati"}
          </button>
        </form>

        <div className="text-center my-4 text-muted">— oppure —</div>

        <div className="d-flex w-100">
          <div ref={googleBtnRef} style={{ minHeight: 50 }} className="w-100" />
        </div>
      </div>
    </div>
  );
}
