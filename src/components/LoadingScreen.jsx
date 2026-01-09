import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

const LoadingScreen = () => {
    const { progress } = useProgress();
    const [opacity, setOpacity] = useState(1);

    // Smooth transition out when progress is 100
    useEffect(() => {
        if (progress === 100) {
            // Keep it visible for a moment then fade
            const timer = setTimeout(() => setOpacity(0), 500); // 500ms delay
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (opacity === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#040406', // Deep space dark
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            opacity: opacity,
            transition: 'opacity 1s ease-in-out',
            pointerEvents: 'none',
        }}>
            {/* Mission Patch SVG Container */}
            <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Patch Border Ring */}
                    <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
                    <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4 4" />

                    {/* Filling Ring (Progress) */}
                    <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="#00C6FF"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 90}
                        strokeDashoffset={(2 * Math.PI * 90) * (1 - progress / 100)}
                        style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
                        transform="rotate(-90 100 100)"
                    />

                    {/* Rocket Icon (Central) */}
                    <path
                        d="M100 40C100 40 120 70 120 100C120 120 110 140 100 140C90 140 80 120 80 100C80 70 100 40 100 40Z"
                        stroke="white"
                        strokeWidth="3"
                        fill={progress > 99 ? "white" : "transparent"}
                        style={{ transition: 'fill 1s ease' }}
                    />
                    {/* Fins */}
                    <path d="M80 100L65 130L80 120" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M120 100L135 130L120 120" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Window */}
                    <circle cx="100" cy="90" r="8" stroke="white" strokeWidth="2" />

                    {/* Flame (Only visible when high progress) */}
                    <path
                        d="M100 145C100 145 95 160 100 170C105 160 100 145 100 145Z"
                        fill="#00C6FF"
                        style={{
                            opacity: progress > 50 ? (progress - 50) / 50 : 0,
                            transform: `scale(${1 + Math.sin(Date.now() / 100) * 0.1})`,
                            transformOrigin: 'center bottom'
                        }}
                    />
                </svg>
            </div>

            {/* Tech Text */}
            <div style={{
                marginTop: '20px',
                fontFamily: "'Rajdhani', monospace",
                color: '#00C6FF',
                fontSize: '18px',
                letterSpacing: '4px',
                textShadow: '0 0 10px rgba(0, 198, 255, 0.5)'
            }}>
                MISSION INITIALIZATION [ {Math.round(progress)}% ]
            </div>

            {/* Status Lines for aesthetics */}
            <div style={{
                width: '300px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                marginTop: '10px'
            }} />
        </div>
    );
};

export default LoadingScreen;
