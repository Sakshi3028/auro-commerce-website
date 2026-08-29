import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones, Mail, ArrowRight, Heart, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };
  return (
    <footer id="main-store-footer" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Prop Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Free Express Shipping</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Complimentary delivery on all orders over $100 across the country.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">2-Year Full Warranty</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Comprehensive manufacturer protection on all mechanical and audio gear.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30-Day Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Love your gear or return it in original condition for a 100% refund.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Expert 24/7 Support</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Dedicated concierge specialists ready to assist with tech specs &amp; setup.</p>
            </div>
          </div>
        </div>

        {/* Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-12 border-b border-slate-800">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-indigo-950 font-black text-xl">A</span>
              </div>
              <span className="font-black text-2xl tracking-tight text-white font-['Outfit',sans-serif]">
                AURA<span className="text-yellow-400">COMMERCE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              Engineered workspace gear, spatial audio instruments, and ergonomic essentials crafted for creators, engineers, and digital minimalists.
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Catalog</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#storefront-product-catalog" className="hover:text-white transition">Audio &amp; Headphones</a></li>
              <li><a href="#storefront-product-catalog" className="hover:text-white transition">Keyboards &amp; Mice</a></li>
              <li><a href="#storefront-product-catalog" className="hover:text-white transition">Standing Desks</a></li>
              <li><a href="#storefront-product-catalog" className="hover:text-white transition">Curved Displays</a></li>
              <li><a href="#storefront-product-catalog" className="hover:text-white transition">Leather Carry Goods</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-white transition cursor-pointer">Order Tracking</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Warranty Registration</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Shipping Rates &amp; Policies</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Privacy &amp; Terms</span></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Stay Connected</h5>
            <p className="text-xs text-slate-400">Subscribe for secret flash sales and new release announcements.</p>
            {isSubscribed ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You're subscribed! Check your inbox for your 10% welcome coupon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AuraCommerce Inc. All rights reserved. Powered by Express.js &amp; React.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Node.js &bull; Express REST API &bull; JSON Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
