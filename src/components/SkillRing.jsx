import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_FILES = [
    { file: '/mongoDB.glb', scale: 20 },
    { file: '/expressJS.glb', scale: 20 },
    { file: '/javascript.glb', scale: 20 },
    { file: '/nestJS.glb', scale: 20 },
    { file: '/nextJS.glb', scale: 20 }
];

const SkillModel = ({ file, scale, position, rotation }) => {
    const { scene } = useGLTF(file);
    const clone = useMemo(() => scene.clone(), [scene]);

    return <primitive object={clone} scale={[scale, scale, scale]} position={position} rotation={rotation} />;
};

const SkillRing = () => {
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.2;
        }
    });

    const radius = 400;

    return (
        <group rotation={[Math.PI / 6, 0, Math.PI / 8]} position={[0, -50, 0]}>
            {/* Glowing Orbit Strip */}
            {/* Glowing Orbit Strip Removed */}

            <group ref={groupRef}>
                {MODEL_FILES.map((model, index) => {
                    const angle = (index / MODEL_FILES.length) * Math.PI * 2;
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;

                    return (
                        <group key={index} position={[x, 0, z]} rotation={[0, -angle - Math.PI / 2, 0]}>
                            <SkillModel
                                file={model.file}
                                scale={model.scale}
                                position={[0, 0, 0]}
                                rotation={[0, -Math.PI / 2, 0]} // Flip 180 degrees
                            />
                        </group>
                    );
                })}
            </group>
        </group>
    );
};

// Preload to avoid hitching
MODEL_FILES.forEach(m => useGLTF.preload(m.file));

export default SkillRing;
