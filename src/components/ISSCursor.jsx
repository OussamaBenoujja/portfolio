import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const ISS = () => {
    const groupRef = useRef();
    const { scene } = useGLTF('/iss.glb');
    const { viewport } = useThree();

    // Custom mouse tracking
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

        // Smooth follow
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.15);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.15);

        // Constant rotation to show off the model
        groupRef.current.rotation.y += delta * 0.2;
        groupRef.current.rotation.z += delta * 0.05;

        // Tilt based on movement
        const tiltX = (targetY - groupRef.current.position.y);
        const tiltY = (targetX - groupRef.current.position.x);
        if (!isNaN(tiltX)) groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -tiltX * 0.2, 0.1);
    });

    return (
        <primitive
            ref={groupRef}
            object={scene}
            scale={0.05} // Initial guess for scale, will adjust if needed
            rotation={[0, 0, 0]}
        />
    );
};

// Preload the model
useGLTF.preload('/iss.glb');

const ISSCursor = () => {
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
                <ambientLight intensity={1} />
                <directionalLight position={[10, 10, 5]} intensity={2} />
                <ISS />
            </Canvas>
        </div>
    );
};

export default ISSCursor;
