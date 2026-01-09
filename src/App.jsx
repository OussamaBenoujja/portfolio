import React, { useState, useEffect, Suspense } from 'react';
import ParticleHero from './components/ParticleHero';
import Experience from './components/Experience';
import LoadingScreen from './components/LoadingScreen';

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
            {/* Loading Screen Overlay (Tracks global loading state) */}
            <LoadingScreen />

            {/* Unified 3D Experience */}
            <Suspense fallback={null}>
                <Experience viewMode={viewMode} setViewMode={setViewMode} />
            </Suspense>

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
