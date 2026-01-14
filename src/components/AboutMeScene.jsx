import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Stars, KeyboardControls, Environment, useGLTF } from '@react-three/drei';
import Character from './Character';
import { EagleModule } from './EagleModule';
import { Computer80s } from './Computer80s';
import * as THREE from 'three';
import { Leva, useControls } from 'leva';
import VirtualJoystick from './VirtualJoystick';
import ControlsHelp from './ControlsHelp';

const EAGLE_DEFAULTS = {
    position: [7, -3, -65],
    rotation: [0, -0.1, 0],
    scale: 0.2
};

const MAP_RADIUS = 300;
const EAGLE_COLLIDER_RADIUS = 8; // Adjust based on model size

const EagleModuleWithControls = () => {
    const { position, rotation, scale } = useControls("Eagle Module", {
        position: { value: EAGLE_DEFAULTS.position, step: 1 },
        rotation: { value: EAGLE_DEFAULTS.rotation, step: 0.1 },
        scale: { value: EAGLE_DEFAULTS.scale, min: 0.1, max: 10, step: 0.1 }
    });

    return <EagleModule position={position} rotation={rotation} scale={scale} />;
};

const Computer80sWithControls = () => {
    const { position, rotation, scale, labelPosition } = useControls("Computer 80s", {
        position: { value: [5, -7, 116], step: 1 },
        rotation: { value: [0, -180, 0.2], step: 0.1 },
        scale: { value: 1.8, min: 0.1, max: 10, step: 0.1 },
        labelPosition: { value: [0.5, 5, 0], step: 0.5, label: "Label Offset" }
    });

    return <Computer80s position={position} rotation={rotation} scale={scale} labelPosition={labelPosition} />;
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
    const { targetY, followSpeed, distance } = useControls("Camera Settings", {
        targetY: { value: 6.3, min: 0, max: 10, label: "Look Height" },
        followSpeed: { value: 0.83, min: 0.01, max: 1, label: "Follow Speed" },
        distance: { value: 10, min: 2, max: 20, label: "Distance" }
    });

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
                    <Computer80sWithControls />

                    {/* TPS Camera Logic */}
                    <TPSCamera characterRef={characterRef} />

                    {/* Controls - PointerLock for 'Mouse Look' */}
                    <PointerLockControls makeDefault />
                </Canvas>
            </KeyboardControls>
        </div>
    );
};

export default AboutMeScene;
