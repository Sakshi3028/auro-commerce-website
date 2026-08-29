import React from 'react';
import { ArrowRight, Sparkles, Shield, Truck, RotateCcw, Zap } from 'lucide-react';
import { Product } from '../types';

interface HeroBannerProps {
  onShopNow: () => void;
  featuredProduct?: Product;
  onSelectProduct: (p: Product) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopNow,
  featuredProduct,
  onSelectProduct
}) => {
  return (
    <section id="hero-showcase-section" className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white py-12 lg:py-16">
      {/* Decorative Vibrant Glow Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400 text-indigo-950 text-xs font-black tracking-wider uppercase shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-950 animate-pulse" />
              <span>Next-Gen Audio &amp; Workspace Gear 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-['Outfit',sans-serif] leading-[1.08] text-white uppercase">
              Engineered for <span className="text-yellow-300 drop-shadow-sm">Perfection</span> &amp; Focus.
            </h1>

            <p className="text-indigo-100 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
              Discover precision-crafted audio gear, tactile mechanical keyboards, and minimalist desk ergonomics. Backed by express shipping and full warranty.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-shop-collection-btn"
                onClick={onShopNow}
                className="px-7 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-all flex items-center gap-2 group cursor-pointer active:scale-95"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {featuredProduct && (
                <button
                  id="hero-view-flagship-btn"
                  onClick={() => onSelectProduct(featuredProduct)}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-white/20 hover:border-white/40 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>Featured: {featuredProduct.name.split(' ')[0]}</span>
                </button>
              )}
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-indigo-400/40 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-yellow-300 shrink-0" />
                <div className="text-xs">
                  <div className="font-extrabold text-white">Free Express</div>
                  <div className="text-indigo-200 text-[11px]">Orders &gt; $100</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-emerald-300 shrink-0" />
                <div className="text-xs">
                  <div className="font-extrabold text-white">30-Day Return</div>
                  <div className="text-indigo-200 text-[11px]">No questions asked</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-yellow-300 shrink-0" />
                <div className="text-xs">
                  <div className="font-extrabold text-white">2-Yr Warranty</div>
                  <div className="text-indigo-200 text-[11px]">Full manufacturer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Spotlight Card */}
          {featuredProduct && (
            <div className="lg:col-span-5 relative">
              <div
                onClick={() => onSelectProduct(featuredProduct)}
                className="group relative bg-indigo-900/60 backdrop-blur-md rounded-3xl p-5 border border-indigo-400/40 shadow-2xl hover:border-yellow-400 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-yellow-400 text-indigo-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Staff Choice
                  </span>
                </div>

                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 mb-4">
                  <img
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-yellow-300 font-bold uppercase tracking-wider">
                    <span>{featuredProduct.category}</span>
                    <span className="text-emerald-300 font-semibold">{featuredProduct.stock} units in stock</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white group-hover:text-yellow-300 transition-colors line-clamp-1">
                    {featuredProduct.name}
                  </h3>

                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-black text-white font-['Outfit',sans-serif]">
                      ${featuredProduct.price.toFixed(2)}
                    </span>
                    {featuredProduct.originalPrice && (
                      <span className="text-sm text-indigo-200 line-through">
                        ${featuredProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs font-black text-rose-300 bg-rose-500/20 border border-rose-400/30 px-2 py-0.5 rounded-full ml-auto">
                      Save ${(featuredProduct.originalPrice ? featuredProduct.originalPrice - featuredProduct.price : 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
