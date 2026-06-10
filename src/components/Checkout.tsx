
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Logo } from './Logo';
import { Link } from 'react-router-dom';
import { trackBeginCheckout } from '../lib/analytics';

// Read the GA4 client id from the `_ga` cookie (format: GA1.1.<id>.<ts>).
// Returns the "<id>.<ts>" portion GA4 uses as client_id, or '' if absent.
const getGaClientId = (): string => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/);
    return match ? match[1] : '';
};

// Single-step checkout: review the order, then complete address, delivery,
// and payment on Stripe's secure page (which offers Apple Pay / Google Pay).
export const Checkout: React.FC = () => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Entering the checkout page is the real "begin_checkout" moment.
    useEffect(() => {
        if (cartItems.length > 0) {
            trackBeginCheckout(cartItems, cartTotal);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePayment = async () => {
        setIsProcessing(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cartItems,
                    gaClientId: getGaClientId(),
                }),
            });

            if (!response.ok) {
                let errorMsg = 'We could not start the payment. Please try again.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (_) { /* response wasn't JSON */ }
                throw new Error(errorMsg);
            }

            const session = await response.json();
            if (!session.url) throw new Error('We could not start the payment. Please try again.');

            window.location.href = session.url;
        } catch (err: any) {
            console.error('Checkout error:', err);
            setErrorMessage(
                err.message?.includes('Failed to fetch')
                    ? 'We could not reach the payment service. Please check your connection and try again, or contact our concierge at concierge@matteoperin.com.'
                    : err.message
            );
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black flex flex-col items-center justify-center">
                <p className="font-serif text-2xl mb-6 text-matteo-charcoal dark:text-white">Your bag is empty.</p>
                <Link to="/shop" className="font-sans text-xs uppercase tracking-widest border-b border-current pb-1 text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors">
                    Shop Available Pieces
                </Link>
            </div>
        );
    }

    const hasDeposit = cartItems.some(item => item.id === 14);

    return (
        <div className="min-h-screen bg-matteo-cream dark:bg-matteo-black transition-colors duration-700 pt-28 pb-24 px-6">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-14">
                    <Link to="/" className="group flex items-center gap-3">
                        <Logo className="w-10 h-10" />
                        <span className="hidden md:block font-sans text-[10px] uppercase tracking-[0.25em] font-medium text-matteo-charcoal dark:text-white group-hover:text-matteo-orange transition-colors">
                            Matteo Perin
                        </span>
                    </Link>
                    <Link to="/shop" className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone hover:text-matteo-orange transition-colors">
                        Continue Shopping
                    </Link>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl text-matteo-charcoal dark:text-white mb-2">Your Order</h1>
                <p className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone mb-12">
                    Review your selection, then complete payment securely.
                </p>

                {/* Items */}
                <div className="space-y-8 mb-12">
                    {cartItems.map((item) => (
                        <div key={item.cartItemId} className="flex gap-6 group border-b border-matteo-charcoal/10 dark:border-white/10 pb-8">
                            <div className="w-24 h-28 bg-white dark:bg-white/5 overflow-hidden shrink-0">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="font-serif text-xl text-matteo-charcoal dark:text-white leading-tight">{item.title}</h3>
                                    <span className="font-serif text-xl text-matteo-charcoal dark:text-white shrink-0">
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                                <p className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone mt-1 mb-3">{item.category}</p>
                                {item.id === 14 && (
                                    <p className="font-sans text-[9px] uppercase tracking-wider text-matteo-orange mb-3">
                                        Commission deposit · Full commission $185,000 · Balance invoiced before production
                                    </p>
                                )}
                                {item.customizations && (
                                    <div className="mb-3">
                                        {item.customizations.material && <p className="font-sans text-[9px] uppercase tracking-wider text-matteo-charcoal/60 dark:text-white/60">{item.customizations.material}</p>}
                                        {item.customizations.monogram && <p className="font-sans text-[9px] uppercase tracking-wider text-matteo-charcoal/60 dark:text-white/60">Monogram: {item.customizations.monogram}</p>}
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    {item.stock === 1 ? (
                                        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-matteo-orange">
                                            One of One
                                        </span>
                                    ) : (
                                        <div className="flex items-center border border-matteo-charcoal/15 dark:border-white/15">
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center font-sans text-sm text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 h-8 flex items-center justify-center font-sans text-xs text-matteo-charcoal dark:text-white border-x border-matteo-charcoal/15 dark:border-white/15 select-none">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center font-sans text-sm text-matteo-charcoal dark:text-white hover:text-matteo-orange transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeFromCart(item.cartItemId)}
                                        className="font-sans text-[9px] uppercase tracking-widest text-matteo-stone hover:text-matteo-orange transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-10">
                    <div className="flex justify-between items-end">
                        <span className="font-sans text-xs uppercase tracking-widest text-matteo-stone">Subtotal</span>
                        <span className="font-serif text-2xl text-matteo-charcoal dark:text-white">${cartTotal.toLocaleString()}</span>
                    </div>
                    <p className="font-sans text-[10px] text-matteo-stone tracking-wide">
                        Shipping and any applicable taxes are calculated at payment. Complimentary insured courier delivery is available worldwide.
                    </p>
                </div>

                {hasDeposit && (
                    <div className="border border-matteo-orange/20 bg-matteo-orange/5 dark:bg-matteo-orange/10 p-4 mb-10">
                        <p className="font-sans text-[10px] uppercase tracking-wider text-matteo-charcoal/70 dark:text-white/60 leading-relaxed">
                            Your $25,000 deposit reserves the Bespoke Crocodile Jacket commission. The remaining balance of $160,000 is invoiced separately before production begins.
                        </p>
                    </div>
                )}

                {errorMessage && (
                    <div className="border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 mb-8">
                        <p className="font-sans text-xs text-red-700 dark:text-red-400 leading-relaxed">{errorMessage}</p>
                    </div>
                )}

                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Opening Secure Payment…' : 'Continue to Secure Payment'}
                </button>

                <p className="font-sans text-[10px] text-matteo-stone tracking-wide text-center mt-6 leading-relaxed">
                    Payment is completed on Stripe's secure page. We never see your card details.<br />
                    Apple Pay, Google Pay, and all major cards accepted.
                </p>
            </div>
        </div>
    );
};
