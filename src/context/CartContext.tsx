import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, CouponValidation } from '../types';
import { api } from '../api';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  appliedCoupon: CouponValidation['coupon'] | null;
  total: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  shippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SHIPPING_THRESHOLD = 100; // Free shipping over $100
const STANDARD_SHIPPING_FEE = 9.99;
const TAX_RATE = 0.08; // 8%

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('auracommerce_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation['coupon'] | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('auracommerce_cart', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to persist cart:', err);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    setItems(prev => {
      const color = selectedColor || product.colors?.[0] || 'Default';
      const existingIndex = prev.findIndex(item => item.productId === product.id && (item.selectedColor || 'Default') === color);

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product,
            quantity: Math.min(product.stock, quantity),
            selectedColor: color
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedColor?: string) => {
    setItems(prev => prev.filter(item => !(item.productId === productId && (!selectedColor || item.selectedColor === selectedColor))));
  };

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.productId === productId && (!selectedColor || item.selectedColor === selectedColor)) {
        const maxStock = item.product.stock;
        return {
          ...item,
          quantity: Math.min(maxStock, quantity)
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  // Calculations
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const discount = appliedCoupon
    ? Math.min((subtotal * appliedCoupon.discountPercent) / 100, appliedCoupon.discountAmount)
    : 0;

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shippingFee = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const tax = Number((discountedSubtotal * TAX_RATE).toFixed(2));
  const total = Number((discountedSubtotal + shippingFee + tax).toFixed(2));

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a promo code.' };
    }
    try {
      const res = await api.validateCoupon(code.trim().toUpperCase(), subtotal);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        return { success: true, message: `Promo code ${res.coupon.code} applied! Saved $${res.coupon.discountAmount.toFixed(2)}` };
      }
      return { success: false, message: 'Invalid promo code.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to apply promo code.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        tax,
        shippingFee,
        discount,
        appliedCoupon,
        total,
        isCartOpen,
        isCheckoutOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        applyCoupon,
        removeCoupon,
        shippingThreshold: SHIPPING_THRESHOLD
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
