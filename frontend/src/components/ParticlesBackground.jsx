import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadAll } from "tsparticles-all";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadAll(engine); 
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: { color: { value: "#000" } },
        particles: {
          number: { value: 60 },
          color: { value: "#fff" },
          shape: { type: "circle" },
          opacity: { value: 0.3 },
          size: { value: 3 },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            outMode: "bounce"
          }
        }
      }}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
}
