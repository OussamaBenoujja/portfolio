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
    github: "https://github.com/OussamaBenoujja/dari",
    logo: dariLogo,
    position: [-2.5, 0.5, 1], // Left and slightly forward
  },
  {
    id: 3,
    title: "GEDPro",
    description:
      "Modern HR Document Management System facilitating candidate tracking, recruitment workflows, and dynamic form creation. Hybrid architecture with robust role-based access control.",
    tools: ["NestJS", "Next.js", "PostgreSQL", "MongoDB"],
    github: "https://github.com/OussamaBenoujja/GEDpro",
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
            width: "340px",
            background: "rgba(8, 12, 24, 0.85)", // Deep space dark
            backdropFilter: "blur(12px)",
            borderRadius: "4px", // More angular/techy
            borderLeft: "2px solid rgba(0, 198, 255, 0.6)", // Tech accent on left
            borderTop: "1px solid rgba(0, 198, 255, 0.2)",
            borderRight: "1px solid rgba(0, 198, 255, 0.1)",
            borderBottom: "1px solid rgba(0, 198, 255, 0.1)",
            padding: "24px",
            color: "#e0f7ff",
            fontFamily: "'Rajdhani', 'Inter', sans-serif", // Suggesting a tech font if available, reverting to Inter
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: hovered ? "scale(1.05) translateZ(20px)" : "scale(1) translateZ(0px)",
            boxShadow: hovered
              ? "0 0 40px rgba(0, 198, 255, 0.2), inset 0 0 20px rgba(0, 198, 255, 0.05)"
              : "0 0 15px rgba(0, 0, 0, 0.5), inset 0 0 0 rgba(0,0,0,0)",
            cursor: "auto",
            userSelect: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative tech lines */}
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "30px",
            height: "30px",
            borderTop: "2px solid rgba(0, 198, 255, 0.4)",
            borderRight: "2px solid rgba(0, 198, 255, 0.4)",
            pointerEvents: "none"
          }} />

          <div style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "10px",
            height: "10px",
            background: "rgba(0, 198, 255, 0.4)",
            pointerEvents: "none"
          }} />

          {/* Logo Section */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              marginBottom: "18px",
              borderBottom: "1px solid rgba(0, 198, 255, 0.15)",
              paddingBottom: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                marginRight: "16px",
                borderRadius: project.logo ? "0" : "4px",
                background: project.logo
                  ? "transparent"
                  : "rgba(0, 198, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: project.logo ? "none" : "1px solid rgba(0, 198, 255, 0.3)",
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
                    filter: "drop-shadow(0 0 5px rgba(0,0,0,0.5))"
                  }}
                />
              ) : (
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#00c6ff" }}>
                  {project.title[0]}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{
                fontSize: "0.7rem",
                color: "#00c6ff",
                letterSpacing: "2px",
                textTransform: "uppercase",
                opacity: 0.8
              }}>
                Project Unit {project.id.toString().padStart(2, '0')}
              </span>
              <h3
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  color: "#ffffff",
                  textShadow: "0 0 10px rgba(0, 198, 255, 0.3)"
                }}
              >
                {project.title}
              </h3>
            </div>
          </div>

          <p
            style={{
              margin: "0 0 20px 0",
              fontSize: "0.9rem",
              color: "#a0aec0",
              lineHeight: "1.6",
              fontWeight: "300",
              letterSpacing: "0.3px",
            }}
          >
            {project.description}
          </p>

          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginBottom: "24px",
              width: "100%"
            }}
          >
            {project.tools.map((tool, index) => (
              <span
                key={index}
                style={{
                  background: "rgba(0, 198, 255, 0.05)",
                  padding: "4px 10px",
                  borderRadius: "2px", // Tech corners
                  fontSize: "0.7rem",
                  color: "#5ce1e6",
                  fontFamily: "monospace",
                  border: "1px solid rgba(0, 198, 255, 0.2)",
                  letterSpacing: "0.5px"
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
              gap: "10px",
              background: "transparent",
              color: "#00c6ff",
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: "4px",
              fontWeight: "600",
              fontSize: "0.85rem",
              letterSpacing: "1px",
              textTransform: "uppercase",
              border: "1px solid rgba(0, 198, 255, 0.5)",
              transition: "all 0.2s",
              width: "100%",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 198, 255, 0.15)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 198, 255, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <Github size={16} />
            Initialize Repo
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
