import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Stars, KeyboardControls, Environment, useGLTF } from '@react-three/drei';
import Character from './Character';
import { EagleModule } from './EagleModule';
import { Computer80s } from './Computer80s';
import * as THREE from 'three';
import { Leva, useControls } from 'leva';
import VirtualJoystick from './VirtualJoystick';
import ControlsHelp from './ControlsHelp';
import InteractionPrompt from './InteractionPrompt';
import MePage from './MePage';
import SkillRing from './SkillRing';
import { FlagGoats } from './FlagGoats';
import GoatsPopup from './GoatsPopup';

const EAGLE_DEFAULTS = {
    position: [7, -3, -65],
    rotation: [0, -0.1, 0],
    scale: 0.2
};

const MAP_RADIUS = 300;
const EAGLE_COLLIDER_RADIUS = 8; // Adjust based on model size

const EagleModuleWithControls = () => {
    return <EagleModule position={EAGLE_DEFAULTS.position} rotation={EAGLE_DEFAULTS.rotation} scale={EAGLE_DEFAULTS.scale} />;
};

const Computer80sWithControls = ({ onInteractionChange }) => {
    // Fixed coordinates after tuning
    const position = [0, -1, 100];
    const rotation = [0, -4.641592653589793, 0];
    const scale = 4;
    const labelPosition = [0.5, 1, 0];

    return <Computer80s position={position} rotation={rotation} scale={scale} labelPosition={labelPosition} onInteractionChange={onInteractionChange} />;
};

const FlagGoatsWithControls = ({ onInteractionChange }) => {
    // Fixed coordinates
    const position = [10, 1, 12];
    const rotation = [0, 0, 0];
    const scale = 6;

    return <FlagGoats position={position} rotation={rotation} scale={scale} onInteractionChange={onInteractionChange} />;
};

const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
    { name: 'run', keys: ['Shift'] },
];

const MoonTerrain = React.forwardRef((props, ref) => {
    const { scene } = useGLTF('/moonTerrin.glb');
    return <primitive object={scene} ref={ref} {...props} />;
});

const TPSCamera = ({ characterRef }) => {
    // Fixed camera settings
    const targetY = 6.3;
    const followSpeed = 0.83;
    const distance = 10;

    // Store current pivot position for smoothing
    const pivot = useRef(new THREE.Vector3());
    const initialized = useRef(false);

    useFrame((state) => {
        if (characterRef.current) {
            const playerPos = characterRef.current.position;
            const camera = state.camera;

            // Ideal pivot point (Target)
            const targetPivot = new THREE.Vector3(playerPos.x, playerPos.y + targetY, playerPos.z);

            if (!initialized.current) {
                pivot.current.copy(targetPivot);
                initialized.current = true;
            }

            // Smoothly move the pivot point towards the target
            pivot.current.lerp(targetPivot, followSpeed);

            // Position camera at the pivot, then move it back
            // We copy rotation from camera (controlled by PointerLock) to determine "back"

            // 1. Place camera at pivot
            camera.position.copy(pivot.current);

            // 2. Move camera back along its local Z axis (which is determined by look direction)
            // PointerLockControls controls the rotation of the camera object.
            camera.translateZ(distance);
        }
    });
    return null;
};

const AboutMeScene = () => {
    const characterRef = useRef();
    const terrainRef = useRef();
    const [joystickState, setJoystickState] = React.useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = React.useState(false);

    // Interaction State: 'computer', 'goats', or null
    const [interactionTarget, setInteractionTarget] = React.useState(null);
    const [showMePage, setShowMePage] = React.useState(false);
    const [showGoatsPopup, setShowGoatsPopup] = React.useState(false);

    // Handle 'F' key press for interaction
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key.toLowerCase() === 'f') {
                if (interactionTarget && !showMePage && !showGoatsPopup) {
                    console.log(`INTERACTION TRIGGERED with ${interactionTarget}`);
                    if (interactionTarget === 'computer') {
                        setShowMePage(true);
                    } else if (interactionTarget === 'goats') {
                        setShowGoatsPopup(true);
                    }
                    document.exitPointerLock(); // Unlock cursor
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [interactionTarget, showMePage, showGoatsPopup]);

    // Close handlers
    const handleCloseMePage = () => setShowMePage(false);
    const handleCloseGoatsPopup = () => setShowGoatsPopup(false);

    // Helper to set interaction target with debounce/check
    const handleInteractionChange = (target, isClose) => {
        if (isClose) {
            setInteractionTarget(target);
        } else {
            setInteractionTarget(prev => (prev === target ? null : prev));
        }
    };

    const eagleCollider = React.useMemo(() => ({
        position: new THREE.Vector3(...EAGLE_DEFAULTS.position),
        radius: EAGLE_COLLIDER_RADIUS
    }), []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches || ('ontouchstart' in window));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Pointer Lock Change Listener for Cursor Visibility
    useEffect(() => {
        const handlePointerLockChange = () => {
            if (document.pointerLockElement === null) {
                document.body.classList.add('cursor-active');
            } else {
                document.body.classList.remove('cursor-active');
            }
        };

        document.addEventListener('pointerlockchange', handlePointerLockChange);
        document.addEventListener('mozpointerlockchange', handlePointerLockChange);

        // Initial check
        if (document.pointerLockElement === null) {
            document.body.classList.add('cursor-active');
        }

        return () => {
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            document.removeEventListener('mozpointerlockchange', handlePointerLockChange);
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative' }}>
            {/* Crosshair */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '8px',
                height: '8px',
                background: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1000
            }} />

            {/* UI Overlays */}
            <ControlsHelp />
            {isMobile && <VirtualJoystick onMove={setJoystickState} />}
            <InteractionPrompt visible={!!interactionTarget && !showMePage && !showGoatsPopup} />
            {showMePage && <MePage onClose={handleCloseMePage} />}
            {showGoatsPopup && <GoatsPopup onClose={handleCloseGoatsPopup} />}



            <Leva collapsed={false} />
            <KeyboardControls map={keyboardMap}>
                <Canvas shadows camera={{ position: [0, 5, 10], fov: 60, far: 200000 }}>
                    {/* Lighting: Stark Space Lighting */}
                    <ambientLight intensity={0.5} />
                    <hemisphereLight intensity={1} groundColor="#000000" />
                    <directionalLight
                        position={[20, 10, -10]}
                        intensity={2}
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                    />

                    {/* Atmosphere */}
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                    {/* Sky Ring of Skills */}
                    <Suspense fallback={null}>
                        <SkillRing />
                    </Suspense>

                    {/* Ground: Moon Terrain */}
                    <MoonTerrain ref={terrainRef} scale={[200, 200, 200]} position={[0, -2, 0]} receiveShadow />

                    {/* Character - Pass terrain ref */}
                    <Character
                        ref={characterRef}
                        terrainRef={terrainRef}
                        position={[0, 0, 0]}
                        scale={[0.5, 0.5, 0.5]}
                        eagleCollider={eagleCollider}
                        mapRadius={MAP_RADIUS}
                        joystickInput={joystickState}
                    />

                    <EagleModuleWithControls />
                    <Computer80sWithControls onInteractionChange={(val) => handleInteractionChange('computer', val)} />
                    <FlagGoatsWithControls onInteractionChange={(val) => handleInteractionChange('goats', val)} />

                    {/* TPS Camera Logic */}
                    <TPSCamera characterRef={characterRef} />

                    {/* Controls - PointerLock for 'Mouse Look' - Only active when menu is closed */}
                    {!showMePage && !showGoatsPopup && <PointerLockControls makeDefault />}
                </Canvas>
            </KeyboardControls>
        </div>
    );
};

export default AboutMeScene;
