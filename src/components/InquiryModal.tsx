import React, { useState } from 'react';
import { useInquiry } from '../context/InquiryContext';

const FloatingInput: React.FC<{
    label: string;
    type?: string;
    id: string;
    required?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    multiline?: boolean;
}> = ({ label, type = "text", id, required = false, value, onChange, multiline = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const isActive = isFocused || value.length > 0;

    return (
        <div className="relative group w-full mb-4 md:mb-6">
            {multiline ? (
                <textarea
                    id={id}
                    required={required}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif outline-none focus:border-matteo-orange transition-colors text-matteo-charcoal dark:text-white resize-none min-h-[100px]"
                />
            ) : (
                <input
                    type={type}
                    id={id}
                    required={required}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-3 font-serif outline-none focus:border-matteo-orange transition-colors text-matteo-charcoal dark:text-white"
                />
            )}
            <label
                htmlFor={id}
                className={`absolute left-0 font-sans text-[10px] uppercase tracking-widest transition-all duration-300 pointer-events-none ${isActive ? '-top-4 text-matteo-orange text-[8px]' : 'top-3 text-matteo-charcoal/40 dark:text-white/40'}`}
            >
                {label} {required && '*'}
            </label>
            {/* Focus indicator line */}
            <div className={`absolute bottom-0 left-0 h-[1px] bg-matteo-orange transition-all duration-500 ease-out ${isFocused ? 'w-full' : 'w-0'}`} />
        </div>
    );
};

export const InquiryModal: React.FC = () => {
    const { isInquiryOpen, setIsInquiryOpen, selectedProduct } = useInquiry();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        contactTime: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isInquiryOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Prepare data for backend
        const inquiryPayload = {
            formType: 'look-inquiry',
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            contactTime: formData.contactTime,
            message: formData.message,
            requestedProduct: selectedProduct ? {
                id: selectedProduct.id,
                title: selectedProduct.title,
                reference: `MP-${selectedProduct.id.toString().padStart(4, '0')}`,
                price: selectedProduct.price
            } : null
        };
        
        try {
            await fetch('/api/private-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inquiryPayload)
            });
        } catch (err) {
            console.error("HubSpot submission failed:", err);
        } finally {
            // Fire Google Ads conversion
            if (typeof (window as any).gtag_report_conversion === 'function') {
                (window as any).gtag_report_conversion();
            }
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsInquiryOpen(false);
                setIsSuccess(false);
                setFormData({ name: '', email: '', phone: '', contactTime: '', message: '' });
            }, 3000);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-matteo-charcoal/95 dark:bg-[#050505]/95 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-500">
            <div className="bg-matteo-cream dark:bg-matteo-black w-full max-w-5xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[90vh] animate-fade-in-up">
                
                {/* Left Side: Product Image (Hidden on very small screens) */}
                {selectedProduct && (
                    <div className="hidden md:block md:w-2/5 relative h-full bg-[#f0f0f0] dark:bg-[#111]">
                        <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.title} 
                            className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply dark:mix-blend-normal dark:brightness-90 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-matteo-charcoal/80 to-transparent flex flex-col justify-end p-12 text-white">
                            <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-orange mb-2 block">Reference</span>
                            <h3 className="font-serif text-3xl mb-2">{selectedProduct.title}</h3>
                            <span className="font-sans text-xs tracking-widest opacity-80">REF: MP-{selectedProduct.id.toString().padStart(4, '0')}</span>
                        </div>
                    </div>
                )}

                {/* Right Side: Form */}
                <div className={`w-full ${selectedProduct ? 'md:w-3/5' : 'md:w-full'} p-6 sm:p-8 md:p-16 flex flex-col relative overflow-y-auto`}>
                    <button 
                        onClick={() => setIsInquiryOpen(false)}
                        className="absolute top-6 right-6 md:top-8 md:right-8 font-sans text-[10px] uppercase tracking-widest text-matteo-charcoal dark:text-white hover:text-matteo-orange dark:hover:text-matteo-orange transition-colors z-20 flex items-center gap-2 group"
                    >
                        <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">Close</span>
                        <span className="text-lg leading-none">×</span>
                    </button>

                    <div className="max-w-md w-full mx-auto my-auto">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-matteo-orange mb-2 md:mb-4 block">Concierge Intake</span>
                        <h2 className="font-serif text-2xl md:text-4xl mb-6 md:mb-6 text-matteo-charcoal dark:text-white">Request a Bespoke Look</h2>
                        
                        {/* Mobile Product Summary */}
                        {selectedProduct && (
                            <div className="md:hidden flex items-center gap-4 mb-6 pb-6 border-b border-matteo-charcoal/10 dark:border-white/10">
                                <img src={selectedProduct.image} alt={selectedProduct.title} className="w-16 h-16 object-cover object-top" />
                                <div>
                                    <span className="font-sans text-[8px] uppercase tracking-widest text-matteo-charcoal/50 dark:text-white/50 block mb-1">REF: MP-{selectedProduct.id.toString().padStart(4, '0')}</span>
                                    <h3 className="font-serif text-lg leading-tight text-matteo-charcoal dark:text-white">{selectedProduct.title}</h3>
                                </div>
                            </div>
                        )}
                        
                        {isSuccess ? (
                            <div className="py-12 text-center animate-fade-in-up">
                                <div className="w-16 h-16 rounded-full border border-matteo-orange flex items-center justify-center mx-auto mb-6">
                                    <span className="text-matteo-orange text-xl">✓</span>
                                </div>
                                <h3 className="font-serif text-2xl text-matteo-charcoal dark:text-white mb-4">Inquiry Received</h3>
                                <p className="font-serif text-matteo-charcoal/60 dark:text-gray-400">A senior client advisor will contact you shortly regarding the {selectedProduct?.title || 'commission'}.</p>
                            </div>
                        ) : (
                            <>
                                <p className="font-serif text-matteo-charcoal/60 dark:text-gray-400 text-xs md:text-sm mb-6 md:mb-10 leading-relaxed hidden sm:block">
                                    Please provide your contact details. Due to the exclusive nature of our pieces, all acquisitions are handled via private consultation to ensure exact specifications and availability.
                                </p>

                                <form className="space-y-2" onSubmit={handleSubmit}>
                                    <FloatingInput id="name" label="Full Name" value={formData.name} onChange={handleChange} required />
                                    <FloatingInput id="email" type="email" label="Private Email" value={formData.email} onChange={handleChange} required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FloatingInput id="phone" type="tel" label="Direct Line" value={formData.phone} onChange={handleChange} />
                                        <FloatingInput id="contactTime" label="Preferred Contact Time" value={formData.contactTime} onChange={handleChange} />
                                    </div>
                                    <FloatingInput id="message" label="Additional Requirements or Vision" value={formData.message} onChange={handleChange} multiline />
                                    
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-5 font-sans text-[10px] uppercase tracking-[0.3em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white transition-colors mt-8 shadow-xl disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Initiating...' : 'Submit Request'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
