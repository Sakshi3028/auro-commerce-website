import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  X,
  Package,
  Sparkles,
  LogOut,
  ChevronDown,
  Tag,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
  onOpenOrders: () => void;
  onSelectProduct: (product: Product) => void;
  products: Product[];
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onSelectCategory,
  selectedCategory,
  onOpenOrders,
  onSelectProduct,
  products
}) => {
  const { user, logout, openAuthModal, switchDemoAccount } = useAuth();
  const { itemCount, openCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch(val);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  const filteredQuickProducts = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const categories = ['All', 'Audio & Tech', 'Desk & Office', 'Wearables', 'Lifestyle & Bags'];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-indigo-600 text-white shadow-lg">
      {/* Top Banner */}
      <div id="top-announcement-bar" className="bg-indigo-900/90 text-indigo-100 text-xs py-2 px-4 border-b border-indigo-500/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-yellow-400 text-indigo-950 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full shadow-xs">Flash Promo</span>
            <span>Free Express 2-Day Shipping on orders $100+ &bull; Use code <strong className="text-yellow-300 font-extrabold underline decoration-yellow-400">WELCOME10</strong> for 10% off</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-indigo-200">
            <button
              id="demo-switcher-btn"
              onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
              className="hover:text-white transition flex items-center gap-1.5 bg-indigo-800/80 hover:bg-indigo-700 px-2.5 py-1 rounded-full text-[11px] font-bold border border-indigo-500/50 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>{user ? `Account: ${user.name}` : 'Demo Quick Login'}</span>
              <ChevronDown className="w-3 h-3 text-indigo-300" />
            </button>

            {isDemoDropdownOpen && (
              <div id="demo-dropdown" className="absolute top-8 right-12 mt-1 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Instant Demo Accounts</div>
                <button
                  onClick={() => {
                    switchDemoAccount('jane@example.com');
                    setIsDemoDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">Jane Doe</div>
                    <div className="text-[11px] text-slate-500">Customer &bull; Active Order</div>
                  </div>
                  {user?.email === 'jane@example.com' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
                <button
                  onClick={() => {
                    switchDemoAccount('admin@auracommerce.com');
                    setIsDemoDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 transition flex items-center justify-between mt-1 cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">Alex Rivera (Admin)</div>
                    <div className="text-[11px] text-slate-500">Store Manager Role</div>
                  </div>
                  {user?.email === 'admin@auracommerce.com' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            )}

            <span className="text-indigo-400">|</span>
            <div className="flex items-center gap-1 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
              <span>30-Day Money Back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              id="brand-logo-btn"
              onClick={() => {
                onSelectCategory('All');
                onSearch('');
                setSearchQuery('');
              }}
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
                <span className="text-indigo-950 font-black text-xl">A</span>
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white block font-['Outfit',sans-serif]">
                  AURA<span className="text-yellow-400">COMMERCE</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-200 -mt-1 block">
                  Vibrant Workspace Gear
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav id="desktop-nav-links" className="hidden lg:flex items-center gap-2 font-bold uppercase text-xs tracking-wider">
              {categories.map(cat => (
                <button
                  key={cat}
                  id={`nav-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-yellow-400 text-indigo-950 font-black shadow-md'
                      : 'text-indigo-100 hover:text-white hover:bg-indigo-500/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-md relative hidden sm:block">
            <div className="relative">
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search products, brands, gear..."
                className="w-full bg-indigo-700/70 hover:bg-indigo-700 focus:bg-white text-white focus:text-slate-900 text-xs sm:text-sm rounded-2xl pl-10 pr-9 py-2.5 border border-indigo-400/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-indigo-200 transition-all duration-200 font-medium"
              />
              <Search className="w-4 h-4 text-indigo-300 absolute left-3.5 top-3 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3 text-indigo-300 hover:text-white transition cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearchFocused && filteredQuickProducts.length > 0 && (
              <div id="search-autocomplete-dropdown" className="absolute left-0 right-0 top-full mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                <div className="p-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span>Quick Matches ({filteredQuickProducts.length})</span>
                  <span className="text-[11px] text-indigo-600 font-semibold">Press Esc to close</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {filteredQuickProducts.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectProduct(item);
                        setIsSearchFocused(false);
                      }}
                      className="p-3 hover:bg-indigo-50/70 flex items-center gap-3 cursor-pointer transition"
                    >
                      <img src={item.images[0]} alt={item.name} className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="text-indigo-600 font-bold uppercase text-[10px]">{item.category}</span>
                          <span>&bull;</span>
                          <span className="font-extrabold text-slate-900">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Orders Hub Button */}
            <button
              id="my-orders-nav-btn"
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-100 hover:text-yellow-300 hover:bg-indigo-700/60 rounded-xl transition cursor-pointer"
              title="My Orders & Tracking"
            >
              <Package className="w-4 h-4 text-yellow-300" />
              <span className="hidden sm:inline">Orders</span>
            </button>

            {/* Auth Dropdown / Button */}
            {user ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 bg-indigo-700/90 hover:bg-indigo-800 py-1.5 px-3.5 rounded-full border border-indigo-400/60 transition focus:outline-none shadow-xs cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-300 text-indigo-950 flex items-center justify-center font-black text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-white max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-300" />
                </button>

                {isUserDropdownOpen && (
                  <div id="user-dropdown-menu" className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 bg-yellow-100 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onOpenOrders();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-indigo-500" />
                        <span>Order History &amp; Tracking</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        id="user-logout-btn"
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-sign-in-btn"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-100 hover:text-yellow-300 hover:bg-indigo-700/60 rounded-xl transition cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-yellow-300" />
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Cart Button with Vibrant Rose Badge */}
            <button
              id="header-cart-toggle-btn"
              onClick={openCart}
              className="relative flex items-center justify-center p-2.5 bg-indigo-700/80 hover:bg-indigo-800 text-white rounded-2xl border border-indigo-400/50 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 text-yellow-300" />
              {itemCount > 0 && (
                <span
                  id="cart-badge-count"
                  className="bg-rose-500 text-white text-[10px] absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-indigo-600 shadow-md"
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-yellow-300 lg:hidden rounded-xl hover:bg-indigo-700 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-3">
          <div className="relative">
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products, brands..."
              className="w-full bg-indigo-700 text-white placeholder-indigo-200 text-xs rounded-xl pl-10 pr-8 py-2.5 border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
            />
            <Search className="w-4 h-4 text-indigo-300 absolute left-3.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div id="mobile-nav-drawer" className="lg:hidden border-t border-indigo-500/60 py-3 space-y-1 animate-in slide-in-from-top-4">
            <div className="text-[11px] font-black text-yellow-300 uppercase tracking-wider px-3 py-1">Shop by Category</div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  selectedCategory === cat ? 'bg-yellow-400 text-indigo-950 font-black' : 'text-white hover:bg-indigo-700'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="pt-2 border-t border-indigo-500/60">
              <button
                onClick={() => {
                  onOpenOrders();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-700 rounded-xl flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-yellow-300" />
                <span>My Orders &amp; Receipts</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
