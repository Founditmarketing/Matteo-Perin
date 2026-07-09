import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { RevealOnScroll } from './RevealOnScroll';
import { reportInquiryConversion } from '@/lib/gtagConversion';

// The concierge's menu of intents — mirrored in the HubSpot note subject so
// the house knows what the visitor came for before the first call.
const INTENT_OPTIONS = [
    'Bespoke Commission',
    'One-of-One Acquisition',
    'Casa — Furniture',
    'The Crocodile Jacket',
    'Press & Media',
    'Something Else',
];

// Map an inbound ?ref= (the page or piece the visitor was viewing) to the
// closest intent so the select arrives pre-set. Unrecognized refs fall to
// "Something Else" — the raw ref still travels in the subject either way.
const intentFromRef = (ref: string): string => {
    const r = ref.toLowerCase();
    if (r.includes('croc') || r.includes('jacket')) return 'The Crocodile Jacket';
    if (r.includes('casa') || r.includes('furniture')) return 'Casa — Furniture';
    if (r.includes('press') || r.includes('media') || r.includes('journal')) return 'Press & Media';
    // Lookbook looks are realized by commission — route them there,
    // not to the generic bucket.
    if (r.includes('bespoke') || r.includes('commission') || r.includes('lookbook') || r.includes('look ')) return 'Bespoke Commission';
    if (r.includes('shop') || r.includes('collection') || r.includes('vault') || r.includes('archive') || r.includes('inventory')) return 'One-of-One Acquisition';
    return 'Something Else';
};

// --- Reusable Floating Input (same idiom as the Contact section) ---
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

// --- Floating Select — the input idiom, adapted. Selects have no
// :placeholder-shown, so the raised-label state keys off value instead. ---
const FloatingSelect = React.memo(({
    label,
    name,
    value,
    onChange,
    options,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}) => (
    <div className="relative pt-5 group w-full">
        <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required
            className="block w-full appearance-none rounded-none bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-2 pr-8 font-serif text-xl text-matteo-charcoal dark:text-white focus:outline-none transition-colors peer cursor-pointer"
        >
            <option value="" disabled hidden></option>
            {options.map(opt => (
                <option key={opt} value={opt} className="font-sans text-base text-matteo-charcoal bg-matteo-cream dark:text-white dark:bg-matteo-black">
                    {opt}
                </option>
            ))}
        </select>
        {/* Quiet chevron in place of the native widget */}
        <span aria-hidden="true" className="absolute right-0 bottom-3 pointer-events-none text-matteo-stone-ink dark:text-matteo-stone">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" /></svg>
        </span>
        <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-full h-px bg-matteo-orange origin-left scale-x-0 peer-focus:scale-x-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none pointer-events-none"
        />
        <label
            htmlFor={name}
            className={`absolute left-0 top-5 font-sans text-[10px] uppercase tracking-widest text-matteo-stone-ink dark:text-matteo-stone duration-300 transform origin-[0] pointer-events-none peer-focus:-translate-y-5 peer-focus:scale-90 peer-focus:text-matteo-orange ${value ? '-translate-y-5 scale-90' : 'translate-y-0 scale-100'}`}
        >
            {label}
        </label>
    </div>
));

export const Enquire: React.FC = () => {
    // ?ref= carries what the visitor was viewing (a product slug, "croc",
    // "casa"…) — it pre-sets the intent and rides along in the subject.
    const [searchParams] = useSearchParams();
    const ref = searchParams.get('ref') || '';

    const [formData, setFormData] = useState(() => ({
        name: '',
        email: '',
        phone: '',
        intent: ref ? intentFromRef(ref) : '',
        message: ''
    }));
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
            // Same pipeline as the homepage Contact section — HubSpot via the
            // serverless endpoint. Success copy only shows once the enquiry
            // actually reached us. The raw ref travels in the subject so the
            // concierge knows what the visitor was viewing.
            const res = await fetch('/api/private-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: 'contact',
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    subject: ref ? `${formData.intent} — ref: ${ref}` : formData.intent,
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
        <div className="bg-matteo-cream dark:bg-matteo-black min-h-screen pt-32 pb-32 transition-colors duration-700">
            <Helmet>
                <title>Enquire | Matteo Perin</title>
                <meta name="description" content="Begin the dialogue with Matteo Perin — bespoke commissions, one-of-one acquisitions, Casa furniture, and press. A senior advisor responds within 24 hours." />
                <link rel="canonical" href="https://www.matteoperin.com/enquire" />
                <meta property="og:title" content="Enquire | Matteo Perin" />
                <meta property="og:description" content="Begin the dialogue with Matteo Perin — bespoke commissions, one-of-one acquisitions, Casa furniture, and press." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.matteoperin.com/enquire" />
            </Helmet>
            <div className="max-w-[1920px] mx-auto px-6 md:px-12">

                {/* --- Header --- */}
                <div className="text-center mb-20 md:mb-28">
                    <RevealOnScroll>
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-6 block">
                            The Concierge
                        </span>
                        <h1 className="font-serif text-5xl md:text-8xl text-matteo-charcoal dark:text-white font-light tracking-tight">
                            Begin the Dialogue
                        </h1>
                    </RevealOnScroll>
                </div>

                {/* --- Form + Showroom details --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-20 gap-x-12 max-w-6xl mx-auto">

                    {/* Form */}
                    <div className="lg:col-span-7">
                        {!isSuccess ? (
                            <RevealOnScroll>
                                <p className="font-serif text-matteo-charcoal/70 dark:text-white/60 mb-12 text-lg leading-relaxed">
                                    For private commissions, fittings, or press inquiries.
                                </p>

                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                                        <FloatingInput label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                                        <FloatingInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
                                        <FloatingInput label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required={false} />
                                        <FloatingSelect label="I Am Enquiring About" name="intent" value={formData.intent} onChange={handleChange} options={INTENT_OPTIONS} />
                                        <FloatingInput label="Message" name="message" type="textarea" value={formData.message} onChange={handleChange} required={false} className="md:col-span-2" />
                                    </div>

                                    {submitError && (
                                        <p role="alert" className="font-serif text-sm text-matteo-charcoal dark:text-white leading-relaxed mt-10">
                                            Your message could not be sent. Please try again, or write directly to <a href="mailto:concierge@matteoperin.com" className="text-matteo-orange-ink dark:text-matteo-orange border-b border-matteo-orange/40">concierge@matteoperin.com</a>.
                                        </p>
                                    )}

                                    <div className="pt-16">
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
                            </RevealOnScroll>
                        ) : (
                            <div className="animate-fade-in-up text-center py-12">
                                <div className="w-16 h-16 border border-matteo-orange rounded-full flex items-center justify-center mx-auto mb-8 text-matteo-orange">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 className="font-serif text-4xl text-matteo-charcoal dark:text-white mb-4">Enquiry Received</h2>
                                <p className="font-serif text-matteo-stone-ink dark:text-matteo-stone text-lg leading-relaxed mb-12">
                                    Thank you, {formData.name}.<br />
                                    A senior Matteo Perin advisor will contact you within 24 hours.
                                </p>
                                <button
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setFormData({ name: '', email: '', phone: '', intent: '', message: '' });
                                    }}
                                    className="text-matteo-orange-ink dark:text-matteo-orange font-sans text-xs uppercase tracking-widest border-b border-matteo-orange pb-1 hover:text-matteo-charcoal dark:hover:text-white hover:border-matteo-charcoal dark:hover:border-white transition-colors"
                                >
                                    Submit Another Request
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Showroom details */}
                    <aside className="lg:col-span-4 lg:col-start-9">
                        <RevealOnScroll>
                            <div className="lg:border-l lg:border-matteo-charcoal/10 lg:dark:border-white/10 lg:pl-12">
                                <h2 className="font-sans text-[11px] uppercase tracking-[0.25em] font-medium text-matteo-orange-ink dark:text-matteo-orange mb-6">The Showroom</h2>
                                <p className="font-sans text-xs text-matteo-charcoal/70 dark:text-white/60 leading-loose mb-8">
                                    164 E Deloney Ave<br />
                                    Jackson, Wyoming 83001<br /><br />
                                    <a href="mailto:concierge@matteoperin.com" className="hover:text-matteo-charcoal dark:hover:text-white transition-colors">concierge@matteoperin.com</a><br />
                                    <a href="tel:3072649655" className="hover:text-matteo-charcoal dark:hover:text-white transition-colors">307.264.9655</a>
                                </p>
                                <div className="font-sans text-[10px] text-matteo-charcoal/70 dark:text-white/60 uppercase tracking-widest leading-relaxed mb-10">
                                    <span className="block text-matteo-orange-ink dark:text-matteo-orange tracking-[0.25em] font-medium mb-2">Showroom Hours</span>
                                    M-F: 10am - 6pm<br />
                                    Sat: 10am - 5pm<br />
                                    Sun: 12pm - 5pm
                                </div>
                                <p className="font-serif italic text-lg text-matteo-charcoal/70 dark:text-white/60 leading-relaxed">
                                    A senior Matteo Perin advisor will contact you within 24 hours.
                                </p>
                            </div>
                        </RevealOnScroll>
                    </aside>
                </div>
            </div>
        </div>
    );
};
