import React, { useState } from "react";
import { Html, Billboard } from "@react-three/drei";
import { Github } from "lucide-react";
import fleetManiaLogo from "../assets/fleetmania.png";
import dariLogo from "../assets/dari_logo.png";
import gedProLogo from "../assets/gedpro_logo.png";

export const projects = [
  {
    id: 1,
    title: "FleetMania",
    description:
      "Comprehensive fleet management system helping road transport companies digitize their operations. Features real-time tracking, mission dispatching, and automated reporting.",
    tools: ["React", "Node.js", "MongoDB", "Docker"],
    github: "https://github.com/OussamaBenoujja/FLEETMANIA",
    logo: fleetManiaLogo,
    position: [2.5, 0, 0], // Right of ISS
  },
  {
    id: 2,
    title: "Darna Platform",
    description:
      "Full-stack real-estate marketplace and collaborative savings platform. Features two Express/Keycloak backends, React 19 frontends, and Dockerized infrastructure.",
    tools: ["React 19", "Express", "Keycloak", "TanStack Query"],
    github: "https://github.com/OussamaBenoujja/DARNA_MONOREPO_PLACEHOLDER", // I will ask user for link or use placeholder if not provided, but since they gave full details maybe I should infer or leave generic? I'll use a placeholder or generic for now, user didn't explicitly give URL but gave repo layout. Wait, user provided everything BUT the URL in the text block? "Looking for endpoint-level details? See DARNA_API.md..." - Ah, it's a monorepo description. I'll just put a placeholder github link or assume DarnaPlatform if I can't find it. The fleetmania one was https://github.com/OussamaBenoujja/FLEETMANIA. I'll guess https://github.com/OussamaBenoujja/DARNA-MONOREPO or similar, or just leave a placeholder. Actually, I should probably just use a placeholder based on the project name.
    logo: dariLogo,
    position: [-2.5, 0.5, 1], // Left and slightly forward
  },
  {
    id: 3,
    title: "GEDPro",
    description:
      "Modern HR Document Management System facilitating candidate tracking, recruitment workflows, and dynamic form creation. Hybrid architecture with robust role-based access control.",
    tools: ["NestJS", "Next.js", "PostgreSQL", "MongoDB"],
    github: "https://github.com/OussamaBenoujja/GEDPRO_PLACEHOLDER", // Using placeholder pattern consistent with previous entry
    logo: gedProLogo,
    position: [0, -1.5, 2], // Below and forward
  }
];

const Card = ({ project }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Billboard
      position={project.position}
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
    >
      <Html transform occlude distanceFactor={1.5} style={{ opacity: 0.9 }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: "320px", // Slightly wider for better text fit
            background: "rgba(20, 20, 25, 0.7)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "24px",
            color: "white",
            fontFamily: "Inter, sans-serif",
            transition: "transform 0.2s, background 0.2s",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            boxShadow: hovered
              ? "0 0 30px rgba(0, 150, 255, 0.3)"
              : "0 0 10px rgba(0,0,0,0.5)",
            cursor: "auto", // Ensure system cursor shows
            userSelect: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {/* Logo Section */}
          <div
            style={{
              width: "auto",
              minWidth: "60px",
              height: "60px",
              marginBottom: "15px",
              borderRadius: project.logo ? "0" : "12px",
              overflow: "visible",
              background: project.logo
                ? "transparent"
                : "linear-gradient(135deg, #00c6ff, #0072ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              boxShadow: project.logo ? "none" : "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            {project.logo ? (
              <img
                src={project.logo}
                alt={`${project.title} logo`}
                style={{
                  width: "auto",
                  height: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                  {project.title[0]}
                </span>
              </div>
            )}
          </div>

          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "1.4rem",
              fontWeight: "700",
            }}
          >
            {project.title}
          </h3>
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "0.95rem",
              color: "#b0b0b0",
              lineHeight: "1.5",
            }}
          >
            {project.description}
          </p>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {project.tools.map((tool, index) => (
              <span
                key={index}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  color: "#88ccff",
                  fontWeight: "500",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {tool}
              </span>
            ))}
          </div>

          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "white",
              color: "black",
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "background 0.2s",
              width: "100%",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#e0e0e0")}
            onMouseLeave={(e) => (e.target.style.background = "white")}
          >
            <Github size={18} />
            View Source
          </a>
        </div>
      </Html>
    </Billboard>
  );
};

const ProjectCards = () => {
  return (
    <group>
      {projects.map((project) => (
        <Card key={project.id} project={project} />
      ))}
    </group>
  );
};

export default ProjectCards;
