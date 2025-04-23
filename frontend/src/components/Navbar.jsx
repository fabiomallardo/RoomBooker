import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';


const API_URL = process.env.REACT_APP_API_URL;

const resolveImgUrl = (imgPath) => {
  if (!imgPath) return "https://via.placeholder.com/150";
  return imgPath; 
};


export default function Navbar() {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);

  const handleLogout = () => {
    logout();
    toast.info("Logout effettuato");
    navigate("/");
  };

  useEffect(() => {
    if (customer?.profileImg) {
      setPreview(resolveImgUrl(customer.profileImg));
    }
  }, [customer]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-white" to={customer ? "/home" : "/"}>
          RoomBooker
        </Link>

        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          {!customer ? (
            <ul className="navbar-nav gap-2 ms-auto">
              <li className="nav-item">
                <Link to="/login" className="btn btn-light text-danger fw-bold">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="btn btn-light text-danger fw-bold">Registrati</Link>
              </li>
            </ul>
          ) : (
            <>
              {/* Mobile */}
              <ul className="navbar-nav d-lg-none gap-2 text-dark">
                <li className="nav-item">
                  <Link className="nav-link btn btn-link" to="/profile">Profilo</Link>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={handleLogout}>Logout</button>
                </li>
                {customer.role === "host" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-struttura">Registra la tua struttura</Link>
                  </li>
                )}
              </ul>

              {/* Desktop */}
              <div className="dropdown d-none d-lg-flex align-items-center gap-3">
                {customer.role === "host" && (
                  <Link className="btn btn-light text-dark fw-bold" to="/create-struttura">
                    Registra la tua struttura
                  </Link>
                )}

                <button
                  className="btn dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={preview || "/placeholder.jpg"}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: 40, height: 40, objectFit: "cover" }}
                  />
                  <span className="fw-bold text-white">{customer.firstName}</span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">Profilo</Link>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
