import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const EarthSystem = () => {
    const groupRef = useRef();
    const earthRef = useRef();
    const orbitRef = useRef();

    // Load assets
    const { scene: issScene } = useGLTF('/iss.glb');
    const clone = React.useMemo(() => issScene.clone(), [issScene]);
    const earthTexture = useLoader(THREE.TextureLoader, '/earth_texture_corrected.png');

    const { viewport } = useThree();
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current || !viewport.width) return;

        const targetX = (mouseRef.current.x * viewport.width) / 2;
        const targetY = (mouseRef.current.y * viewport.height) / 2;

        if (isNaN(targetX) || isNaN(targetY)) return;

        // Smooth follow for the main group
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.15);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.15);

        // Earth Rotation (Day/Night cycle)
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.5;
        }

        // ISS Orbit
        if (orbitRef.current) {
            orbitRef.current.rotation.z += delta * 0.4; // Orbit speed
            orbitRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.5; // Slight wobble
        }

        // Tilt based on movement
        const tiltX = (targetY - groupRef.current.position.y);
        const tiltY = (targetX - groupRef.current.position.x);
        if (!isNaN(tiltX)) groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -tiltX * 0.2, 0.1);
        if (!isNaN(tiltY)) groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, tiltY * 0.2, 0.1);
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Mini Earth - Scaled Up */}
            <mesh ref={earthRef} scale={[0.4, 0.4, 0.4]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={earthTexture}
                    roughness={0.7}
                    metalness={0.1}
                />
            </mesh>

            {/* Orbit Container */}
            <group ref={orbitRef}>
                {/* ISS - Offset from center to create orbit - Scaled Up significantly */}
                <group position={[1.5, 0, 0]} scale={[0.08, 0.08, 0.08]}>
                    <primitive object={clone} rotation={[0, 0, Math.PI / 2]} />
                </group>
            </group>

            {/* Local Light for the cursor system */}
            <pointLight position={[2, 2, 2]} intensity={2} color="#ffffff" distance={5} />
        </group>
    );
};

useGLTF.preload('/iss.glb');

export const EarthCursorScene = () => {
    return <EarthSystem />;
};

const EarthCursor = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            pointerEvents: 'none'
        }}>
            <Canvas
                gl={{ alpha: true }}
                camera={{ position: [0, 0, 5], fov: 45 }}
                style={{ pointerEvents: 'none' }}
            >
                <ambientLight intensity={0.5} />
                <EarthSystem />
            </Canvas>
        </div>
    );
};

export default EarthCursor;
