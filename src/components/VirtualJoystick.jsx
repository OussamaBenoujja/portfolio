import React, { useState, useRef, useEffect } from 'react';

const VirtualJoystick = ({ onMove }) => {
    const joystickRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [active, setActive] = useState(false);
    const origin = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent camera controls from stealing touch
        setActive(true);
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        origin.current = { x: centerX, y: centerY };

        // Initial move if touched slightly off-center
        updatePosition(e.clientX, e.clientY);
    };

    const handlePointerMove = (e) => {
        if (!active) return;
        e.preventDefault();
        updatePosition(e.clientX, e.clientY);
    };

    const handlePointerUp = (e) => {
        e.preventDefault();
        setActive(false);
        setPosition({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
    };

    const updatePosition = (clientX, clientY) => {
        const maxDist = 35; // Stick radius limit
        const dx = clientX - origin.current.x;
        const dy = clientY - origin.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let x = dx;
        let y = dy;

        if (dist > maxDist) {
            const ratio = maxDist / dist;
            x *= ratio;
            y *= ratio;
        }

        setPosition({ x, y });

        // Normalize output (-1 to 1)
        // Invert Y because screen Y is top-down, but 3D forward is typically negative Z or positive Z depending on camera. 
        // We'll standardise: UP (screen top) = Forward (+1 or -1 depending on consumer), DOWN = Backward
        // Let's pass raw normalized cartesian: x right positive, y down positive.
        onMove({
            x: x / maxDist,
            y: y / maxDist
        });
    };

    // Global listeners for drag-outside release
    useEffect(() => {
        const onUp = () => {
            if (active) {
                setActive(false);
                setPosition({ x: 0, y: 0 });
                onMove({ x: 0, y: 0 });
            }
        };
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return () => {
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, [active, onMove]);


    return (
        <div
            ref={joystickRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            style={{
                position: 'fixed',
                bottom: '40px',
                left: '40px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                touchAction: 'none',
                zIndex: 2000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backdropFilter: 'blur(4px)'
            }}
        >
            <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '50%',
                transform: `translate(${position.x}px, ${position.y}px)`,
                pointerEvents: 'none',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
            }} />
        </div>
    );
};

export default VirtualJoystick;
