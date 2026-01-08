import React, { useState, useEffect } from 'react';
import ParticleHero from './components/ParticleHero';
import Experience from './components/Experience';

// import { ShuttleTunerScene } from './components/ShuttleTunerScene';

function App() {
    // TEMPORARY: Render Tuner Scene Only
    // return <ShuttleTunerScene />;

    // Original App Content (Restored)
    const [viewMode, setViewMode] = useState('hero'); // 'hero' | 'projects'

    useEffect(() => {
        if (viewMode === 'projects') {
            document.body.classList.add('cursor-active');
        } else {
            document.body.classList.remove('cursor-active');
        }
    }, [viewMode]);

    return (
        <div className="app">
            {/* Unified 3D Experience */}
            <Experience viewMode={viewMode} setViewMode={setViewMode} />

            {/* 2D Overlay (Hero Text) - Fades out in projects mode */}
            <div style={{
                opacity: viewMode === 'hero' ? 1 : 0,
                transition: 'opacity 1s ease',
                pointerEvents: 'none'
            }}>
                <ParticleHero />
            </div>
        </div>
    );
}

export default App;
