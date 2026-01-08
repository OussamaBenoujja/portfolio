import React, { useRef, useEffect } from 'react';

const ParticleHero = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let animationFrameId;
        let particles = [];
        let mouse = { x: null, y: null, radius: 100 };

        const adjustCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        adjustCanvasSize();

        class Particle {
            constructor(x, y) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.baseX = x;
                this.baseY = y;
                this.size = 2;
                this.density = (Math.random() * 30) + 1;
                this.color = '#e6e6e6'; // Off-white
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            }
        }

        const init = () => {
            particles = [];

            // Draw text to get coordinates
            ctx.fillStyle = 'white';
            // Responsive font size
            const fontSize = Math.min(canvas.width / 15, 80);
            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const name = "Oussama Benoujja";
            const title = "FullStack Dev";

            ctx.fillText(name, canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = `300 ${fontSize * 0.5}px Inter, sans-serif`; // Increased from 0.4
            ctx.fillText(title, canvas.width / 2, canvas.height / 2 + 60); // Adjusted Y offset

            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Clear canvas after sampling
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create particles based on pixel data
            // Reduced gap for higher density and better legibility
            const gap = 3;

            for (let y = 0, y2 = textCoordinates.height; y < y2; y += gap) {
                for (let x = 0, x2 = textCoordinates.width; x < x2; x += gap) {
                    // Check alpha value (4th byte)
                    if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                        let positionX = x;
                        let positionY = y;
                        particles.push(new Particle(positionX, positionY));
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
                particles[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        const handleResize = () => {
            adjustCanvasSize();
            init();
        };

        const handleMouseMove = (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'block',
                position: 'absolute', // Required for zIndex to work
                top: 0,
                left: 0,
                background: 'transparent', // Transparent to show universe bg
                width: '100%',
                height: '100vh',
                zIndex: 10,
                cursor: 'none', // Hide default cursor for immersion,
                pointerEvents: 'none' // Allow clicks to pass through to SolarSystem
            }}
        />
    );
};

export default ParticleHero;
