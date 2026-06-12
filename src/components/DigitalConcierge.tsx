import React, { useState, useEffect, useRef } from 'react';
import { getGeminiModel } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { PRODUCTS } from '../constants';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useModalA11y } from '../lib/useModalA11y';

interface Message {
    role: 'user' | 'model';
    text: string;
    products?: number[];
    dossierComplete?: boolean;
}

const LOADING_PHRASES = [
    "Casa Matteo Perin curating your selection...",
    "Accessing the Milan Vault...",
    "Reviewing bespoke patterns...",
    "Crafting your luxury experience..."
];

const LOCAL_STORAGE_KEY = 'matteo_client_dossier';

// initialOpen: the App shell renders a lightweight launcher button and only
// mounts this component (plus its supabase/markdown dependencies) on first
// click — so the drawer should open immediately once loaded.
export const DigitalConcierge: React.FC<{ initialOpen?: boolean }> = ({ initialOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
    const [sessionUser, setSessionUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

    useModalA11y(isOpen, () => setIsOpen(false), drawerRef);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Auth Listener & Hydration
    useEffect(() => {
        const checkUserAndHydrate = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            setSessionUser(user);

            if (user) {
                // Fetch from Supabase
                const { data, error } = await supabase
                    .from('chat_history')
                    .select('role, text, products, dossier_complete, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });
                
                if (!error && data && data.length > 0) {
                    const loadedMessages = data.map(row => ({
                        role: row.role as 'user' | 'model',
                        text: row.text,
                        products: row.products || [],
                        dossierComplete: row.dossier_complete
                    }));
                    setMessages(loadedMessages);
                    triggerWelcomeBack(loadedMessages);
                } else {
                    setMessages([{ role: 'model', text: `Welcome to the private Dossier line, patron. How may I assist you with your curation?` }]);
                }
            } else {
                // Local Storage Hydration
                const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setMessages(parsed);
                            triggerWelcomeBack(parsed);
                        } else {
                            setMessages([{ role: 'model', text: "Welcome to Casa Matteo Perin. I am the Digital Concierge. How may I assist you with your curation?" }]);
                        }
                    } catch (e) {
                        setMessages([{ role: 'model', text: "Welcome to Casa Matteo Perin. I am the Digital Concierge. How may I assist you with your curation?" }]);
                    }
                } else {
                    setMessages([{ role: 'model', text: "Welcome to Casa Matteo Perin. I am the Digital Concierge. How may I assist you with your curation?" }]);
                }
            }
            setHasInitialized(true);
        };

        checkUserAndHydrate();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSessionUser(session?.user || null);
            setHasInitialized(false);
            checkUserAndHydrate();
        });

        return () => subscription.unsubscribe();
    }, []); // Only on mount

    // Save State (Local Storage fallback for non-authenticated users)
    useEffect(() => {
        if (hasInitialized && !sessionUser) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages, hasInitialized, sessionUser]);

    const triggerWelcomeBack = async (history: Message[]) => {
        // We only trigger this if the LAST message was NOT already a "Welcome back" or we just refreshed.
        // To prevent infinite loops or double welcomes if they just hit F5, we can just check if the last message was a model message... 
        // Actually, just sending a "Welcome back" greeting silently on mount.
        setIsTyping(true);
        const conversationLog = history.map(m => `${m.role === 'model' ? 'Casa Matteo Perin' : 'Client'}: ${m.text}`).join("\n");
        try {
            const prompt = `[CONVERSATION HISTORY]\n${conversationLog}\n\n[SYSTEM DIRECTIVE]\nThe client has just returned to Casa Matteo Perin. Based on their exact history above, generate a bespoke, highly personalized "Welcome back" 1-sentence greeting. Acknowledge their previous query (e.g. if discussing a jacket, ask if they are ready to proceed with the fitting). Maintain the violent perfection, silent luxury tone. Return strict JSON. {"message": "greeting string", "suggestedProducts": []}`;
            
            const clientContext = sessionUser ? `Authorized Patron: ${sessionUser.email}` : undefined;
            const model = getGeminiModel(clientContext);
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            let parsedData;
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error("No JSON found");
                parsedData = JSON.parse(jsonMatch[0]);
                setMessages(prev => [...prev, { role: 'model', text: parsedData.message, products: parsedData.suggestedProducts || [] }]);
            } catch (e) {
                console.error("Failed to parse welcome back JSON", responseText);
                setMessages(prev => [...prev, { role: 'model', text: `WELCOME BACK JSON FORMAT ERROR: The raw text received was -> ${responseText || 'EMPTY PAYLOAD'}` }]);
            }
        } catch (e) {
            console.error("Failed to generate welcome back", e);
        } finally {
            setIsTyping(false);
            setLoadingPhraseIndex(0);
        }
    };

    const clearDossier = async () => {
        if (sessionUser) {
            await supabase.from('chat_history').delete().eq('user_id', sessionUser.id);
            setMessages([{ role: 'model', text: "Dossier purged. Welcome to the private line. How may I assist you?" }]);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setMessages([{ role: 'model', text: "Dossier purged. Welcome to Casa Matteo Perin. I am the Digital Concierge. How may I assist you with your curation?" }]);
        }
    };

    // Artisanal loading phrase cycler
    useEffect(() => {
        if (!isTyping) return;
        const interval = setInterval(() => {
            setLoadingPhraseIndex(prev => (prev + 1) % LOADING_PHRASES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        
        // Snapshot current messages BEFORE adding the new user message, to build the log
        const conversationLog = messages.map(m => `${m.role === 'model' ? 'Casa Matteo Perin' : 'Client'}: ${m.text}`).join("\n");
        
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        if (sessionUser) {
            supabase.from('chat_history').insert({ user_id: sessionUser.id, role: 'user', text: userText }).then();
        }

        setInput('');
        setIsTyping(true);

        try {
            const augmentedPrompt = `[CONVERSATION HISTORY]\n${conversationLog}\n\n[CLIENT's NEW MESSAGE]\n${userText}\n\nAnalyze the entire history. If the client is building a Bespoke Dossier, continue the interview by asking the NEXT missing question (Name, Garment Type, Occasion). If all 3 are gathered, set dossierComplete to true. Respond in strict JSON.`;

            const clientContext = sessionUser ? `Authorized Patron: ${sessionUser.email}` : undefined;
            const model = getGeminiModel(clientContext);
            const result = await model.generateContent(augmentedPrompt);
            const responseText = result.response.text();
            
            // The model is strictly instructed to return JSON per the system prompt
            let parsedData;
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error("No JSON found");
                parsedData = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error("Failed to parse AI JSON response", responseText);
                // Fallback for strict markdown breakage
                parsedData = { message: "The secure line has experienced interference. Please repeat your precise query." };
            }

            const newModelMsg: Message = { 
                role: 'model', 
                text: parsedData.message, 
                products: parsedData.suggestedProducts || [],
                dossierComplete: parsedData.dossierComplete
            };
            setMessages(prev => [...prev, newModelMsg]);

            if (sessionUser) {
                supabase.from('chat_history').insert({ 
                    user_id: sessionUser.id, 
                    role: 'model', 
                    text: newModelMsg.text, 
                    products: newModelMsg.products, 
                    dossier_complete: newModelMsg.dossierComplete 
                }).then();
            }

            // Browser Hijacking Logic
            if (parsedData.navigateTo) {
                setTimeout(() => {
                    setIsOpen(false);
                    navigate(parsedData.navigateTo);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 2500); // Cinematic 2.5s delay to read the message before teleporting
            }
        } catch (error) {
            console.error("Gemini AI API Error (Network/Quota/Model):", error);
            
            // Heuristic Fallback Engine (Offline Mode)
            const lowerText = userText.toLowerCase();
            let fallbackMessage = "The Master Tailor is currently in a private fitting. Please leave your formal request, and Casa Matteo Perin will contact you shortly.";
            let fallbackProducts: number[] = [];
            
            if (lowerText.includes("jacket") || lowerText.includes("crocodile") || lowerText.includes("croc") || lowerText.includes("coat")) {
                fallbackMessage = "Our bespoke Nile or Porosus crocodile outerwear requires over 30 hours of strict symmetry mapping. Due to the high volume of private commissions today, the Master Tailor is currently in a fitting. May we arrange a private viewing?";
            } else if (lowerText.includes("price") || lowerText.includes("cost") || lowerText.includes("$") || lowerText.includes("how much")) {
                fallbackMessage = "Casa Matteo Perin operates strictly on private commission. Pieces generally begin at $15,000, with exotic outerwear starting at $185,000. Our team will reach out directly to discuss your specific vision.";
            } else if (lowerText.includes("bag") || lowerText.includes("briefcase") || lowerText.includes("luggage")) {
                fallbackMessage = "Our heritage leather goods represent the pinnacle of Italian craftsmanship. The Concierge line is currently saturated, but you may browse our existing selections below while you hold.";
                fallbackProducts = [1, 2]; // Weekender Bag, Heritage Clutch
            }
            
            const fallbackModelMsg: Message = { role: 'model', text: fallbackMessage, products: fallbackProducts };
            setMessages(prev => [...prev, fallbackModelMsg]);

            if (sessionUser) {
                supabase.from('chat_history').insert({ 
                    user_id: sessionUser.id, 
                    role: 'model', 
                    text: fallbackModelMsg.text, 
                    products: fallbackModelMsg.products
                }).then();
            }
        } finally {
            setIsTyping(false);
            setLoadingPhraseIndex(0);
        }
    };

    return (
        <>
            {/* The Trigger */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 lg:bottom-8 right-6 lg:right-8 z-[90000] mix-blend-difference opacity-70 hover:opacity-100 transition-opacity duration-700 flex flex-col items-end ${isOpen ? 'pointer-events-none opacity-0' : ''}`}
            >
                <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center mb-2">
                    <span className="font-serif italic text-white text-xl">M</span>
                </div>
                <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white">Concierge</span>
            </button>

            {/* The Elegant Drawer Subsystem */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Background Overlay Dimmer */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-[#020202]/60  z-[99998] cursor-pointer"
                        />

                        {/* The Drawer */}
                        <motion.div 
                            ref={drawerRef}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Digital Concierge"
                            tabIndex={-1}
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed top-0 right-0 h-[100dvh] w-full md:w-[480px] lg:w-[550px] bg-[#0a0a0a] border-l border-white/5 z-[99999] flex flex-col font-serif text-white shadow-2xl outline-none"
                        >
                            {/* Drawer Header */}
                            <div className="w-full p-6 md:p-8 flex justify-between items-center z-10 border-b border-white/5 bg-[#0a0a0a]">
                                <h2 className="font-serif text-lg tracking-widest font-light text-white/50">Casa Matteo Perin</h2>
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={clearDossier}
                                        className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors bg-transparent border-none outline-none"
                                    >
                                        Wipe
                                    </button>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/50 hover:text-white transition-colors bg-transparent border-none outline-none"
                                    >
                                        Close &times;
                                    </button>
                                </div>
                            </div>

                            {/* Immersive Chat Feed */}
                            <div className="flex-1 w-full overflow-y-auto px-6 py-8 scrollbar-hide">
                                {messages.map((msg, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.05 }}
                                        className={`mb-12 flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        {msg.role === 'user' ? (
                                            <div className="max-w-[85%] bg-white/5 p-4 pl-6 border-r-2 border-white/20">
                                                <h2 className="font-serif text-xl md:text-2xl text-white font-light leading-snug">
                                                    "{msg.text}"
                                                </h2>
                                            </div>
                                        ) : (
                                            <div className="w-full flex flex-col items-start pr-6">
                                                <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4 block">Concierge Analysis</span>
                                                {/* Poetic AI Markdown Box */}
                                                <div className="prose prose-invert prose-p:text-lg md:prose-p:text-xl text-left text-white/70 prose-a:text-white prose-a:border-b prose-a:border-white/30 hover:prose-a:border-white w-full leading-relaxed mb-8">
                                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                </div>

                                                {/* Product Gallery Injection */}
                                                {msg.products && msg.products.length > 0 && (
                                                    <div className="w-full flex flex-col gap-8 w-full">
                                                        {msg.products.map(id => {
                                                            const product = PRODUCTS.find(p => p.id === id);
                                                            if (!product) return null;
                                                            
                                                            const destination = (product.link && product.link !== "#") 
                                                                ? product.link 
                                                                : `/collection/${product.id}`;
                                                                
                                                            return (
                                                                <Link to={destination} key={product.id} onClick={() => setIsOpen(false)} className="w-full group relative block flex-shrink-0 animate-fade-in-up">
                                                                    <div className="w-full bg-[#050505] border border-white/10 p-4 mb-4 relative overflow-hidden flex items-center justify-center min-h-[40vh] transition-colors duration-700 group-hover:bg-[#0c0c0c] group-hover:border-white/30">
                                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10 pointer-events-none"></div>
                                                                        <img src={product.image} alt={product.title} loading="lazy" decoding="async" className="w-full max-h-[45vh] object-contain filter drop-shadow-2xl transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <h3 className="font-serif text-2xl text-white mb-2 tracking-wide leading-tight group-hover:text-white/80 transition-colors">{product.title}</h3>
                                                                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/50 group-hover:text-white transition-all duration-500 underline decoration-white/20 underline-offset-4">
                                                                            Discover Piece &rarr;
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Dossier Success Injection */}
                                                {msg.dossierComplete && (
                                                    <div className="w-full bg-white/5 border border-white/10 p-8 text-center mt-8 mb-4 relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                                        <h3 className="font-serif text-2xl text-white tracking-widest uppercase mb-4">Dossier Transmitted</h3>
                                                        <div className="w-8 h-[1px] bg-white/30 mx-auto mb-4"></div>
                                                        <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/50 leading-relaxed">The Atelier has received your initial specifications. <br/><br/>Casa Matteo Perin will contact you shortly.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                
                                {/* Artisanal Loading State */}
                                <AnimatePresence mode="wait">
                                    {isTyping && (
                                        <motion.div 
                                            key={loadingPhraseIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.8 }}
                                            className="flex justify-start mb-12 pl-6"
                                        >
                                            <span className="font-serif text-lg text-white/50 italic font-light drop-shadow-md">
                                                {LOADING_PHRASES[loadingPhraseIndex]}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={messagesEndRef} className="h-6" />
                            </div>

                            {/* Sticky Bottom Interaction Row */}
                            <div className="w-full bg-[#0a0a0a] border-t border-white/5 sticky bottom-0 p-4 md:p-6 z-50">
                                <form onSubmit={handleSend} className="bg-[#050505] border border-white/10 flex items-center p-2 shadow-inner group focus-within:bg-[#0c0c0c] focus-within:border-white/30 transition-all duration-500">
                                    <input 
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Command the Intelligence..."
                                        className="flex-1 bg-transparent px-4 py-3 text-white text-lg placeholder-white/20 focus:outline-none font-serif italic tracking-wide"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!input.trim() || isTyping}
                                        className="px-6 h-12 bg-white text-black flex items-center justify-center disabled:opacity-10 disabled:bg-transparent disabled:text-white transition-all duration-500 hover:bg-[#eaeaea] hover:scale-[1.02] active:scale-95"
                                    >
                                        <span className="font-sans text-[10px] font-bold leading-none uppercase tracking-[0.2em]">Send</span>
                                    </button>
                                </form>
                                <div className="text-center mt-3 pointer-events-none">
                                    <span className="font-sans text-[10px] uppercase tracking-[0.5em] text-white/20">The Concierge Intelligence</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
