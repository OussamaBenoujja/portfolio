import React from 'react';
import { portfolioData } from '../data';
import { ArrowDown } from 'lucide-react';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="container">
                <h1 className="hero-name fade-in">{portfolioData.name}</h1>
                <p className="hero-title fade-in-delay">{portfolioData.title}</p>

                <div className="skills-container fade-in-delay-2">
                    <p className="section-label">What I can do</p>
                    <div className="skills-grid">
                        {portfolioData.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="scroll-indicator fade-in-delay-3">
                    <ArrowDown size={24} />
                </div>
            </div>
        </section>
    );
};

export default Hero;
