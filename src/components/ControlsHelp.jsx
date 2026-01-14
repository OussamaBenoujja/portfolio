import React, { useState, useEffect } from 'react';
import { Keyboard, Mouse, Hand, Joystick } from 'lucide-react';

const ControlsHelp = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Simple check, can be refined
            setIsMobile(window.matchMedia("(max-width: 768px)").matches || ('ontouchstart' in window));
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const style = {
        position: 'absolute',
        bottom: '30px',
        right: '30px',
        background: 'rgba(10, 10, 20, 0.85)', // Deep space blue/black
        color: '#e0e0ff', // Soft blue-white text
        padding: '20px 25px',
        borderRadius: '12px',
        fontFamily: "'Orbitron', 'Courier New', monospace", // Futuristic-ish fallback
        fontSize: '16px', // Bigger font
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(100, 200, 255, 0.3)', // Cyan glow border
        boxShadow: '0 0 15px rgba(0, 150, 255, 0.2)', // Soft outer glow
        pointerEvents: 'none',
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        letterSpacing: '1px'
    };

    const rowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px', // More spacing
        textTransform: 'uppercase'
    };

    return (
        <div style={style}>
            <div style={{
                fontWeight: 'bold',
                marginBottom: '8px',
                borderBottom: '1px solid rgba(100, 200, 255, 0.3)',
                paddingBottom: '8px',
                color: '#4db8ff', // Cyan header
                fontSize: '14px',
                letterSpacing: '2px'
            }}>
                MISSION CONTROLS
            </div>

            {isMobile ? (
                // Mobile Controls
                <>
                    <div style={rowStyle}>
                        <Joystick size={24} color="#4db8ff" />
                        <span>Left Stick: Move</span>
                    </div>
                    <div style={rowStyle}>
                        <Hand size={24} color="#4db8ff" />
                        <span>Touch Drag: Look</span>
                    </div>
                </>
            ) : (
                // PC Controls
                <>
                    <div style={rowStyle}>
                        <Keyboard size={24} color="#4db8ff" />
                        <span>WASD: Move</span>
                    </div>
                    <div style={rowStyle}>
                        <Keyboard size={24} color="#4db8ff" />
                        <span>SHIFT: Run</span>
                    </div>
                    <div style={rowStyle}>
                        <Mouse size={24} color="#4db8ff" />
                        <span>Mouse: Look</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default ControlsHelp;
