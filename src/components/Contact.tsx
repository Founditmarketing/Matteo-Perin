import React, { useState, useEffect, useCallback, memo } from 'react';
import { IMAGES } from '../constants';
import { RevealOnScroll } from './RevealOnScroll';
import { reportInquiryConversion } from '@/lib/gtagConversion';

// Visual ambiance images for the left side
const AMBIANCE_IMAGE = {
    id: 1,
    image: "/assets/hero_nature.jpg",
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
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
                className="block w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-2 font-serif text-xl text-matteo-charcoal dark:text-white focus:outline-none transition-colors peer placeholder-transparent resize-none"
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
                className="block w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-2 font-serif text-xl text-matteo-charcoal dark:text-white focus:outline-none transition-colors peer placeholder-transparent"
                placeholder={placeholder}
                required={required}
            />
        )}
        {/* Terracotta underline draws from the left on focus — 600ms house
            ease-out. Sits exactly over the resting 1px charcoal rule; retracts
            on blur. motion-reduce: instant state change, no draw. */}
        <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-full h-px bg-matteo-orange origin-left scale-x-0 peer-focus:scale-x-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none pointer-events-none"
        />
        <label
            htmlFor={name}
            className="absolute left-0 top-5 font-sans text-[10px] uppercase tracking-widest text-matteo-stone-ink dark:text-matteo-stone duration-300 transform -translate-y-0 scale-100 origin-[0] peer-focus:-translate-y-5 peer-focus:text-matteo-orange peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-90 peer-not-placeholder-shown:-translate-y-5 peer-not-placeholder-shown:scale-90 pointer-events-none"
        >
            {label}
        </label>
    </div>
));

// --- Intent Select (same underline idiom as FloatingInput) ---
// A <select> has no placeholder state for the peer-* label trick, so the
// float is driven off `value` in JS instead; focus draws the same
// terracotta underline. Submits through the `subject` payload field.
const INTENT_OPTIONS = [
    'Bespoke Commission',
    'One-of-One Acquisition',
    'Casa — Furniture',
    'The Crocodile Jacket',
    'Press & Media',
    'Something Else',
];

const FloatingSelect = React.memo(({
    label,
    name,
    value,
    onChange,
    options,
    className = ""
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    options: string[];
    className?: string;
}) => (
    <div className={`relative pt-5 group ${className} w-full`}>
        <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required
            className="block w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-2 pr-6 font-serif text-xl text-matteo-charcoal dark:text-white focus:outline-none transition-colors peer appearance-none rounded-none cursor-pointer"
        >
            {/* Empty resting state — the floating label reads as the prompt */}
            <option value="" disabled hidden></option>
            {options.map((opt) => (
                <option key={opt} value={opt} className="font-sans text-sm bg-matteo-cream text-matteo-charcoal dark:bg-[#0a0a0a] dark:text-white">
                    {opt}
                </option>
            ))}
        </select>
        {/* Quiet chevron in place of the stripped native arrow */}
        <svg
            aria-hidden="true"
            className="absolute right-0 bottom-3.5 w-3 h-3 text-matteo-stone-ink dark:text-matteo-stone pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-full h-px bg-matteo-orange origin-left scale-x-0 peer-focus:scale-x-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none pointer-events-none"
        />
        <label
            htmlFor={name}
            className={`absolute left-0 top-5 font-sans text-[10px] uppercase tracking-widest text-matteo-stone-ink dark:text-matteo-stone duration-300 transform origin-[0] peer-focus:-translate-y-5 peer-focus:scale-90 peer-focus:text-matteo-orange pointer-events-none ${value ? '-translate-y-5 scale-90' : '-translate-y-0 scale-100'}`}
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
                    loading="lazy"
                    decoding="async"
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
    const [submitError, setSubmitError] = useState(false);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(false);
        try {
            // Send to HubSpot via serverless endpoint. Success copy is only
            // shown when the inquiry actually reached us — never promise a
            // 24-hour callback for a lead that was lost.
            const res = await fetch('/api/private-client', {
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
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            reportInquiryConversion();
            setIsSuccess(true);
        } catch (e) {
            setSubmitError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-12 md:py-20 order-2 bg-matteo-cream dark:bg-[#0a0a0a] transition-colors duration-700 relative">
            <div className="max-w-xl mx-auto w-full">
                {!isSuccess ? (
                    <RevealOnScroll>
                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange-ink dark:text-matteo-orange mb-4 block">Inquiry</span>
                        {/* Section-display scale — the same register as The Current Edit's heading */}
                        <h2 className="font-serif text-5xl md:text-6xl text-matteo-charcoal dark:text-white font-light mb-6 leading-[1.05]">
                            Begin the<br />Dialogue
                        </h2>
                        <p className="font-serif text-matteo-charcoal/70 dark:text-white/60 mb-12 text-lg leading-relaxed">
                            For private commissions, fittings, or press inquiries.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Short fields pair up from md; Message keeps the full measure */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                <FloatingInput label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                                <FloatingInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
                                <FloatingInput label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required={false} />
                                <FloatingSelect label="Intent" name="subject" value={formData.subject} onChange={handleChange} options={INTENT_OPTIONS} />
                            </div>
                            <FloatingInput label="Message" name="message" type="textarea" value={formData.message} onChange={handleChange} required={false} />

                            {submitError && (
                                <p role="alert" className="font-serif text-sm text-matteo-charcoal dark:text-white leading-relaxed">
                                    Your message could not be sent. Please try again, or write directly to <a href="mailto:concierge@matteoperin.com" className="text-matteo-orange-ink dark:text-matteo-orange border-b border-matteo-orange/40">concierge@matteoperin.com</a>.
                                </p>
                            )}

                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors duration-500 disabled:opacity-70 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? (
                                        <span>Sending to the Atelier…</span>
                                    ) : (
                                        <>
                                            <span>Send Request</span>
                                            <span className="text-xl leading-none mb-1">&rarr;</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* The door itself — for those who would rather call in person */}
                        <div className="mt-14 pt-8 border-t border-matteo-charcoal/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange-ink dark:text-matteo-orange font-medium block mb-3">The Showroom</span>
                                <p className="font-serif text-[15px] text-matteo-charcoal/70 dark:text-white/60 leading-relaxed">
                                    164 E Deloney Ave<br />
                                    Jackson, Wyoming 83001
                                </p>
                            </div>
                            <div>
                                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange-ink dark:text-matteo-orange font-medium block mb-3">Hours</span>
                                <p className="font-serif text-[15px] text-matteo-charcoal/70 dark:text-white/60 leading-relaxed">
                                    M&ndash;F: 10am &ndash; 6pm<br />
                                    Sat: 10am &ndash; 5pm<br />
                                    Sun: 12pm &ndash; 5pm
                                </p>
                            </div>
                        </div>
                    </RevealOnScroll>
                ) : (
                    <div className="animate-fade-in-up text-center py-12">
                        <div className="w-16 h-16 border border-matteo-orange rounded-full flex items-center justify-center mx-auto mb-8 text-matteo-orange">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="font-serif text-4xl text-matteo-charcoal dark:text-white mb-4">Inquiry Received</h3>
                        <p className="font-serif text-matteo-stone-ink dark:text-matteo-stone text-lg leading-relaxed mb-12">
                            Thank you, {formData.name}.<br />
                            We have received your message regarding {formData.subject}. Our team will review your inquiry and contact you at {formData.email}.
                        </p>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                            }}
                            className="text-matteo-orange-ink dark:text-matteo-orange font-sans text-xs uppercase tracking-widest border-b border-matteo-orange pb-1 hover:text-matteo-charcoal dark:hover:text-white hover:border-matteo-charcoal dark:hover:border-white transition-colors"
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
