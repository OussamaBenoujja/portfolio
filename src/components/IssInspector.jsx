import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Stars } from '@react-three/drei';

const ISSModel = () => {
    const { scene } = useGLTF('/iss.glb');
    const clone = React.useMemo(() => scene.clone(), [scene]);
    const modelRef = useRef();

    // Dynamic movement (Rotation + Floating)
    useFrame((state, delta) => {
        if (modelRef.current) {
            // Rotation
            modelRef.current.rotation.y += delta * 0.05;

            // Floating drift (Sine wave on Y axis)
            modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return <primitive ref={modelRef} object={clone} scale={0.5} />;
};

import ProjectCards from './ProjectCards';

// Reusable scene component for the Unified Experience
export const IssStationScene = () => {
    // Positioned far away so it doesn't overlap with the Solar System
    return (
        <group position={[50, 0, 0]}>
            {/* Local lights for the station */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={2} />
            <ISSModel />
            <ProjectCards />
        </group>
    );
};

const IssInspector = () => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 20, background: 'black' }}>
            <Canvas camera={{ position: [5, 2, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <ISSModel />

                <OrbitControls
                    enablePan={false}
                    minDistance={3}
                    maxDistance={10}
                    autoRotate={false}
                />
            </Canvas>

            {/* Back Button / Overlay UI */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: 'white',
                fontFamily: 'sans-serif',
                zIndex: 30
            }}>
                <h1 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Projects Station</h1>
                <p style={{ opacity: 0.7 }}>Inspect module for details</p>
            </div>
        </div>
    );
};

export default IssInspector;
