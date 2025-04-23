import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Landing from './pages/LandingPages.jsx';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar';
import CreateStruttura from './components/CreateStruttura.jsx';
import DettaglioStruttura from './pages/DettaglioStruttura.jsx';

import { AuthProvider } from './context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';


function Layout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-struttura" element={<CreateStruttura />} />
          <Route path="/struttura/:id" element={<DettaglioStruttura />} />
        </Routes>
      </main>

      {!isLanding && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
        <ToastContainer position="top-center" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
