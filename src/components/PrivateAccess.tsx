
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { SpinningLogo } from './SpinningLogo';

// Geometric Network Background Animation
const SecurityNetwork: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: { x: number; y: number; vx: number; vy: number }[] = [];
        const particleCount = width < 768 ? 40 : 80;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }

        let animationFrameId: number;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#CB5C38'; // Matteo Orange
            ctx.strokeStyle = 'rgba(240, 100, 54, 0.15)'; // Faint orange lines

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Draw Connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

export const PrivateAccess: React.FC = () => {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'verifying' | 'granted' | 'denied'>('idle');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('verifying');

        // Simulate API check
        setTimeout(() => {
            // Accept 'MATTEO' or any code > 3 chars for demo
            if (code.length > 3) {
                setStatus('granted');
                setTimeout(() => navigate('/portal'), 1500);
            } else {
                setStatus('denied');
                setTimeout(() => setStatus('idle'), 2000);
            }
        }, 1200);
    };

    return (
        <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center text-white relative overflow-y-auto">
            <Helmet>
                <title>Private Access | Matteo Perin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <SecurityNetwork />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_80%)] z-0"></div>

            <div className="relative z-10 w-full max-w-md px-8 text-center">

                <div className={`mb-12 transition-all duration-1000 transform ${status === 'granted' ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
                    <div className="inline-block relative">
                        <SpinningLogo size={80} duration={15} />
                        {status === 'verifying' && (
                            <div className="absolute inset-[-20%] border border-matteo-orange/30 rounded-full animate-ping"></div>
                        )}
                    </div>
                </div>

                <div className={`transition-all duration-700 ${status === 'granted' ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <h1 className="font-serif text-3xl md:text-4xl font-light mb-2 tracking-tight text-white">
                        The Vault
                    </h1>
                    <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-16">
                        By Invitation Only
                    </p>

                    <form onSubmit={handleSubmit} className="w-full max-w-xs mx-auto flex flex-col items-center relative">

                        {/* Terminal Input UI */}
                        <div className="relative w-full group mb-12">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-matteo-orange opacity-50 font-mono text-sm">
                                &gt;
                            </div>
                            <input
                                type="password"
                                value={code}
                                onChange={(e) => { setCode(e.target.value); if (status === 'denied') setStatus('idle'); }}
                                placeholder="PASSPHRASE"
                                className="w-full bg-transparent border-b border-white/10 py-3 pl-8 text-center text-lg md:text-xl font-sans uppercase tracking-[0.25em] text-white placeholder-white/10 focus:outline-none focus:border-matteo-orange transition-all duration-500"
                                autoFocus
                                disabled={status === 'verifying' || status === 'granted'}
                            />

                            {/* Status Message Overlay */}
                            <div className="absolute top-full left-0 w-full text-center mt-4">
                                {status === 'verifying' && (
                                    <span className="font-mono text-[10px] text-matteo-orange animate-pulse">
                                        VERIFYING IDENTITY...
                                    </span>
                                )}
                                {status === 'denied' && (
                                    <span className="font-mono text-[10px] text-red-500">
                                        ACCESS DENIED
                                    </span>
                                )}
                                {status === 'granted' && (
                                    <span className="font-mono text-[10px] text-green-500">
                                        WELCOME
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status !== 'idle' || code.length === 0}
                            className={`
                            group relative px-8 py-3 overflow-hidden border border-white/10 transition-all duration-500
                            ${code.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                        `}
                        >
                            <div className="absolute inset-0 bg-matteo-orange translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
                            <span className="relative z-10 font-sans text-[10px] uppercase tracking-[0.2em] group-hover:text-black transition-colors duration-500">
                                Unlock
                            </span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Cinematic Flash on Success */}
            <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-1000 z-50 ${status === 'granted' ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
    );
};
