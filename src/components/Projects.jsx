import React from 'react';
import { portfolioData } from '../data';
import { ExternalLink } from 'lucide-react';

const Projects = () => {
    return (
        <section className="projects-section">
            <div className="container">
                <h2 className="section-title">Selected Projects</h2>

                <div className="projects-grid">
                    {portfolioData.projects.map((project, index) => (
                        <div key={index} className="project-card">
                            <div className="project-header">
                                <h3 className="project-title">{project.title}</h3>
                                <a href={project.link} className="project-link" target="_blank" rel="noreferrer">
                                    <ExternalLink size={20} />
                                </a>
                            </div>
                            <p className="project-description">{project.description}</p>
                            <div className="project-tags">
                                {project.tags.map((tag, tagIndex) => (
                                    <span key={tagIndex} className="project-tag">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="github-cta">
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-primary">
                        View GitHub
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Projects;
