import React from 'react';

const GoatsPopup = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
            fontFamily: "'Orbitron', sans-serif",
            color: '#fff'
        }}>
            <div style={{
                width: '90%',
                maxWidth: '600px',
                background: 'linear-gradient(135deg, #1a0f00 0%, #332200 100%)',
                border: '2px solid #ffaa00',
                borderRadius: '20px',
                padding: '40px',
                position: 'relative',
                boxShadow: '0 0 50px rgba(255, 170, 0, 0.3)',
                textAlign: 'center'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '20px',
                        background: 'none',
                        border: 'none',
                        color: '#ffaa00',
                        fontSize: '24px',
                        cursor: 'pointer',
                        fontFamily: "'Press Start 2P', cursive"
                    }}
                >
                    X
                </button>

                <h1 style={{
                    color: '#ffaa00',
                    fontSize: '36px',
                    marginBottom: '20px',
                    textShadow: '0 0 10px #ffaa00'
                }}>
                    CLASS GOATS
                </h1>

                <h3 style={{
                    color: '#ffdcb3',
                    fontSize: '18px',
                    marginBottom: '30px',
                    fontStyle: 'italic'
                }}>
                    YouCode • Under Supervision of Mr. Zakaria ZIANE
                </h3>

                <p style={{
                    lineHeight: '1.8',
                    fontSize: '16px',
                    color: '#e0e0e0',
                    textAlign: 'justify',
                    marginBottom: '20px'
                }}>
                    The <strong>GOATS</strong> weren't just a class; we were a movement.
                    Forged in the fires of <strong>YouCode</strong>, under the expert mentorship of
                    <span style={{ color: '#ffaa00' }}> Mr. Zakaria ZIANE</span>, I had the privilege
                    of standing shoulder-to-shoulder with brilliant colleagues. Together, we tackled
                    complex projects, turned coffee into clean code, and built more than just software—we
                    built a legacy of relentless innovation and brotherhood.
                </p>

                <div style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '30px',
                    fontFamily: "'Press Start 2P', cursive"
                }}>
                    PRESS ESC TO CLOSE
                </div>
            </div>
        </div>
    );
};

export default GoatsPopup;
