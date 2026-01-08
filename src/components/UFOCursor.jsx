import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const UFO = () => {
    const groupRef = useRef();
    const engineRef = useRef();
    const { viewport } = useThree();
    const [velocity, setVelocity] = useState(0);
    const lastPos = useRef(new THREE.Vector3(0, 0, 0));

    // Custom mouse tracking since pointer-events: none blocks R3F events
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            // Normalize mouse to -1..1
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        if (!viewport.width) return;

        // Use custom mouse ref
        const targetX = (mouseRef.current.x * viewport.width) / 2;
        const targetY = (mouseRef.current.y * viewport.height) / 2;

        // Safety check
        if (isNaN(targetX) || isNaN(targetY)) return;

        // Smooth follow (Lerp)
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.2);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.2);

        // Calculate velocity
        const currentPos = groupRef.current.position.clone();
        const dist = currentPos.distanceTo(lastPos.current);
        const safeDelta = Math.max(delta, 0.001);
        const vel = dist / safeDelta;
        setVelocity(vel);
        lastPos.current.copy(currentPos);

        // Tilt with checks
        const tiltX = (targetY - groupRef.current.position.y);
        const tiltY = (targetX - groupRef.current.position.x);
        if (!isNaN(tiltX)) groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -tiltX * 0.5, 0.1);
        if (!isNaN(tiltY)) groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, tiltY * 0.5, 0.1);

        // Engine Effect
        if (engineRef.current) {
            const targetScale = Math.min(vel * 3, 3);
            const engineScale = THREE.MathUtils.lerp(engineRef.current.scale.y, Math.max(0.5, targetScale), 0.2);

            if (!isNaN(engineScale)) {
                engineRef.current.scale.set(1, engineScale, 1);
                engineRef.current.material.opacity = 0.5 + Math.random() * 0.5;

                // Fix flame position so it grows DOWNWARDS only
                // Original Y of mesh center: -0.1. 
                // Geometry is Cone (height 0.5, center at 0). Extends +/- 0.25 from mesh center.
                // Top of cone relative to mesh center is +0.25.
                // We want Top of cone relative to Parent to be fixed at: -0.1 + 0.25 = +0.15.
                // New Mesh Center Y = FixedTopY - (Height * ScaleY / 2)
                // New Mesh Center Y = 0.15 - (0.5 * engineScale / 2)
                engineRef.current.position.y = 0.15 - (0.25 * engineScale);
            }
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Scaled down UFO group */}
            <group scale={[0.4, 0.4, 0.4]}>
                {/* Cockpit */}
                <mesh position={[0, 0.2, 0]}>
                    <sphereGeometry args={[0.35, 32, 32]} />
                    <meshPhysicalMaterial
                        color="#88ccff"
                        transparent={true}
                        opacity={0.6}
                        roughness={0.1}
                        clearcoat={1}
                        emissive="#88ccff"
                        emissiveIntensity={0.2}
                    />
                </mesh>

                {/* Body */}
                <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.4]}>
                    <torusGeometry args={[0.6, 0.15, 16, 32]} />
                    <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Bottom Light/Engine */}
                <mesh position={[0, -0.1, 0]} ref={engineRef}>
                    <coneGeometry args={[0.2, 0.5, 32]} />
                    <meshBasicMaterial color="#ff4400" transparent={true} opacity={0.8} />
                </mesh>

                {/* Decorative Lights */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <mesh
                        key={i}
                        position={[Math.cos(i * Math.PI / 4) * 0.6, 0, Math.sin(i * Math.PI / 4) * 0.6]}
                    >
                        <sphereGeometry args={[0.04, 8, 8]} />
                        <meshBasicMaterial color="#00ffcc" toneMapped={false} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

const UFOCursor = () => {
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
                camera={{ position: [0, 0, 5], fov: 75 }}
                style={{ pointerEvents: 'none' }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <UFO />
            </Canvas>
        </div>
    );
};

export default UFOCursor;
