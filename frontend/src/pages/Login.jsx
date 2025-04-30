import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.warning("Compila tutti i campi!");

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login fallito");

      login({ customer: data.customer, token: data.token });
      toast.success(`👋 Ciao ${data.customer.firstName}!`);
      /* navigate("/home"); */
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Errore durante il login");
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
      }); 
    }
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 login-bg">
      <div className="login-card p-4 shadow rounded-4">
        <h2 className="text-center mb-4 fw-bold">Login</h2>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-danger w-100">
              {isSubmitting ? "Accesso in corso..." : "Accedi"}
            </button>
          </fieldset>

          <div className="text-center my-4 text-muted">— oppure —</div>

          <div className="d-flex justify-content-center w-100">
  <div ref={googleBtnRef} style={{ minHeight: 50 }} />
</div>

        </form>
      </div>
    </div>
  );
}
