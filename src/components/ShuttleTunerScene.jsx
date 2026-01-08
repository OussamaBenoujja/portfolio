import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Leva } from "leva";
import { SpaceShuttle } from "./SpaceShuttle";

export const ShuttleTunerScene = () => {
    return (
        <div style={{ width: "100%", height: "100vh", background: "#000", cursor: "auto" }}>
            <Leva theme={{ sizes: { rootWidth: '450px' } }} />
            <Canvas>
                <PerspectiveCamera makeDefault position={[5, 2, 10]} />
                <OrbitControls makeDefault />

                {/* Simple lighting to see the model clearly */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                {/* Environment for reflections */}
                <Environment preset="city" />

                {/* The Shuttle Component with built-in Leva controls */}
                <SpaceShuttle scale={1} />

                {/* Grid for reference */}
                <gridHelper args={[20, 20]} position={[0, -2, 0]} />
                <axesHelper args={[5]} />
            </Canvas>

            <div style={{
                position: "absolute",
                top: 20,
                left: 20,
                color: "white",
                background: "rgba(0,0,0,0.7)",
                padding: "1rem",
                borderRadius: "8px",
                fontFamily: "monospace"
            }}>
                <h2>Shuttle Tuner</h2>
                <p>Use the panel on the right to adjust values.</p>
                <p>Red Axis = X | Green = Y | Blue = Z</p>
            </div>
        </div>
    );
};
