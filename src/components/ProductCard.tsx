import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1600);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group bg-white rounded-3xl border border-slate-100 hover:border-indigo-300 shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col p-4 cursor-pointer relative"
    >
      {/* Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 items-start">
        {product.badge && (
          <span className="bg-yellow-400 text-indigo-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {product.badge}
          </span>
        )}
        {discountPercent && discountPercent > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Image Stage */}
      <div className="relative aspect-square w-full bg-slate-50 rounded-2xl overflow-hidden mb-3">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
        />

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <span className="bg-white text-indigo-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
            <span className="uppercase tracking-wider text-indigo-600 font-extrabold">{product.category}</span>
            <span className="text-slate-500 font-semibold">{product.brand}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-black text-slate-800">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400 font-medium">({product.reviewCount})</span>

            {product.stock <= 10 && product.stock > 0 && (
              <span className="ml-auto text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        {/* Color Switcher (if available) */}
        {product.colors && product.colors.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1" onClick={e => e.stopPropagation()}>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Color:</span>
            <div className="flex items-center gap-1">
              {product.colors.map(col => (
                <button
                  key={col}
                  title={col}
                  onClick={() => setSelectedColor(col)}
                  className={`px-2 py-0.5 text-[10px] rounded-lg border transition cursor-pointer font-bold ${
                    selectedColor === col
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {col.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-indigo-600 font-['Outfit',sans-serif]">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            id={`quick-add-btn-${product.id}`}
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
              addedAnimation
                ? 'bg-emerald-500 text-white'
                : product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-rose-500 text-white shadow-indigo-600/20 hover:shadow-rose-500/30'
            }`}
            title="Add to Shopping Cart"
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-yellow-300" />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
