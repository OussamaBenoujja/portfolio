import React, { useState, useEffect, Suspense } from 'react';
import ParticleHero from './components/ParticleHero';
import Experience from './components/Experience';
import LoadingScreen from './components/LoadingScreen';
import AboutMeScene from './components/AboutMeScene';

// import { ShuttleTunerScene } from './components/ShuttleTunerScene';

function App() {
    // TEMPORARY: Render Tuner Scene Only
    // return <ShuttleTunerScene />;

    // State for main scene vs separate playable scenes
    const [currentScene, setCurrentScene] = useState('main');
    const [viewMode, setViewMode] = useState('hero');

    useEffect(() => {
        if (viewMode === 'projects') {
            document.body.classList.add('cursor-active');
        } else {
            document.body.classList.remove('cursor-active');
        }
    }, [viewMode]);

    return (
        <div className="app">
            {/* Loading Screen Overlay */}
            <LoadingScreen />

            {/* Scene Routing */}
            <Suspense fallback={null}>
                {currentScene === 'main' && (
                    <Experience
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onAboutMeEnter={() => setCurrentScene('about-me')}
                    />
                )}
                {currentScene === 'about-me' && (
                    <AboutMeScene onBack={() => setCurrentScene('main')} />
                )}
            </Suspense>

            {/* UI Overlays (Only visible in Main Scene for now) */}
            {currentScene === 'main' && (
                <div style={{
                    opacity: viewMode === 'hero' ? 1 : 0,
                    transition: 'opacity 1s ease',
                    pointerEvents: 'none'
                }}>
                    <ParticleHero />
                </div>
            )}
        </div>
    );
}

export default App;
