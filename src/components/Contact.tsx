
import React, { useState, useEffect, useCallback, memo } from 'react';
import { IMAGES } from '../constants';
import { RevealOnScroll } from './RevealOnScroll';

// Visual ambiance images for the left side
const AMBIANCE_IMAGE = {
    id: 1,
    image: "/assets/hero_nature.png.jpg",
    label: "The Retreat",
    location: "Jackson Hole, USA"
};

// --- Reusable Floating Input (Consistent with Checkout) ---
const FloatingInput = React.memo(({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = true,
    className = "",
    placeholder = " "
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    required?: boolean;
    className?: string;
    placeholder?: string;
}) => (
    <div className={`relative pt-5 group ${className} w-full`}>
        {type === 'textarea' ? (
            <textarea
                name={name}
                id={name}
                rows={3}
                value={value}
                onChange={onChange}
                className="block w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-2 font-serif text-xl text-matteo-charcoal dark:text-white focus:outline-none focus:border-matteo-orange dark:focus:border-matteo-orange transition-colors peer placeholder-transparent resize-none"
                placeholder={placeholder}
                required={required}
            />
        ) : (
            <input
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange as any}
                className="block w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-2 font-serif text-xl text-matteo-charcoal dark:text-white focus:outline-none focus:border-matteo-orange dark:focus:border-matteo-orange transition-colors peer placeholder-transparent"
                placeholder={placeholder}
                required={required}
            />
        )}
        <label
            htmlFor={name}
            className="absolute left-0 top-5 font-sans text-[10px] uppercase tracking-widest text-matteo-stone duration-300 transform -translate-y-0 scale-100 origin-[0] peer-focus:-translate-y-5 peer-focus:text-matteo-orange peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-90 peer-not-placeholder-shown:-translate-y-5 peer-not-placeholder-shown:scale-90 pointer-events-none"
        >
            {label}
        </label>
    </div>
));

const ContactVisuals = memo(() => {
    return (
        <div className="hidden md:block w-1/2 relative min-h-screen order-1 overflow-hidden bg-matteo-charcoal">
            <div className="absolute inset-0 z-10">
                <img
                    src={AMBIANCE_IMAGE.image}
                    alt={AMBIANCE_IMAGE.label}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-90"
                />
                <div className="absolute inset-0 bg-matteo-charcoal/20 mix-blend-multiply"></div>
            </div>

            {/* Visual Text Overlay */}
            <div className="absolute bottom-12 left-12 text-white/90 z-20">
                <div className="overflow-hidden mb-2 h-10">
                    <p className="font-serif italic text-3xl animate-fade-in-up">
                        {AMBIANCE_IMAGE.label}
                    </p>
                </div>
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] opacity-80 animate-fade-in-up delay-100">
                    {AMBIANCE_IMAGE.location}
                </p>
            </div>
        </div>
    );
});

const ContactForm = memo(() => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Send to HubSpot via serverless endpoint
            await fetch('/api/private-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: 'contact',
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    subject: formData.subject,
                    message: formData.message,
                }),
            }).catch(() => {});
        } catch (e) {
            // Don't block UX
        }
        // Fire Google Ads conversion
        if (typeof (window as any).gtag_report_conversion === 'function') {
            (window as any).gtag_report_conversion();
        }
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    return (
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-12 md:py-20 order-2 bg-matteo-cream dark:bg-[#0a0a0a] transition-colors duration-700 relative">
            <div className="max-w-md mx-auto w-full">
                {!isSuccess ? (
                    <RevealOnScroll>
                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange mb-4 block">Inquiry</span>
                        <h2 className="font-serif text-3xl md:text-5xl text-matteo-charcoal dark:text-white font-light mb-6 leading-tight">
                            Begin the<br />Dialogue
                        </h2>
                        <p className="font-serif text-matteo-charcoal/70 dark:text-gray-400 mb-12 text-lg leading-relaxed">
                            For private commissions, fittings, or press inquiries.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <FloatingInput label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                            <FloatingInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
                            <FloatingInput label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required={false} />
                            <FloatingInput label="Subject" name="subject" value={formData.subject} onChange={handleChange} />
                            <FloatingInput label="Message" name="message" type="textarea" value={formData.message} onChange={handleChange} required={false} />

                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors duration-500 disabled:opacity-70 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? (
                                        <span>Transmitting...</span>
                                    ) : (
                                        <>
                                            <span>Send Request</span>
                                            <span className="text-xl leading-none mb-1">&rarr;</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </RevealOnScroll>
                ) : (
                    <div className="animate-fade-in-up text-center py-12">
                        <div className="w-16 h-16 border border-matteo-orange rounded-full flex items-center justify-center mx-auto mb-8 text-matteo-orange">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="font-serif text-4xl text-matteo-charcoal dark:text-white mb-4">Inquiry Received</h3>
                        <p className="font-serif text-matteo-stone text-lg leading-relaxed mb-12">
                            Thank you, {formData.name}.<br />
                            We have received your message regarding {formData.subject}. Our team will review your inquiry and contact you at {formData.email}.
                        </p>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                            }}
                            className="text-matteo-orange font-sans text-xs uppercase tracking-widest border-b border-matteo-orange pb-1 hover:text-matteo-charcoal dark:hover:text-white hover:border-matteo-charcoal dark:hover:border-white transition-colors"
                        >
                            Submit Another Request
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export const Contact: React.FC = () => {
    return (
        <section id="contact" className="bg-matteo-cream dark:bg-matteo-black relative border-t border-matteo-charcoal/5 dark:border-white/5 transition-colors duration-700">
            <div className="flex flex-col md:flex-row min-h-screen">
                <ContactVisuals />
                <ContactForm />
            </div>
        </section>
    );
};
