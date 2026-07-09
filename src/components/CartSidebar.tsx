
import React, { useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useModalA11y } from '../lib/useModalA11y';
import { trackBeginCheckout } from '../lib/analytics';

// Read the GA4 client id from the `_ga` cookie (format: GA1.1.<id>.<ts>).
// Returns the "<id>.<ts>" portion GA4 uses as client_id, or '' if absent.
// Mirrors the helper in Checkout.tsx so both entry points attribute alike.
const getGaClientId = (): string => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/);
    return match ? match[1] : '';
};

export const CartSidebar: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useModalA11y(isCartOpen, () => setIsCartOpen(false), panelRef);

  // The drawer is already the review step, so checkout goes straight to
  // Stripe's secure page — same request shape and analytics as Checkout.tsx.
  // On ANY failure the /checkout page remains the recovery path.
  const handleCheckout = async () => {
      if (isProcessing) return;
      setIsProcessing(true);
      trackBeginCheckout(cartItems, cartTotal);
      try {
          const response = await fetch('/api/create-checkout-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  items: cartItems,
                  gaClientId: getGaClientId(),
              }),
          });

          const session = await response.json().catch(() => ({}));
          if (!response.ok || !session.url) {
              throw new Error(session.error || 'We could not start the payment.');
          }

          window.location.href = session.url;
          // isProcessing stays true while the browser leaves for Stripe.
      } catch (err) {
          console.error('Bag checkout error:', err);
          setIsProcessing(false);
          setIsCartOpen(false);
          navigate('/checkout');
      }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20  transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Sidebar */}
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Shopping bag" tabIndex={-1} className="relative w-full max-w-md bg-matteo-cream dark:bg-[#111] h-full shadow-2xl flex flex-col animate-fade-in-up border-l border-matteo-charcoal/5 dark:border-white/5 transition-colors duration-500 outline-none">
        <div className="p-8 flex justify-between items-center border-b border-matteo-charcoal/5 dark:border-white/5">
          <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange block mb-1">Your Selection</span>
              <h2 className="font-serif text-2xl text-matteo-charcoal dark:text-white">The Bag</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} aria-label="Close bag" className="text-matteo-stone-ink dark:text-matteo-stone hover:text-matteo-charcoal dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <p className="font-serif italic text-matteo-stone-ink dark:text-white/60 mb-4 text-lg">Your bag is empty.</p>
                    <p className="font-sans text-[10px] text-matteo-stone-ink dark:text-matteo-stone max-w-[200px] mb-8 leading-relaxed">
                        One-of-a-kind pieces, in stock and ready to ship.
                    </p>
                    <button 
                        onClick={() => {
                            setIsCartOpen(false);
                            navigate('/shop');
                        }}
                        className="font-sans text-xs uppercase tracking-widest border-b border-matteo-charcoal dark:border-white pb-1 text-matteo-charcoal dark:text-white hover:text-matteo-orange dark:hover:text-matteo-orange hover:border-matteo-orange dark:hover:border-matteo-orange transition-colors"
                    >
                        Shop Available Pieces
                    </button>
                </div>
            ) : (
                <div className="space-y-12">
                    {cartItems.map(item => (
                        <div key={item.cartItemId} className="flex gap-6 group">
                            <div className="w-24 h-32 bg-[#F0F0F0] dark:bg-[#1a1a1a] overflow-hidden shrink-0 relative">
                                <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 dark:brightness-90" />
                                {item.customizations?.monogram && (
                                    <div className="absolute bottom-0 right-0 bg-matteo-charcoal text-white text-[10px] p-1 font-serif">
                                        {item.customizations.monogram}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-serif text-xl text-matteo-charcoal dark:text-white leading-none">{item.title}</h3>
                                    </div>
                                    <p className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone-ink dark:text-matteo-stone mb-2">{item.category}</p>
                                    
                                    {/* Customization Details */}
                                    {item.customizations && (
                                        <div className="mb-2 space-y-1">
                                            {item.customizations.material && (
                                                <p className="font-sans text-[10px] text-matteo-charcoal/80 dark:text-white/60">
                                                    Material: <span className="text-matteo-stone-ink dark:text-matteo-stone">{item.customizations.material}</span>
                                                </p>
                                            )}
                                            {item.customizations.monogram && (
                                                <p className="font-sans text-[10px] text-matteo-charcoal/80 dark:text-white/60">
                                                    Monogram: <span className="text-matteo-stone-ink dark:text-matteo-stone">{item.customizations.monogram}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <span className="font-sans text-xs text-matteo-charcoal/60 dark:text-white/60 font-medium">
                                        ${item.price.toLocaleString()}
                                        {item.id === 14 && <span className="text-matteo-orange ml-1">(Deposit)</span>}
                                    </span>
                                    {item.id === 14 && (
                                        <span className="block font-sans text-[10px] uppercase tracking-[0.1em] text-matteo-stone-ink dark:text-matteo-stone mt-1">
                                            Deposit toward your bespoke commission · balance invoiced before production
                                        </span>
                                    )}
                                </div>

                                {/* Quantity Controls + Remove (no stepper on one-of-one pieces) */}
                                <div className="flex items-center justify-between mt-3">
                                    {item.stock === 1 ? (
                                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-matteo-orange">
                                            One of One
                                        </span>
                                    ) : (
                                        <div className="flex items-center border border-matteo-charcoal/15 dark:border-white/15">
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center font-sans text-sm text-matteo-charcoal dark:text-white hover:bg-matteo-charcoal/5 dark:hover:bg-white/5 hover:text-matteo-orange transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 h-8 flex items-center justify-center font-sans text-xs text-matteo-charcoal dark:text-white border-x border-matteo-charcoal/15 dark:border-white/15 select-none">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center font-sans text-sm text-matteo-charcoal dark:text-white hover:bg-matteo-charcoal/5 dark:hover:bg-white/5 hover:text-matteo-orange transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => removeFromCart(item.cartItemId)}
                                        className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone-ink dark:text-matteo-stone hover:text-matteo-orange transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {cartItems.length > 0 && (
            <div className="p-8 border-t border-matteo-charcoal/5 dark:border-white/5 bg-white/50 dark:bg-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-sans text-xs uppercase tracking-widest text-matteo-charcoal dark:text-white">Subtotal</span>
                    <span className="font-serif text-xl text-matteo-charcoal dark:text-white">${cartTotal.toLocaleString()}</span>
                </div>
                <p className="font-serif text-[11px] text-matteo-stone-ink dark:text-white/60 italic mb-4">
                    Shipping & taxes calculated at checkout.
                </p>
                {cartItems.some(item => item.id === 14) && (
                    <div className="bg-matteo-orange/5 dark:bg-matteo-orange/10 border border-matteo-orange/20 rounded-sm p-3 mb-4">
                        <p className="font-sans text-[10px] uppercase tracking-[0.1em] text-matteo-charcoal/60 dark:text-white/50 leading-relaxed">
                            <span className="text-matteo-orange font-medium">Deposit Item Included:</span> Your $25,000 deposit secures the Bespoke Crocodile Jacket commission. The remaining balance is invoiced privately before production begins.
                        </p>
                    </div>
                )}
                <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                    <span>{isProcessing ? 'Opening Secure Payment…' : 'Proceed to Checkout'}</span>
                </button>
                {/* Bank-transfer alternative — wording mirrors /checkout */}
                <p className="font-serif italic text-[11px] text-matteo-stone-ink dark:text-white/60 mt-4 leading-relaxed">
                    Prefer to reserve by bank transfer? Write to{' '}
                    <a href="mailto:concierge@matteoperin.com" className="border-b border-matteo-charcoal/30 dark:border-white/30 hover:text-matteo-orange-ink dark:hover:text-matteo-orange transition-colors">concierge@matteoperin.com</a>
                    {' '}or call{' '}
                    <a href="tel:+13072649655" className="border-b border-matteo-charcoal/30 dark:border-white/30 hover:text-matteo-orange-ink dark:hover:text-matteo-orange transition-colors">307.264.9655</a>.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};
