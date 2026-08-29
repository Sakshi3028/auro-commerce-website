import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    tax,
    shippingFee,
    discount,
    appliedCoupon,
    total,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    openCheckout,
    applyCoupon,
    removeCoupon,
    shippingThreshold
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / shippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, shippingThreshold - subtotal);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setPromoLoading(true);
    setPromoError('');
    const res = await applyCoupon(promoCodeInput);
    setPromoLoading(false);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoCodeInput('');
    }
  };

  return (
    <div
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div
        id="cart-drawer-container"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 relative z-10"
      >
        {/* Header */}
        <div className="p-5 border-b border-indigo-100 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-yellow-400 text-indigo-950 flex items-center justify-center font-black shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base uppercase tracking-tight text-white font-['Outfit',sans-serif]">
                Shopping Cart
              </h2>
              <span className="text-xs text-indigo-200 font-bold">{itemCount} {itemCount === 1 ? 'item' : 'items'} selected</span>
            </div>
          </div>

          <button
            id="close-cart-drawer-btn"
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-indigo-700/80 hover:bg-indigo-800 text-indigo-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-3 bg-indigo-50/70 border-b border-indigo-100">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Truck className="w-4 h-4 text-indigo-600" />
              {amountToFreeShipping === 0 ? (
                <span className="text-emerald-700 font-extrabold">You qualify for FREE Express Shipping!</span>
              ) : (
                <span>Add <strong className="text-rose-600">${amountToFreeShipping.toFixed(2)}</strong> more for FREE shipping</span>
              )}
            </span>
            <span className="text-indigo-950 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 via-rose-500 to-yellow-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Your cart is currently empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Explore our curated product collection and add items to your cart.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={`${item.productId}-${item.selectedColor}`} className="pt-4 first:pt-0 flex gap-3.5">
                {/* Image */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-18 h-18 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-200/60"
                />

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                      <button
                        onClick={() => removeFromCart(item.productId, item.selectedColor)}
                        className="text-slate-400 hover:text-rose-600 transition p-0.5 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      {item.selectedColor && (
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {item.selectedColor}
                        </span>
                      )}
                      <span>${item.product.price.toFixed(2)} each</span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor)}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-l transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor)}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-r transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Calculations and Checkout Trigger */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-4">
            
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                      <span className="text-emerald-700 text-[11px] block">{appliedCoupon.description}</span>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="cart-promo-code-input"
                      type="text"
                      placeholder="Promo code (try WELCOME10)"
                      value={promoCodeInput}
                      onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  <button
                    type="submit"
                    disabled={promoLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{promoError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                <span>Estimated Total</span>
                <span className="text-xl text-indigo-600 font-['Outfit',sans-serif]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={openCheckout}
              className="w-full py-4 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
