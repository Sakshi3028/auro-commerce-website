import React, { useState, useEffect } from 'react';
import { Flame, Clock, Tag, ArrowRight, ShoppingBag, Check, Copy } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface DealsSectionProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
}

export const DealsSection: React.FC<DealsSectionProps> = ({ products, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [copiedCode, setCopiedCode] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Countdown timer simulation (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Find products that have discounts
  const dealProducts = products
    .filter(p => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 3);

  if (dealProducts.length === 0) return null;

  return (
    <section id="flash-deals-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-500/30">
        {/* Decorative Glow elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-indigo-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
              <span>Limited-Time Specials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] uppercase tracking-tight text-white">
              Flash Deals &amp; Discounts
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium mt-1">
              Massive markdowns on certified flagship inventory. Up to 35% off while supplies last.
            </p>
          </div>

          {/* Countdown & Promo Badge */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Live Countdown Box */}
            <div className="flex items-center gap-2 bg-indigo-900/90 border border-indigo-700 px-4 py-2.5 rounded-2xl">
              <Clock className="w-4 h-4 text-yellow-300 animate-pulse" />
              <div className="text-xs">
                <span className="text-indigo-300 font-bold uppercase text-[10px] block">Ends in:</span>
                <span className="font-mono font-black text-sm text-white tracking-wider">
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Coupon Code Pill */}
            <div className="flex items-center gap-2 bg-yellow-400 text-indigo-950 px-4 py-2.5 rounded-2xl shadow-md">
              <Tag className="w-4 h-4 text-indigo-950 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block">Use Promo Code:</span>
                <span className="font-black text-xs font-mono">WELCOME10 (10% OFF)</span>
              </div>
              <button
                onClick={() => handleCopyCoupon('WELCOME10')}
                className="ml-2 p-1.5 bg-indigo-950 text-white rounded-xl hover:bg-indigo-900 transition cursor-pointer text-xs flex items-center gap-1"
                title="Copy coupon code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* Deals Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {dealProducts.map(product => {
            const savings = product.originalPrice ? product.originalPrice - product.price : 0;
            const discountPercent = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            return (
              <div
                key={product.id}
                id={`deal-card-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="group bg-indigo-900/60 backdrop-blur-md rounded-2xl p-4 border border-indigo-700/60 hover:border-yellow-400 shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md">
                        Save {discountPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-yellow-300 font-bold uppercase tracking-wider mb-1">
                    {product.category} &bull; {product.brand}
                  </div>

                  <h3 className="font-extrabold text-white text-sm line-clamp-1 group-hover:text-yellow-300 transition-colors">
                    {product.name}
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-indigo-800/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-yellow-300 font-['Outfit',sans-serif]">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-indigo-300 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300">
                      Save ${savings.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                      setAddedId(product.id);
                      setTimeout(() => setAddedId(null), 1500);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      addedId === product.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/30'
                    }`}
                  >
                    {addedId === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Claim Deal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
