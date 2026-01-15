import React from 'react';

const InteractionPrompt = ({ visible }) => {
    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(0, 10, 20, 0.8)',
            border: '2px solid #00ffff',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.2)',
            fontFamily: "'Orbitron', sans-serif",
            color: '#ffffff',
            pointerEvents: 'none', // Ensure it doesn't block clicks
            zIndex: 2000,
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s ease-in-out',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                Click
            </span>

            {/* F Keycap */}
            <div style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#002030',
                border: '2px solid #ffffff',
                borderBottom: '4px solid #ffffff', // Keycap depth effect
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: '900',
                color: '#00ffff',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
            }}>
                F
            </div>

            <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                to interact
            </span>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, 10px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>
        </div>
    );
};

export default InteractionPrompt;
