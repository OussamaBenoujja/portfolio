import React from 'react';

const Navbar = ({ currentScene, viewMode, onNavigate }) => {

    const navItems = [
        { id: 'home', label: 'HOME', scene: 'main', view: 'hero' },
        { id: 'about', label: 'ABOUT ME', scene: 'about-me', view: null },
        { id: 'projects', label: 'PROJECTS', scene: 'main', view: 'projects' }
    ];

    const isActive = (item) => {
        if (item.scene !== currentScene) return false;
        if (item.view && item.view !== viewMode) return false;
        return true;
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4000,
            display: 'flex',
            gap: '10px',
            padding: '10px 20px',
            background: 'rgba(0, 10, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #0f0',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)'
        }}>
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.scene, item.view)}
                    style={{
                        background: isActive(item) ? '#0f0' : 'transparent',
                        color: isActive(item) ? '#000' : '#0f0',
                        border: '1px solid transparent',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontFamily: "'Orbitron', sans-serif", // Matching futuristic font
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textShadow: isActive(item) ? 'none' : '0 0 5px #0f0',
                        outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (!isActive(item)) {
                            e.target.style.background = 'rgba(0, 255, 0, 0.1)';
                            e.target.style.boxShadow = '0 0 10px #0f0';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isActive(item)) {
                            e.target.style.background = 'transparent';
                            e.target.style.boxShadow = 'none';
                        }
                    }}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
};

export default Navbar;
