import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem, CustomizationOptions } from '../types';
import { trackAddToCart } from '../lib/analytics';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, customizations?: CustomizationOptions) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('matteo_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('matteo_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, customizations?: CustomizationOptions) => {
    trackAddToCart(product, 1);
    setCartItems(prev => {
      // If it has customizations, it's always a new unique line item
      if (customizations) {
        const newItem: CartItem = {
          ...product,
          quantity: 1,
          customizations,
          cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        return [...prev, newItem];
      }

      // Check if a non-customized version of the same piece already exists.
      // Inventory pieces also carry parentName + styleName (the identity the
      // checkout API matches against the live sheet); compare on those too so
      // the same one-of-one is recognised even when a cart persisted in
      // localStorage carries an older client-side id for it.
      const sameInventoryPiece = (item: CartItem) => {
        const a = item as any;
        const b = product as any;
        return Boolean(
          a.parentName && b.parentName &&
          a.parentName === b.parentName &&
          (a.styleName || a.variationTitle || '') === (b.styleName || b.variationTitle || '')
        );
      };
      const existing = prev.find(item => !item.customizations && (item.id === product.id || sameInventoryPiece(item)));
      if (existing) {
        const maxQty = existing.stock ?? Infinity;
        return prev.map(item =>
          item.cartItemId === existing.cartItemId
            ? { ...item, quantity: Math.min(item.quantity + 1, maxQty) }
            : item
        );
      }

      // Add new non-customized item
      return [...prev, {
        ...product,
        quantity: 1,
        cartItemId: `${product.id}-standard`
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.min(quantity, item.stock ?? Infinity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};