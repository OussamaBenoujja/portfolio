import React, { forwardRef, useState, useRef, useMemo } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const FlagGoats = forwardRef((props, ref) => {
    const { scene } = useGLTF('/flagGoats.glb');
    const [hovered, setHovered] = useState(false);
    const internalRef = useRef();
    const { camera } = useThree();
    const raycaster = useRef(new THREE.Raycaster());

    // Debug logging throttling
    const frameCount = useRef(0);

    // Outline clone
    const outlineScene = useMemo(() => {
        const clone = scene.clone();
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: '#ffaa00', // Gold/Orange for Goats
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6,
            depthTest: true,
            depthWrite: false
        });

        clone.traverse((child) => {
            if (child.isMesh) {
                child.material = outlineMaterial;
            }
        });
        return clone;
    }, [scene]);

    useFrame(() => {
        raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);

        if (internalRef.current) {
            const intersects = raycaster.current.intersectObject(internalRef.current, true);
            const isHit = intersects.length > 0;
            const isClose = isHit && intersects[0].distance < 60;

            if (props.onInteractionChange) {
                if (internalRef.current.userData.canInteract !== isClose) {
                    internalRef.current.userData.canInteract = isClose;
                    props.onInteractionChange(isClose);
                }
            }

            if (hovered !== isClose) {
                setHovered(isClose);
            }
        }
    });

    return (
        <group ref={internalRef} {...props}>
            <primitive object={scene} ref={ref} />

            {hovered && (
                <primitive
                    object={outlineScene}
                    scale={[1.03, 1.03, 1.03]}
                />
            )}

            {/* Label - Always Visible */}
            <Html
                position={[0, 4, 0]}
                center
                distanceFactor={15}
                zIndexRange={[200, 0]}
                style={{ pointerEvents: 'none' }}
            >
                <div style={{
                    color: '#ffaa00',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '32px', // Smaller than ME
                    fontWeight: 'bold',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '12px 24px',
                    border: '3px solid #ffaa00',
                    borderRadius: '12px',
                    textShadow: '0 0 15px #ffaa00',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 0 30px rgba(255, 170, 0, 0.4)'
                }}>
                    CLASS GOATS
                </div>
            </Html>
        </group>
    );
});

useGLTF.preload('/flagGoats.glb');
