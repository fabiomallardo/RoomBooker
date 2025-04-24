import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import { motion } from 'framer-motion';
import 'aos/dist/aos.css';
import Footer from '../components/Footer';
import ParticlesBackground from '../components/ParticlesBackground.jsx';
import './LandingPages.css';

export default function LandingPages() {
  const fullText = useRef("RoomBooker");
  const [displayText, setDisplayText] = useState("");
  const indexRef = useRef(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const interval = setInterval(() => {
      const currentIndex = indexRef.current;
      const nextChar = fullText.current[currentIndex];

      if (nextChar) {
        setDisplayText(fullText.current.slice(0, currentIndex + 1));
        indexRef.current += 1;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 180);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-fullscreen d-flex flex-column">
       <ParticlesBackground />
      <div className="flex-grow-1 d-flex justify-content-center align-items-center text-center text-dark">
        <div className="hero-clean">
          <h1 className={`display-2 fw-bold mb-3 typewriter-text ${isTyping ? "blinking" : ""}`}>
            {displayText}
          </h1>

          <p className="lead mb-4">Prenota soggiorni unici in tutto il mondo in pochi clic.</p>
          <Link to="/register" className="btn btn-danger btn-lg px-4">
            Inizia ora
          </Link>
        </div>
      </div>


<div className="features container py-5">
  <h2 className="text-center mb-4 fw-bold">Perché scegliere RoomBooker</h2>
  <div className="row text-center">
    {[
      {
        icon: "bi bi-globe2",
        title: "Ovunque tu voglia",
        text: "Trova strutture in tutto il mondo, da grandi città a villaggi nascosti.",
        delay: 0,
      },
      {
        icon: "bi bi-stars",
        title: "Esperienze uniche",
        text: "Non solo stanze: soggiorni indimenticabili scelti con cura.",
        delay: 0,
      },
      {
        icon: "bi bi-compass",
        title: "Semplicità assoluta",
        text: "Un'interfaccia chiara, veloce e intuitiva: prenoti in pochi clic.",
        delay: 0,
      },
    ].map((feature, i) => (
      <div key={i} className="col-md-4 mb-4">
        <motion.div
  initial={{ opacity: 0, y: 40, rotate: 0 }}
  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
  whileHover={{ scale: 1.07, rotate: 0 }}
  transition={{
    type: "spring",
    stiffness: 100,
    damping: 15,
    delay: feature.delay,
  }}
  viewport={{ once: true, amount: 0 }}
  className="p-4 rounded shadow-sm bg-white h-100 animated-feature"
>
  <i className={`${feature.icon} display-4 text-danger mb-3`}></i>
  <h5 className="fw-semibold">{feature.title}</h5>
  <p>{feature.text}</p>
</motion.div>

      </div>
    ))}
  </div>
</div>
      <Footer />
    </div>
  );
}
