import React, { useState, useEffect } from 'react';

const ARCADE_DATA = {
    profile: {
        name: "OUSSAMA BENOUJJA",
        role: "LVL 1 JUNIOR FULL-STACK / DEVOPS",
        location: "BERKANE, MOROCCO",
        story: [
            "Initiating System...",
            "Loading Background: Student at YouCode | UM6P.",
            "Class: Junior Full-Stack Developer with strong foundation in JavaScript, Backend, and Linux systems.",
            "Mission: Build reliable, scalable web applications.",
            "Status: Fast learner, technically curious."
        ],
        attributes: [
            { label: "STR", value: 85, name: "BACKEND" },
            { label: "INT", value: 90, name: "SOLVING" },
            { label: "DEX", value: 80, name: "FRONTEND" },
            { label: "WIS", value: 75, name: "DEVOPS" }
        ]
    },
    skills: [
        { name: "JavaScript (ES6+)", level: 90 },
        { name: "NextJS", level: 85 },
        { name: "NestJS", level: 80 },
        { name: "Node.js / Express", level: 85 },
        { name: "React", level: 80 },
        { name: "MongoDB / SQL", level: 75 },
        { name: "Docker / Linux", level: 70 },
        { name: "Git / SSH", level: 85 }
    ],
    experience: [
        {
            company: "SYGMA.AI",
            role: "Full-Stack Intern",
            date: "JUNE - AUG 2025",
            desc: "Worked on 3D-enhanced e-commerce & AI mesh-generation."
        }
    ]
};

const PIXEL_CURSOR = `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMiAyVjIyTDYgMThIMTBMMTQgMjZMMTggMjRMMTQgMTZIMThMMiAyWiIgZmlsbD0iIzBmZiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'), auto`;

const MePage = ({ onClose }) => {
    const [view, setView] = useState('MENU'); // MENU, PROFILE, SKILLS
    const [selectedIdx, setSelectedIdx] = useState(0);

    // Web Audio API for Retro Sounds
    const playRetroSound = (type) => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'hover') {
            // Short high blip
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.05, ctx.currentTime); // Low volume
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } else if (type === 'select') {
            // "Coin" / Confirm sound
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);

            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (view === 'MENU') {
                if (e.key === 'ArrowUp') {
                    setSelectedIdx(prev => (prev > 0 ? prev - 1 : 2));
                    playRetroSound('hover');
                }
                if (e.key === 'ArrowDown') {
                    setSelectedIdx(prev => (prev < 2 ? prev + 1 : 0));
                    playRetroSound('hover');
                }
                if (e.key === 'Enter' || e.key === ' ') {
                    playRetroSound('select');
                    setTimeout(() => {
                        if (selectedIdx === 0) setView('PROFILE');
                        if (selectedIdx === 1) setView('SKILLS');
                        if (selectedIdx === 2) onClose();
                    }, 50); // Slight delay for sound feeling
                }
            } else {
                if (e.key === 'Escape' || e.key === 'Backspace') {
                    playRetroSound('select');
                    setView('MENU');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [view, selectedIdx, onClose]);

    // Pass sound function to sub-components
    const withSound = (action, type = 'select') => () => {
        playRetroSound(type);
        action();
    };

    // Background Music Logic
    const audioRef = React.useRef(null);

    useEffect(() => {
        const initMusic = () => {
            if (audioRef.current) return; // Already running

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const masterGain = ctx.createGain();
            masterGain.gain.value = 0.2; // Increased volume for visibility
            masterGain.connect(ctx.destination);

            // Filter for "underwater/space" effect
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Opened up filter slightly
            filter.Q.value = 1;
            filter.connect(masterGain);

            // LFO to modulate filter (Breathing effect)
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.2; // Slow modulation 0.2Hz
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 150; // Increased modulation depth
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            lfo.start();

            // Chord: Root, Minor Third, Fifth (Am) + Octave up for phone speakers
            // A1 (55), C2 (65.4), E2 (82.4) + A2 (110)
            const freqs = [55, 65.41, 82.41, 110.0, 130.81];
            const oscs = freqs.map(f => {
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth'; // Sawtooth cuts through better
                osc.frequency.value = f;
                osc.connect(filter);
                osc.start();
                return osc;
            });

            console.log('Audio Context Started:', ctx.state);
            audioRef.current = { ctx, masterGain, oscs, lfo, filter };
        };

        // Try to start music immediately, browser might block until interaction
        initMusic();

        // If blocked, resume on first click
        const handleInteraction = () => {
            if (audioRef.current?.ctx?.state === 'suspended') {
                audioRef.current.ctx.resume().then(() => {
                    console.log('Audio Context Resumed via Interaction');
                });
            }
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            if (audioRef.current) {
                const { ctx, masterGain, oscs, lfo } = audioRef.current;
                // Fade out
                masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
                oscs.forEach(o => o.stop(ctx.currentTime + 1));
                lfo.stop(ctx.currentTime + 1);
                setTimeout(() => ctx.close(), 1000);
            }
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Press Start 2P", cursive',
            color: '#0f0',
            overflow: 'hidden',
            cursor: PIXEL_CURSOR // Custom Pixel Cursor
        }}>
            {/* CRT Overlay Effects */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 2px, 3px 100%',
                zIndex: 3002
            }} />
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundColor: 'rgba(0, 255, 0, 0.02)',
                animation: 'flicker 0.15s infinite',
                zIndex: 3001
            }} />

            {/* Main Container */}
            <div className="arcade-container" style={{
                width: '90%',
                maxWidth: '1000px',
                height: '80%',
                border: '4px solid #0f0',
                boxShadow: '0 0 20px #0f0, inset 0 0 20px #0f0',
                borderRadius: '20px',
                padding: '40px',
                position: 'relative',
                backgroundColor: 'rgba(0, 20, 0, 0.9)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #0f0', paddingBottom: '20px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        textShadow: '4px 4px #f0f',
                        marginBottom: '10px'
                    }}>
                        ARCADE PORTFOLIO
                    </h1>
                    <p style={{ fontSize: '12px', color: '#0ff' }}>CREDITS: 1 | OUSSAMA BENOUJJA</p>
                </div>

                {/* Content View */}
                <div style={{ height: 'calc(100% - 120px)', position: 'relative' }}>
                    {view === 'MENU' && <MenuCmp selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx} onClose={withSound(onClose)} setView={(v) => { playRetroSound('select'); setView(v); }} playSound={playRetroSound} />}
                    {view === 'PROFILE' && <ProfileCmp data={ARCADE_DATA.profile} exp={ARCADE_DATA.experience} onBack={withSound(() => setView('MENU'))} />}
                    {view === 'SKILLS' && <SkillsCmp skills={ARCADE_DATA.skills} onBack={withSound(() => setView('MENU'))} />}
                </div>

                {/* Footer Controls */}
                <div style={{ position: 'absolute', bottom: '20px', left: '0', width: '100%', textAlign: 'center', fontSize: '12px', color: '#888' }}>
                    [ARROWS] SELECT &nbsp;&nbsp; [ENTER] START &nbsp;&nbsp; [ESC] BACK/EXIT
                </div>
            </div>

            <style>{`
                @keyframes flicker {
                    0% { opacity: 0.97; }
                    50% { opacity: 1; }
                    100% { opacity: 0.98; }
                }
                .arcade-btn:hover {
                    background-color: #0f0;
                    color: #000;
                    cursor: pointer;
                }
                
                /* Responsive Styles */
                @media (max-width: 768px) {
                    .arcade-container {
                        width: 98% !important; /* Use almost full width */
                        height: 90vh !important;
                        padding: 5px !important; /* Minimal padding */
                        display: flex;
                        flex-direction: column;
                    }
                    .arcade-container > div:first-child { 
                        margin-bottom: 5px !important; 
                        padding-bottom: 5px !important;
                        flex-shrink: 0;
                    }
                    .arcade-container h1 {
                        font-size: 12px !important; /* Very compact title */
                        margin-bottom: 2px !important;
                    }
                    .arcade-container p {
                        font-size: 6px !important;
                    }
                    
                    /* Content Area */
                    .arcade-container > div:nth-child(2) {
                        height: auto !important;
                        flex-grow: 1;
                        overflow-y: auto !important;
                        padding-bottom: 20px; 
                    }

                    /* Menu Items */
                    .menu-item {
                        width: 220px !important; /* Fixed narrow width */
                        font-size: 10px !important; /* Smallest readable size */
                        padding: 6px !important; 
                        margin-bottom: 5px !important;
                        height: auto !important;
                        border-width: 1px !important;
                        box-shadow: none !important;
                        align-self: center !important;
                    }
                    
                    /* Menu Container in Mobile */
                    .menu-container {
                        justify-content: center !important;
                        padding-top: 5px;
                        gap: 8px !important;
                        width: 100% !important;
                    }

                    /* Profile & Skills */
                    .profile-container {
                        gap: 15px !important;
                        margin-bottom: 20px !important;
                    }
                    .skills-grid {
                        grid-template-columns: 1fr !important;
                        gap: 10px !important;
                    }
                    
                    /* Footer */
                    .desktop-hint { display: none; }
                    .mobile-hint { display: inline !important; }
                    .arcade-container > div:last-child {
                        bottom: 10px !important;
                        font-size: 8px !important;
                        background: rgba(0, 20, 0, 0.9); /* Background to hide overlap */
                        padding: 5px;
                    }
                }
            `}</style>
        </div>
    );
};

const MenuCmp = ({ selectedIdx, setSelectedIdx, onClose, setView, playSound }) => {
    const items = [
        { label: "WHO AM I?", action: () => setView('PROFILE') },
        { label: "SKILLS & STATS", action: () => setView('SKILLS') },
        { label: "EXIT GAME", action: onClose }
    ];

    return (
        <div className="menu-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '30px', width: '100%' }}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    onMouseEnter={() => {
                        if (selectedIdx !== idx) {
                            setSelectedIdx(idx);
                            playSound('hover');
                        }
                    }}
                    onClick={item.action} // Action is already wrapped or handles sound in parent if passed correctly, wait.
                    // Actually, onClick logic in MenuCmp items calls item.action.
                    // item.action for "EXIT GAME" calls onClose (which is wrapped).
                    // item.action for "WHO AM I" calls setView (wrapped?).
                    // Let's look at passed props in render:
                    // setView={(v) => { playRetroSound('select'); setView(v); }}
                    // onClose={withSound(onClose)}
                    // So click is handled.
                    style={{
                        fontSize: '24px',
                        color: selectedIdx === idx ? '#000' : '#0f0',
                        backgroundColor: selectedIdx === idx ? '#0f0' : 'transparent',
                        padding: '15px 30px',
                        border: '2px solid #0f0',
                        cursor: 'pointer',
                        transform: selectedIdx === idx ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.1s',
                        width: '400px',
                        textAlign: 'center',
                        boxShadow: selectedIdx === idx ? '0 0 15px #0f0' : 'none'
                    }}
                >
                    {selectedIdx === idx && "> "}{item.label}
                </div>
            ))}
        </div>
    );
};

const ProfileCmp = ({ data, exp, onBack }) => (
    <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
        <h2 style={{ color: '#0ff', marginBottom: '20px' }}>// PLAYER PROFILE</h2>

        <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {/* Avatar Placeholder */}
            <div style={{
                width: '150px', height: '150px', border: '4px solid #f0f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#200020'
            }}>
                <span style={{ fontSize: '40px' }}>👾</span>
            </div>

            <div>
                <p style={{ marginBottom: '10px' }}>NAME: <span style={{ color: '#fff' }}>{data.name}</span></p>
                <p style={{ marginBottom: '10px' }}>CLASS: <span style={{ color: '#f0f' }}>{data.role}</span></p>
                <p style={{ marginBottom: '10px' }}>BASE: <span style={{ color: '#fff' }}>{data.location}</span></p>
                <div style={{ marginTop: '20px', fontSize: '10px', lineHeight: '1.8', maxWidth: '500px' }}>
                    {data.story.map((line, i) => <div key={i}>{'> ' + line}</div>)}
                </div>
            </div>
        </div>

        <h3 style={{ color: '#ff0', marginBottom: '20px' }}>// QUEST LOG (EXPERIENCE)</h3>
        {exp.map((job, i) => (
            <div key={i} style={{ marginBottom: '25px', borderLeft: '4px solid #f0f', paddingLeft: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#fff', fontSize: '14px' }}>{job.role}</span>
                    <span style={{ color: '#0ff', fontSize: '12px' }}>{job.date}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>@ {job.company}</div>
                <div style={{ fontSize: '10px', marginTop: '5px', color: '#ccc' }}>{job.desc}</div>
            </div>
        ))}

        <button onClick={onBack} className="arcade-btn" style={{ marginTop: '20px', background: 'transparent', border: '2px solid #f0f', color: '#f0f', padding: '10px 20px', fontFamily: 'inherit' }}>
            {"< BACK"}
        </button>
    </div>
);

const SkillsCmp = ({ skills, onBack }) => (
    <div style={{ height: '100%', overflowY: 'auto' }}>
        <h2 style={{ color: '#0ff', marginBottom: '30px' }}>// POWER UPS (SKILLS)</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {skills.map((skill, i) => (
                <div key={i} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                    </div>
                    <div style={{ width: '100%', height: '15px', border: '2px solid #fff', padding: '2px' }}>
                        <div style={{
                            width: `${skill.level}%`, height: '100%',
                            backgroundColor: i % 2 === 0 ? '#0f0' : '#f0f',
                            boxShadow: `0 0 10px ${i % 2 === 0 ? '#0f0' : '#f0f'}`
                        }} />
                    </div>
                </div>
            ))}
        </div>

        <div style={{ marginTop: '40px', borderTop: '2px dashed #444', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '15px' }}>EDUCATION</h3>
            <div style={{ fontSize: '10px', lineHeight: '2' }}>
                <p>🎓 FULLSTACK DEV (MERN) - YOUCODE | UM6P (2024-2026)</p>
            </div>
        </div>

        <button onClick={onBack} className="arcade-btn" style={{ marginTop: '40px', background: 'transparent', border: '2px solid #f0f', color: '#f0f', padding: '10px 20px', fontFamily: 'inherit' }}>
            {"< BACK"}
        </button>
    </div>
);

export default MePage;
