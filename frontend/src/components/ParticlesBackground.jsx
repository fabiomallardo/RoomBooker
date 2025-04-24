import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: false,
        },
        background: {
          color: { value: "#ffffff" }
        },
        particles: {
          number: {
            value: 70,
            density: { enable: true, value_area: 800 }
          },
          color: { value: "#dc3545" },
          shape: { type: "circle" },
          opacity: { value: 0.4 },
          size: { value: 3 },
          move: {
            enable: true,
            speed: 0.6,
            direction: "none",
            outMode: "bounce"
          }
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            resize: true
          },
          modes: {
            repulse: { distance: 100 }
          }
        }
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
}
