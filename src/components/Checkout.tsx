
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { Logo } from './Logo';
import { Link, useNavigate } from 'react-router-dom';



// --- Digital Stationery Input Component ---
// Mimics a high-end form or ledger line. 
// Label floats up when focused/filled. Input text is Serif (handwritten feel).
// Memoized to prevent re-renders of siblings when one input changes.
const FloatingInput = React.memo(({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false,
    className = "",
    half = false,
    placeholder = " "
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    className?: string;
    half?: boolean;
    placeholder?: string;
}) => (
    <div className={`relative pt-5 group ${className} ${half ? 'w-full md:w-[48%]' : 'w-full'}`}>
        <input 
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className="block w-full bg-transparent border-b border-matteo-charcoal/20 dark:border-white/20 py-2 font-serif text-xl text-matteo-charcoal dark:text-white focus:outline-none focus:border-matteo-orange dark:focus:border-matteo-orange transition-colors peer placeholder-transparent"
            placeholder={placeholder}
            required={required}
        />
        <label 
            htmlFor={name}
            className="absolute left-0 top-5 font-sans text-[10px] uppercase tracking-widest text-matteo-stone duration-300 transform -translate-y-0 scale-100 origin-[0] peer-focus:-translate-y-5 peer-focus:text-matteo-orange peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-90 peer-not-placeholder-shown:-translate-y-5 peer-not-placeholder-shown:scale-90 pointer-events-none"
        >
            {label}
        </label>
    </div>
));

// --- Checkout Manifest Component ---
// Extracted and memoized to prevent re-rendering the summary list while typing in the form.
const CheckoutManifest = React.memo(({ cartItems, cartTotal, selectedShipping, finalTotal, updateQuantity, removeFromCart }: any) => {
    return (
        <div className="w-full lg:w-[40%] bg-[#F9F7F2] dark:bg-[#111] border-l border-matteo-charcoal/5 dark:border-white/5 order-1 lg:order-2">
            <div className="sticky top-0 h-screen overflow-y-auto scrollbar-hide p-6 md:p-12 flex flex-col">
                
                <div className="mb-12 pb-8 border-b border-matteo-charcoal/10 dark:border-white/10">
                    <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-stone block mb-2">Manifest</span>
                    <h3 className="font-serif text-3xl text-matteo-charcoal dark:text-white">The Acquisition</h3>
                </div>

                <div className="flex-1 space-y-8">
                    {cartItems.map((item: any) => (
                        <div key={item.cartItemId} className="flex gap-6 group">
                            <div className="w-20 h-24 bg-white dark:bg-white/5 p-2 shadow-sm relative shrink-0">
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-matteo-charcoal dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-sans text-[9px]">
                                    {item.quantity}
                                </span>
                            </div>
                            <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-serif text-lg text-matteo-charcoal dark:text-white leading-tight pr-4">{item.title}</h4>
                                        <div className="text-right shrink-0">
                                            <span className="font-serif text-lg text-matteo-charcoal dark:text-white">${(item.price * item.quantity).toLocaleString()}</span>
                                            {item.id === 14 && <span className="block font-sans text-[8px] uppercase tracking-[0.1em] text-matteo-orange">Deposit</span>}
                                        </div>
                                    </div>
                                    <p className="font-sans text-[9px] uppercase tracking-widest text-matteo-stone mt-2">{item.category}</p>
                                    {item.id === 14 && (
                                        <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-matteo-stone mt-1 leading-relaxed">
                                            Full commission: $185,000 · Balance invoiced before production
                                        </p>
                                    )}
                                    {item.customizations && (
                                        <div className="mt-2 pl-2 border-l border-matteo-orange">
                                            {item.customizations.material && <p className="font-sans text-[8px] uppercase tracking-wider text-matteo-charcoal/60 dark:text-white/60">{item.customizations.material}</p>}
                                            {item.customizations.monogram && <p className="font-sans text-[8px] uppercase tracking-wider text-matteo-charcoal/60 dark:text-white/60">Monogram: {item.customizations.monogram}</p>}
                                        </div>
                                    )}
                                    
                                    {/* Quantity Controls + Remove */}
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center border border-matteo-charcoal/10 dark:border-white/10">
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center font-sans text-sm text-matteo-charcoal dark:text-white hover:bg-matteo-charcoal/5 dark:hover:bg-white/5 hover:text-matteo-orange transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className="w-7 h-7 flex items-center justify-center font-sans text-[10px] text-matteo-charcoal dark:text-white border-x border-matteo-charcoal/10 dark:border-white/10 select-none">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                className="w-7 h-7 flex items-center justify-center font-sans text-sm text-matteo-charcoal dark:text-white hover:bg-matteo-charcoal/5 dark:hover:bg-white/5 hover:text-matteo-orange transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.cartItemId)}
                                            className="font-sans text-[8px] uppercase tracking-widest text-matteo-stone hover:text-matteo-orange transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-matteo-charcoal/10 dark:border-white/10 space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="font-sans text-[9px] uppercase tracking-widest text-matteo-stone">Subtotal</span>
                        <span className="font-serif text-matteo-charcoal dark:text-white">${cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="font-sans text-[9px] uppercase tracking-widest text-matteo-stone">Logistics ({selectedShipping.name})</span>
                        <span className="font-serif text-matteo-charcoal dark:text-white">{selectedShipping.price === 0 ? 'Complimentary' : `$${selectedShipping.price}`}</span>
                    </div>
                    <div className="flex justify-between items-end pt-6">
                        <span className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal dark:text-white font-medium">Total Due</span>
                        <div className="text-right">
                            <span className="font-sans text-[9px] uppercase tracking-widest text-matteo-stone block mb-1">USD</span>
                            <span className="font-serif text-3xl text-matteo-charcoal dark:text-white">${finalTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    {cartItems.some((item: any) => item.id === 14) && (
                        <div className="bg-matteo-orange/5 dark:bg-matteo-orange/10 border border-matteo-orange/20 rounded-sm p-3 mb-4">
                            <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-matteo-charcoal/60 dark:text-white/50 leading-relaxed">
                                <span className="text-matteo-orange font-medium">Deposit Payment:</span> Your $25,000 deposit secures the Bespoke Crocodile Jacket commission. The remaining balance of $160,000 will be invoiced separately before production begins.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export const Checkout: React.FC = () => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Details, 2: Payment
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [authChecked, setAuthChecked] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: 'United States',
        zip: '',
        phone: ''
    });

    const shippingMethods = [
        { id: 'standard', name: 'Atelier Standard', price: 0, desc: 'Global (5-7 Days)' },
        { id: 'express', name: 'Private Air', price: 120, desc: 'Priority (2 Days)' },
    ];
    const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);

    const finalTotal = cartTotal + selectedShipping.price;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    // Stabilized input handler using functional update to prevent re-creation and re-renders
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleNext = () => {
        // Manually validate only step-1 fields before proceeding
        const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'zip', 'phone'];
        for (const name of requiredFields) {
            const el = document.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
            if (el && !el.checkValidity()) {
                el.reportValidity();
                return;
            }
        }
        setStep(2);
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setPaymentStatus('Connecting to secure gateway...');
        
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cartItems,
                    shippingOptions: selectedShipping,
                    customerDetails: formData
                }),
            });
            
            if (!response.ok) {
                let errorMsg = 'Server rejected checkout session';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (_) { /* response wasn't JSON */ }
                throw new Error(errorMsg);
            }
            
            const session = await response.json();
            
            setPaymentStatus('Redirecting to Stripe Exchange...');
            
            // Redirect to Stripe Checkout using the session URL
            if (!session.url) throw new Error("No checkout URL returned from payment gateway.");
            
            window.location.href = session.url;
        } catch (err: any) {
            console.error("Payment Gateway Error:", err);
            
            // If the API endpoint is not available (e.g., running locally or Stripe not configured),
            // show a graceful error message
            const isMissingEndpoint = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('404');
            const isStripeNotConfigured = err.message?.includes('Stripe SDK failed');
            
            if (isMissingEndpoint || isStripeNotConfigured) {
                setPaymentStatus('Payment gateway is being configured. Please contact our concierge team to complete your purchase.');
                setTimeout(() => {
                    setIsProcessing(false);
                    setPaymentStatus('');
                }, 5000);
            } else {
                setPaymentStatus('Transaction Failed. Returning to Ledger.');
                setTimeout(() => {
                    setIsProcessing(false);
                    setPaymentStatus('');
                }, 3000);
            }
        }
    };

    // --- ORDER CONFIRMATION (The Letter) ---
    if (isComplete) {
        return (
            <div className="min-h-screen bg-matteo-cream flex flex-col items-center justify-center p-6 text-center border-[20px] border-white relative">
                <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none"></div>
                <div className="max-w-2xl w-full bg-white shadow-2xl p-12 md:p-24 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-matteo-orange"></div>
                    
                    <div className="mb-12 flex justify-center">
                        <Logo className="w-16 h-16" dark={true} />
                    </div>
                    
                    <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-matteo-stone block mb-8">
                        Official Receipt
                    </span>
                    
                    <h1 className="font-serif text-4xl md:text-5xl text-matteo-charcoal mb-8 leading-tight">
                        Commission Accepted</h1>
                    
                    <p className="font-serif text-lg text-matteo-charcoal/70 mb-12 leading-relaxed">
                        Dear {formData.firstName},<br/><br/>
                        Your acquisition has been recorded in our ledger. <br/>
                        Order Ref: <span className="text-matteo-charcoal font-medium">#MP-{Math.floor(Math.random() * 10000)}</span>.
                        <br/><br/>
                        We are preparing your items for dispatch to {formData.city}. You will receive a private correspondence with tracking details shortly.
                    </p>

                    <div className="border-t border-b border-matteo-charcoal/10 py-6 mb-12">
                         <div className="flex justify-between items-center">
                             <span className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone">Total Settled</span>
                             <span className="font-serif text-2xl text-matteo-charcoal">${finalTotal.toLocaleString()}</span>
                         </div>
                    </div>

                    <button 
                        onClick={() => navigate('/')}
                        className="bg-matteo-charcoal text-white px-10 py-4 font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-matteo-orange transition-colors duration-500"
                    >
                        Return to House
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black flex flex-col items-center justify-center">
                <p className="font-serif text-2xl mb-6 text-matteo-charcoal dark:text-white">The bag is empty.</p>
                <Link to="/collection" className="font-sans text-xs uppercase tracking-widest border-b border-current pb-1 text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors">Begin Acquisition</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-700 flex flex-col lg:flex-row">
            
            {/* LEFT COLUMN: THE FORM */}
            <div className="w-full lg:w-[60%] p-6 md:p-16 lg:p-24 order-2 lg:order-1 relative">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <Link to="/" className="group flex items-center gap-3">
                         <Logo className="w-10 h-10" />
                         <span className="hidden md:block font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-charcoal dark:text-white group-hover:text-matteo-orange transition-colors">
                             Matteo Perin
                         </span>
                    </Link>
                    
                    {/* Minimal Progress */}
                    <div className="flex items-center gap-4">
                        <span className={`font-sans text-[9px] uppercase tracking-widest transition-colors ${step === 1 ? 'text-matteo-charcoal dark:text-white' : 'text-matteo-stone'}`}>01. Details</span>
                        <div className="w-8 h-[1px] bg-matteo-charcoal/20 dark:bg-white/20"></div>
                        <span className={`font-sans text-[9px] uppercase tracking-widest transition-colors ${step === 2 ? 'text-matteo-charcoal dark:text-white' : 'text-matteo-stone'}`}>02. Payment</span>
                    </div>
                </div>

                <form onSubmit={handlePayment} className="max-w-xl mx-auto">
                    
                    {/* STEP 1: DETAILS & LOGISTICS */}
                    <div className={`transition-all duration-700 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 hidden'}`}>
                        <div className="mb-12">
                            <h2 className="font-serif text-4xl text-matteo-charcoal dark:text-white mb-2">Identification</h2>
                            <p className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone">Please provide your details for the commission.</p>
                        </div>

                        <div className="space-y-8">
                            <FloatingInput 
                                label="Email Address" 
                                name="email" 
                                type="email"
                                value={formData.email} 
                                onChange={handleInputChange}
                                required={true}
                            />
                            
                            <div className="flex flex-col md:flex-row gap-8">
                                <FloatingInput 
                                    label="First Name" 
                                    name="firstName" 
                                    value={formData.firstName} 
                                    onChange={handleInputChange} 
                                    half
                                    required={true}
                                />
                                <FloatingInput 
                                    label="Last Name" 
                                    name="lastName" 
                                    value={formData.lastName} 
                                    onChange={handleInputChange} 
                                    half
                                    required={true}
                                />
                            </div>

                            <FloatingInput 
                                label="Shipping Address" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleInputChange}
                                required={true}
                            />

                            <div className="flex flex-col md:flex-row gap-8">
                                <FloatingInput 
                                    label="City" 
                                    name="city" 
                                    value={formData.city} 
                                    onChange={handleInputChange} 
                                    half
                                    required={true}
                                />
                                <FloatingInput 
                                    label="Postal / Zip Code" 
                                    name="zip" 
                                    value={formData.zip} 
                                    onChange={handleInputChange} 
                                    half
                                    required={true}
                                />
                            </div>
                            
                             <FloatingInput 
                                label="Phone (For Courier Handover)" 
                                name="phone" 
                                type="tel"
                                value={formData.phone} 
                                onChange={handleInputChange}
                                required={true}
                            />

                            {/* Shipping Selectors */}
                            <div className="pt-8">
                                <span className="font-sans text-[9px] uppercase tracking-widest text-matteo-stone block mb-6">Service Level</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {shippingMethods.map((method) => (
                                        <div 
                                            key={method.id}
                                            onClick={() => setSelectedShipping(method)}
                                            className={`cursor-pointer border p-6 transition-all duration-300 relative group overflow-hidden ${
                                                selectedShipping.id === method.id 
                                                ? 'border-matteo-charcoal bg-matteo-charcoal text-white dark:border-white dark:bg-white dark:text-black' 
                                                : 'border-matteo-charcoal/20 dark:border-white/20 hover:border-matteo-charcoal dark:hover:border-white'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`font-serif text-lg ${selectedShipping.id === method.id ? 'text-white dark:text-black' : 'text-matteo-charcoal dark:text-white'}`}>
                                                    {method.name}
                                                </span>
                                                <div className={`w-3 h-3 rounded-full border border-current flex items-center justify-center`}>
                                                    {selectedShipping.id === method.id && <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                 <span className={`font-sans text-[9px] uppercase tracking-widest ${selectedShipping.id === method.id ? 'text-white/60 dark:text-black/60' : 'text-matteo-stone'}`}>
                                                     {method.desc}
                                                 </span>
                                                 <span className={`font-sans text-xs font-medium ${selectedShipping.id === method.id ? 'text-white dark:text-black' : 'text-matteo-charcoal dark:text-white'}`}>
                                                     {method.price === 0 ? 'Inc.' : `$${method.price}`}
                                                 </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-12 flex justify-end">
                                <button 
                                    type="button"
                                    onClick={handleNext}
                                    className="bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black px-12 py-4 font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors duration-500"
                                >
                                    Proceed to Settlement
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: PAYMENT */}
                    <div className={`transition-all duration-700 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 hidden'}`}>
                         <div className="mb-12 cursor-pointer" onClick={() => setStep(1)}>
                            <span className="font-sans text-[9px] uppercase tracking-widest text-matteo-stone hover:text-matteo-orange transition-colors">
                                &larr; Return to Details
                            </span>
                            <h2 className="font-serif text-4xl text-matteo-charcoal dark:text-white mt-2">Settlement</h2>
                        </div>

                        <div className="space-y-8">
                            
                            {/* Mock Stripe + Lightspeed Integration UI */}
                            <div className="space-y-4">
                                <div className="bg-[#f4f4f4] dark:bg-[#111] p-8 border border-matteo-charcoal/10 dark:border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
                                    <div className="flex items-center gap-3 mb-6">
                                        {/* Stripe Logo Icon */}
                                        <svg className="w-10 h-10 text-[#635BFF]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19.9532 40C8.93246 40 0 31.065 0 20C0 8.935 8.93246 0 19.9532 0C30.9715 0 39.904 8.935 39.904 20C39.904 31.065 30.9715 40 19.9532 40ZM19.2312 11.2375C16.1415 11.2375 14.0722 12.8225 14.0722 15.655C14.0722 18.2325 15.9323 19.57 19.0195 20.3025L20.4445 20.64C22.2592 21.0775 23.0032 21.6775 23.0032 22.785C23.0032 24.1825 21.6165 25.105 19.4632 25.105C16.92 25.105 15.1118 23.955 13.9118 22.4275L10.3725 25.435C12.4492 28.0925 15.5415 29.5 19.4445 29.5C22.6868 29.5 24.939 28.1675 26.3197 26.2425C27.2797 24.8975 27.6592 23.355 27.6592 21.7525C27.6592 18.23 25.2697 16.7325 21.9442 15.9975L20.5792 15.6875C19.1415 15.3625 18.3375 14.8675 18.3375 13.8875C18.3375 12.7275 19.431 11.95 21.3667 11.95C23.1945 11.95 24.597 12.6375 25.597 13.7575L28.9868 10.74C26.969 8.2175 24.2392 7.0225 21.4642 7.0225L21.4618 7.0225H21.4595C20.8063 7.0225 20.1064 7.07346 19.3845 7.155V11.2375H19.2312Z" fill="currentColor"/>
                                        </svg>
                                        <span className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal dark:text-white font-medium">Stripe Secure Checkout</span>
                                    </div>
                                    <p className="font-sans text-[10px] text-matteo-stone uppercase tracking-widest leading-relaxed text-center max-w-sm mb-4">
                                        * LIVE ENVIRONMENT ACTIVE *
                                    </p>
                                    <p className="font-sans text-[10px] text-[#635BFF] uppercase tracking-widest leading-relaxed text-center max-w-md font-bold">
                                        You are connecting to real PCI-compliant payment orchestration. Your card will be charged.
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-4 p-5 bg-matteo-orange/5 dark:bg-matteo-orange/10 border border-matteo-orange/20">
                                    <div className="w-2 h-2 rounded-full bg-matteo-orange animate-pulse shrink-0"></div>
                                    <p className="font-sans text-[9px] uppercase tracking-widest text-matteo-charcoal dark:text-white/80 leading-relaxed">
                                        Upon successful Stripe authorization, this commission will be automatically synchronized with <span className="font-serif italic capitalize text-matteo-orange">Lightspeed Series X</span> for inventory and accounting management.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 pt-4">
                                <input 
                                    type="checkbox" 
                                    id="authCheckbox"
                                    checked={authChecked}
                                    onChange={e => setAuthChecked(e.target.checked)}
                                    className="mt-1 accent-matteo-orange cursor-pointer" 
                                    required
                                />
                                <label htmlFor="authCheckbox" className="font-sans text-[10px] text-matteo-stone uppercase tracking-widest leading-relaxed cursor-pointer">
                                    I authorize Matteo Perin to charge my card for the total amount. I acknowledge that bespoke items are made to order and cannot be returned once production begins.
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={isProcessing || !authChecked}
                                className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed mt-8"
                            >
                                {isProcessing ? paymentStatus : `Pay $${finalTotal.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer Security */}
                <div className="absolute bottom-8 left-0 w-full text-center lg:text-left px-6 lg:px-24">
                    <div className="flex items-center justify-center lg:justify-start gap-6 opacity-40">
                         <span className="font-sans text-[9px] uppercase tracking-widest text-matteo-charcoal dark:text-white">Secure SSL Encryption</span>
                         <span className="h-3 w-[1px] bg-current"></span>
                         <span className="font-sans text-[9px] uppercase tracking-widest text-matteo-charcoal dark:text-white">Global Blue® Tax Free</span>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: THE MANIFEST (Summary) */}
            <CheckoutManifest 
                cartItems={cartItems} 
                cartTotal={cartTotal} 
                selectedShipping={selectedShipping} 
                finalTotal={finalTotal}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
            />

        </div>
    );
};
