
import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartSidebar: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
      setIsCartOpen(false);
      navigate('/checkout');
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
      <div className="relative w-full max-w-md bg-matteo-cream dark:bg-[#111] h-full shadow-2xl flex flex-col animate-fade-in-up border-l border-matteo-charcoal/5 dark:border-white/5 transition-colors duration-500">
        <div className="p-8 flex justify-between items-center border-b border-matteo-charcoal/5 dark:border-white/5">
          <div>
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-matteo-orange block mb-1">Your Selection</span>
              <h2 className="font-serif text-2xl text-matteo-charcoal dark:text-white">The Bag</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="text-matteo-stone hover:text-matteo-charcoal dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <p className="font-serif italic text-gray-400 mb-4 text-lg">Your bag is empty.</p>
                    <p className="font-sans text-[10px] text-matteo-stone max-w-[200px] mb-8 leading-relaxed">
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
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 dark:brightness-90" />
                                {item.customizations?.monogram && (
                                    <div className="absolute bottom-0 right-0 bg-matteo-charcoal text-white text-[8px] p-1 font-serif">
                                        {item.customizations.monogram}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-serif text-xl text-matteo-charcoal dark:text-white leading-none">{item.title}</h3>
                                    </div>
                                    <p className="font-sans text-[10px] uppercase tracking-widest text-matteo-stone mb-2">{item.category}</p>
                                    
                                    {/* Customization Details */}
                                    {item.customizations && (
                                        <div className="mb-2 space-y-1">
                                            {item.customizations.material && (
                                                <p className="font-sans text-[9px] text-matteo-charcoal/80 dark:text-gray-400">
                                                    Material: <span className="text-matteo-stone">{item.customizations.material}</span>
                                                </p>
                                            )}
                                            {item.customizations.monogram && (
                                                <p className="font-sans text-[9px] text-matteo-charcoal/80 dark:text-gray-400">
                                                    Monogram: <span className="text-matteo-stone">{item.customizations.monogram}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <span className="font-sans text-xs text-matteo-charcoal/60 dark:text-gray-400 font-medium">
                                        ${item.price.toLocaleString()}
                                        {item.id === 14 && <span className="text-matteo-orange ml-1">(Deposit)</span>}
                                    </span>
                                    {item.id === 14 && (
                                        <span className="block font-sans text-[8px] uppercase tracking-[0.1em] text-matteo-stone mt-1">
                                            Full commission: $185,000 · Pay the rest later
                                        </span>
                                    )}
                                </div>

                                {/* Quantity Controls + Remove (no stepper on one-of-one pieces) */}
                                <div className="flex items-center justify-between mt-3">
                                    {item.stock === 1 ? (
                                        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-matteo-orange">
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
                                        className="font-sans text-[9px] uppercase tracking-widest text-matteo-stone hover:text-matteo-orange transition-colors"
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
                <p className="font-serif text-[10px] text-gray-400 italic mb-4">
                    Shipping & taxes calculated at checkout.
                </p>
                {cartItems.some(item => item.id === 14) && (
                    <div className="bg-matteo-orange/5 dark:bg-matteo-orange/10 border border-matteo-orange/20 rounded-sm p-3 mb-4">
                        <p className="font-sans text-[9px] uppercase tracking-[0.1em] text-matteo-charcoal/60 dark:text-white/50 leading-relaxed">
                            <span className="text-matteo-orange font-medium">Deposit Item Included:</span> Your $25,000 deposit secures the Bespoke Crocodile Jacket commission. The remaining balance of $160,000 will be invoiced separately.
                        </p>
                    </div>
                )}
                <button 
                    onClick={handleCheckout}
                    className="w-full bg-matteo-charcoal dark:bg-white text-white dark:text-matteo-black py-5 font-sans text-xs uppercase tracking-[0.2em] hover:bg-matteo-orange dark:hover:bg-matteo-orange hover:text-white dark:hover:text-white transition-colors duration-300 flex justify-center items-center gap-2"
                >
                    <span>Proceed to Checkout</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
