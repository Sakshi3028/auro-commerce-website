import React from 'react';
import { Headphones, Laptop, Watch, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedCategoriesProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
  categoryCounts?: Record<string, number>;
}

const CATEGORY_CARDS = [
  {
    name: 'Audio & Tech',
    tagline: 'Spatial audio, ANC headphones & monitors',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    icon: Headphones,
    color: 'from-indigo-600/90 to-indigo-900/90',
    accent: 'bg-yellow-400 text-indigo-950',
    items: '8 Products'
  },
  {
    name: 'Desk & Office',
    tagline: 'Mechanical boards, ergonomic mice & lamps',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    icon: Laptop,
    color: 'from-purple-600/90 to-indigo-950/90',
    accent: 'bg-rose-400 text-white',
    items: '12 Products'
  },
  {
    name: 'Wearables',
    tagline: 'Smart trackers, sapphire glass & biometrics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    icon: Watch,
    color: 'from-amber-600/90 to-slate-950/90',
    accent: 'bg-emerald-400 text-slate-950',
    items: '6 Products'
  },
  {
    name: 'Lifestyle & Bags',
    tagline: 'Weatherproof EDC backpacks & desk mats',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    icon: Briefcase,
    color: 'from-rose-600/90 to-indigo-950/90',
    accent: 'bg-yellow-300 text-indigo-950',
    items: '6 Products'
  }
];

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  return (
    <section id="featured-categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif] uppercase tracking-tight">
            Shop By Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Explore meticulously designed workspace hardware and lifestyle accessories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CATEGORY_CARDS.map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;

          return (
            <div
              key={cat.name}
              id={`category-card-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onSelectCategory(cat.name)}
              className={`group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border ${
                isSelected ? 'ring-4 ring-indigo-500 border-transparent' : 'border-slate-200/80'
              }`}
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-80 group-hover:opacity-90 transition-opacity`} />

              {/* Top Tag & Icon */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${cat.accent}`}>
                  {cat.items}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10 text-white space-y-1.5">
                <h3 className="text-xl font-black font-['Outfit',sans-serif] uppercase tracking-tight group-hover:text-yellow-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-indigo-100/90 font-medium line-clamp-2 leading-relaxed">
                  {cat.tagline}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-yellow-300 group-hover:translate-x-1 transition-transform">
                  <span>Browse Gear</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
