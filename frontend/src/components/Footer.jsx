import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer mt-5 text-white pt-4 pb-3">
      <div className="container text-center">
        <h5 className="fw-bold">RoomBooker</h5>
        <p className="footer-desc">
          Prenota, rilassati e riparti. La tua prossima vacanza inizia da qui.
        </p>

        <p className="mb-1">📧 support@roombooker.it</p>
        <p className="mb-3">📍 Italia</p>

        <div className="footer-social mb-3">
          <a href="#"><i className="bi bi-facebook"></i></a>
          <a href="#"><i className="bi bi-instagram"></i></a>
          <a href="#"><i className="bi bi-twitter"></i></a>
        </div>

        <hr className="border-light" />
        <small>&copy; {new Date().getFullYear()} RoomBooker – Tutti i diritti riservati</small>
      </div>
    </footer>
  );
}
