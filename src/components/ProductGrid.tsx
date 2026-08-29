import React, { useState } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles, Filter, Check } from 'lucide-react';
import { Product, FilterState } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  categories: Array<{ name: string; count: number }>;
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectProduct
}) => {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const categoryList = ['All', ...categories.map(c => c.name)];
  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand)))];

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.search !== '' ||
    filters.brand !== 'All' ||
    filters.minPrice > 0 ||
    filters.maxPrice < 600 ||
    filters.inStockOnly;

  return (
    <section id="storefront-product-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-slate-200/80 mb-6">
        {categoryList.map(cat => (
          <button
            key={cat}
            id={`filter-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={() => onFilterChange({ category: cat })}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
              filters.category === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                : 'bg-white text-slate-700 hover:text-indigo-600 hover:border-yellow-400 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Control Bar: Total Count, Search Active Tag, Filter Drawer Toggle, Sorting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit',sans-serif] uppercase tracking-tight flex items-center gap-2.5">
            <span>{filters.category === 'All' ? 'Catalog Collection' : filters.category}</span>
            <span className="text-xs font-extrabold text-indigo-950 bg-yellow-300 px-2.5 py-0.5 rounded-full shadow-2xs">
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          </h2>
          {filters.search && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span>Showing results for:</span>
              <strong className="text-indigo-900 font-bold">"{filters.search}"</strong>
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="text-rose-600 hover:text-rose-800 underline font-bold text-xs ml-1 cursor-pointer"
              >
                Clear
              </button>
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            id="open-filters-sidebar-btn"
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 transition cursor-pointer shadow-xs ${
              hasActiveFilters
                ? 'bg-yellow-400 border-yellow-500 text-indigo-950 shadow-sm'
                : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-500 hidden md:inline">Sort:</span>
            <select
              id="product-sort-select"
              value={filters.sortBy}
              onChange={e => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              aria-label="Sort products by"
              className="text-xs font-extrabold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured &amp; Best Picks</option>
              <option value="popular">Customer Reviews &amp; Popularity</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Releases</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isFilterDrawerOpen && (
        <div id="filter-drawer-panel" className="bg-white rounded-3xl border border-indigo-100 p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Refine Catalog</span>
            </h3>
            {hasActiveFilters && (
              <button
                id="reset-all-filters-btn"
                onClick={onResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            {/* Price Range */}
            <div>
              <label className="font-bold text-slate-800 block mb-2">Max Price: <span className="text-indigo-600 font-extrabold">${filters.maxPrice}</span></label>
              <input
                id="filter-price-range"
                type="range"
                min="50"
                max="600"
                step="10"
                value={filters.maxPrice}
                onChange={e => onFilterChange({ maxPrice: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
                <span>$50</span>
                <span>$300</span>
                <span>$600+</span>
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="font-bold text-slate-800 block mb-2">Brand</label>
              <select
                id="filter-brand-select"
                value={filters.brand}
                onChange={e => onFilterChange({ brand: e.target.value })}
                aria-label="Filter by brand"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Stock Availability */}
            <div className="flex flex-col justify-center">
              <label className="font-bold text-slate-800 block mb-2">Availability</label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  id="filter-in-stock-checkbox"
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={e => onFilterChange({ inStockOnly: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-slate-800 font-bold">In-Stock Items Only</span>
              </label>
            </div>

            {/* Active Filters Summary */}
            <div className="bg-indigo-50/60 rounded-2xl p-3.5 border border-indigo-100 flex flex-col justify-between">
              <span className="text-[10px] text-indigo-900 font-black uppercase tracking-wider">Active Filters</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {filters.category !== 'All' && (
                  <span className="bg-white border border-indigo-200 text-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                    {filters.category}
                  </span>
                )}
                {filters.inStockOnly && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    In-Stock
                  </span>
                )}
                {filters.maxPrice < 600 && (
                  <span className="bg-white border border-indigo-200 text-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                    &lt; ${filters.maxPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid / Empty State */}
      {products.length > 0 ? (
        <div id="products-catalog-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div id="products-empty-state" className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
          <p className="text-sm text-slate-500 mt-2">
            Try adjusting your search criteria, clearing category filters, or loosening price constraints.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-6 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition cursor-pointer shadow-md shadow-indigo-600/20"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
};
