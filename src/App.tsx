import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FeaturedCategories } from './components/FeaturedCategories';
import { DealsSection } from './components/DealsSection';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AuthModal } from './components/AuthModal';
import { OrderHistoryView } from './components/OrderHistoryView';
import { Footer } from './components/Footer';
import { Product, FilterState, Order } from './types';
import { INITIAL_PRODUCTS } from './mockData';
import { api } from './api';

const DEFAULT_FILTERS: FilterState = {
  category: 'All',
  search: '',
  minPrice: 0,
  maxPrice: 600,
  brand: 'All',
  inStockOnly: false,
  sortBy: 'featured'
};

function StorefrontApp() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Modals & Active Overlays
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isOrdersPortalOpen, setIsOrdersPortalOpen] = useState(false);

  // Fetch products & categories from API or client fallback
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getProducts(filters);
      if (data && data.products && data.products.length > 0) {
        setProducts(data.products);
      } else if (filters.search || filters.category !== 'All' || filters.brand !== 'All') {
        // If filter produced 0 results
        setProducts([]);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err: any) {
      console.warn('Network catalog load fallback:', err);
      // Fallback silently without breaking UI
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    api.getCategories()
      .then(setCategories)
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleSearch = (query: string) => {
    handleFilterChange({ search: query });
  };

  const handleCategorySelect = (category: string) => {
    handleFilterChange({ category, search: '' });
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    // Reload catalog to reflect new inventory levels
    loadProducts();
  };

  // Find flagship product for hero spotlight
  const flagshipProduct = products.find(p => p.isFeatured) || products[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Navigation Header */}
      <Header
        onSearch={handleSearch}
        onSelectCategory={handleCategorySelect}
        selectedCategory={filters.category}
        onOpenOrders={() => setIsOrdersPortalOpen(true)}
        onSelectProduct={setSelectedProduct}
        products={products}
      />

      {/* Hero Showcase (only displayed on store home / All category without search query) */}
      {filters.category === 'All' && !filters.search && (
        <>
          <HeroBanner
            onShopNow={() => {
              const el = document.getElementById('storefront-product-catalog');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            featuredProduct={flagshipProduct}
            onSelectProduct={setSelectedProduct}
          />

          <FeaturedCategories
            onSelectCategory={handleCategorySelect}
            selectedCategory={filters.category}
          />

          <DealsSection
            products={products}
            onSelectProduct={setSelectedProduct}
          />
        </>
      )}

      {/* Main Catalog Section */}
      <main className="flex-1">
        {error && (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={loadProducts}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <ProductGrid
          products={products}
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onSelectProduct={setSelectedProduct}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={setSelectedProduct}
      />

      {/* Multi-step Checkout Modal */}
      <CheckoutModal
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmed Celebration & Receipt */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onViewOrders={() => {
          setCompletedOrder(null);
          setIsOrdersPortalOpen(true);
        }}
      />

      {/* User Login & Register Modal */}
      <AuthModal />

      {/* Orders Hub & Tracking Tracker */}
      <OrderHistoryView
        isOpen={isOrdersPortalOpen}
        onClose={() => setIsOrdersPortalOpen(false)}
        onSelectOrderReceipt={order => {
          setIsOrdersPortalOpen(false);
          setCompletedOrder(order);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StorefrontApp />
      </CartProvider>
    </AuthProvider>
  );
}
