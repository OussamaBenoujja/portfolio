import React, { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { CameraControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { SolarSystemScene } from "./SolarSystem";
import { EarthCursorScene } from "./EarthCursor";
import { IssStationScene } from "./IssInspector";
import { SpaceShuttle } from "./SpaceShuttle";


const EXPERIENCE_CONFIG = {
  hero: {
    position: [0, 0, 10],
    target: [0, 0, 0],
  },
  projects: {
    position: [50, 2, 5],
    target: [50, 0, 0],
  },
  shuttle: {
    // Flight path logic handled in component or specialized scene? 
    // For now, let's just place it flying towards the projects
    position: [15, 0, -5],
    rotation: [0, Math.PI / 2, 0]
  }
};

const CameraManager = ({ viewMode }) => {
  const controlsRef = useRef();

  useEffect(() => {
    if (!controlsRef.current) return;

    if (viewMode === "projects") {
      // Flight to ISS
      controlsRef.current.setLookAt(
        50,
        0,
        8, // Position (Start further back to see everything)
        50, // TargetX
        0,  // TargetY
        0,  // TargetZ
        true, // Animate
      );
    } else {
      // Return to Solar System
      controlsRef.current.setLookAt(0, 0, 10, 0, 0, 0, true);
    }
  }, [viewMode]);

  return (
    <CameraControls
      ref={controlsRef}
      maxDistance={40} // increased to allow zooming out
      minDistance={2} // prevents clipping
      smoothTime={0.25}
      makeDefault
      dollySpeed={1}
      truckSpeed={1} // Enable panning (standard for review)
    />
  );
};

const Experience = ({ viewMode, setViewMode }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        background: "black",
      }}
    >
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        {/* Global Lighting */}
        <ambientLight intensity={0.05} />

        {/* Camera Logic */}
        <CameraManager viewMode={viewMode} />

        {/* SCENE 1: Solar System */}
        <group visible={true}>
          <SolarSystemScene onProjectEnter={() => setViewMode("projects")} />
        </group>

        {/* SCENE 2: ISS Station (Destination) */}
        <IssStationScene />

        {/* Space Shuttle (Always visible or conditional?) */}
        {/* Let's have it flying in the distance or near the hero scene */}

        {/* Shuttle 1: Solar System Flyby (Slow Majestic Pass) */}
        {viewMode === "hero" && (
          <SpaceShuttle
            isFlyby={true}
            startOffset={[2, -1, 12]}
            flySpeed={3}
            shrinkSpeed={0.005} // Shrink slowly over time
            vanishDistance={50}
            respawnDelay={5000}
            scale={0.05}
          />
        )}

        {/* Shuttle 2: Projects Scene Flyby */}
        {viewMode === "projects" && (
          <SpaceShuttle
            isFlyby={true}
            position={[50, 0, 0]}
            startOffset={[2, -0.5, 7]}
            flySpeed={0.5}
            shrinkSpeed={0.001} // Consistent shrink rate
            vanishDistance={10}
            respawnDelay={10000}
            scale={0.05}
          />
        )}

        {/* Cursor (Only visible in Hero mode) */}
        {viewMode === "hero" && <EarthCursorScene />}

        {/* Shared Background */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Indicators (Must be inside Canvas) */}

      </Canvas>

      {/* UI Overlay for Projects Mode */}
      {viewMode === "projects" && (

        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            color: "white",
            fontFamily: "sans-serif",
            zIndex: 30,
            pointerEvents: "none", // Let clicks pass through
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              textTransform: "uppercase",
              letterSpacing: "4px",
            }}
          >
            Projects Station
          </h1>
          <p style={{ opacity: 0.7 }}>Inspect module for details</p>
          <button
            style={{
              marginTop: "1rem",
              pointerEvents: "auto",
              padding: "10px 20px",
              background: "white",
              color: "black",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setViewMode("hero")}
          >
            Return to Orbit
          </button>
        </div>
      )}
    </div>
  );
};

export default Experience;
