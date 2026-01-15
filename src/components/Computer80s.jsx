
import React, { forwardRef, useState, useRef, useMemo } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const Computer80s = forwardRef((props, ref) => {
    const { nodes, materials, scene } = useGLTF('/arcadeMachineBenoujja.glb');
    const [hovered, setHovered] = useState(false);
    const internalRef = useRef();
    const { camera } = useThree();
    const raycaster = useRef(new THREE.Raycaster());

    // Debug logging throttling
    const frameCount = useRef(0);

    // Create a memoized clone for the outline to avoid mutating the original scene
    const outlineScene = useMemo(() => {
        const clone = scene.clone();
        // Traverse and apply outline material
        // Inverted Hull method: scale up + back side + basic color
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: '#00ffff', // Cyan
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6,
            depthTest: true, // Keep depth test to not show through walls
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
        // Raycast from center of screen (0, 0)
        raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);

        if (internalRef.current) {
            // Note: We intersect the original scene, not the outline
            const intersects = raycaster.current.intersectObject(internalRef.current, true);

            // Debug logs every 60 frames (approx 1 second)
            if (frameCount.current % 60 === 0) {
                console.log('Raycast Check:', {
                    hit: intersects.length > 0,
                    distance: intersects[0]?.distance,
                    object: intersects[0]?.object.name
                });
            }
            frameCount.current++;

            const isHit = intersects.length > 0;
            // "Close distance" threshold for interaction
            // INCREASED to 50 based on user feedback (camera distance + model scale)
            const isClose = isHit && intersects[0].distance < 60;

            // Debug distance occasionally


            // Handle Interaction State for Parent (Strict range)
            if (props.onInteractionChange) {
                // We use a ref to track previous state to avoid infinite render loops in parent
                if (internalRef.current.userData.canInteract !== isClose) {

                    internalRef.current.userData.canInteract = isClose;
                    props.onInteractionChange(isClose);
                }
            } else {
                if (frameCount.current % 120 === 0) console.warn("onInteractionChange prop is missing!");
            }

            // Update local hovered state for visual feedback (outline, label)
            if (hovered !== isClose) {
                setHovered(isClose);
            }
        }
    });

    // Extract style props to apply to group, pass others (like ref) if needed
    // Actually, we can just spread props to group, but we need to match ref

    return (
        <group ref={internalRef} {...props}>
            {/* Original Model - Local 0,0,0 */}
            <primitive object={scene} ref={ref} />

            {/* Hull Outline - Only visible on hover - Local 0,0,0, slightly scaled */}
            {hovered && (
                <primitive
                    object={outlineScene}
                    scale={[1.03, 1.03, 1.03]} // Relative to group
                />
            )}

            {/* Label - Always visible */}
            <Html
                position={props.labelPosition || [0.5, 1, 0]}
                center
                distanceFactor={15}
                zIndexRange={[200, 0]} // High Z-index range
                style={{ pointerEvents: 'none' }}
            >
                <div style={{
                    color: '#4db8ff',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '48px',
                    fontWeight: 'bold',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '16px 32px', // increased padding to match scale
                    border: '4px solid #4db8ff', // increased border thickness
                    borderRadius: '16px', // increased radius
                    textShadow: '0 0 20px #4db8ff', // increased glow
                    whiteSpace: 'nowrap',
                    boxShadow: '0 0 40px rgba(77, 184, 255, 0.4)'
                }}>
                    ME
                </div>
            </Html>
        </group>
    );
});

useGLTF.preload('/arcadeMachineBenoujja.glb');
