import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AIInterfaceProps {
    onClose: () => void;
}

export const AIInterface: React.FC<AIInterfaceProps> = ({ onClose }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: "Beauty is the beginning of all things. How may I assist your journey?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        // Allow empty sends to simulate "Explore" clicks if desired, but for now restrict
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Response - Solomei Style (More poetic)
        setTimeout(() => {
            const responses = [
                "In Solomei, we believe that time is the true currency of luxury. Quality cannot be rushed.",
                "The garment is but a vessel for the spirit. We craft not just for the body, but for the soul.",
                "Harmony between the past and the future is where our design philosophy resides.",
                "Let me unveil the details of our latest creation, inspired by the muted tones of the Umbrian landscape.",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages(prev => [...prev, { role: 'ai', text: randomResponse }]);
            setIsTyping(false);
        }, 1800);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex flex-col bg-[#F2EFE9] dark:bg-[#0A0A0A] transition-colors duration-700"
        >
            {/* Header / Close */}
            <div className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
                <span className="font-serif italic text-matteo-stone opacity-50 text-sm">Matteo Perin Intelligence</span>
                <button onClick={onClose} className="group flex items-center gap-2 text-matteo-charcoal dark:text-matteo-cream text-[10px] tracking-luxury uppercase hover:text-matteo-orange transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-current group-hover:scale-0 transition-transform"></span>
                    Close Interaction
                </button>
            </div>

            {/* Main Chat Area - Centered & Clean */}
            <div className="flex-1 w-full max-w-4xl mx-auto pt-32 px-6 pb-40 overflow-y-auto hide-scrollbar scroll-smooth">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`mb-16 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-2xl ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <p className={`font-serif text-3xl md:text-5xl leading-tight ${msg.role === 'user' ? 'text-matteo-stone italic' : 'text-matteo-charcoal dark:text-matteo-cream'}`}>
                                {msg.text}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <div className="flex items-center gap-1 opacity-50">
                        <span className="font-sans text-[10px] tracking-widest uppercase">Thinking</span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-lg leading-none"
                        >.</motion.span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                            className="text-lg leading-none"
                        >.</motion.span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                            className="text-lg leading-none"
                        >.</motion.span>
                    </div>
                )}
            </div>

            {/* Input Area - Integrated, not floating */}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-matteo-cream dark:from-matteo-black via-matteo-cream dark:via-matteo-black to-transparent pt-20 pb-12 px-6">
                <form onSubmit={handleSend} className="max-w-2xl mx-auto relative border-b border-matteo-charcoal/20 dark:border-matteo-cream/20">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full bg-transparent py-4 text-xl font-serif text-matteo-charcoal dark:text-matteo-cream placeholder-matteo-stone/40 focus:outline-none"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-luxury text-matteo-charcoal dark:text-matteo-cream hover:text-matteo-orange transition-colors"
                    >
                        Enter
                    </button>
                </form>
            </div>

            {/* Background Texture Removed for performance */}
        </motion.div>
    );
};
