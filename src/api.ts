import { Product, User, Order, Review, FilterState, CouponValidation } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_USERS, INITIAL_REVIEWS } from './mockData';

const BASE_URL = '/api';

// Helper to access auth token
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('auracommerce_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// -------------------------------------------------------------
// Client-side Local Storage Database Fallback for Static Deployments (Vercel, Netlify, GitHub Pages)
// -------------------------------------------------------------
const LS_KEYS = {
  PRODUCTS: 'auracommerce_products_cache',
  USERS: 'auracommerce_users_cache',
  ORDERS: 'auracommerce_orders_cache',
  REVIEWS: 'auracommerce_reviews_cache',
  COUPONS: 'auracommerce_coupons_cache'
};

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local products:', e);
  }
  return INITIAL_PRODUCTS;
}

function getLocalUsers(): User[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local users:', e);
  }
  return INITIAL_USERS;
}

function saveLocalUsers(users: User[]) {
  try {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.warn('Failed to save local users:', e);
  }
}

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local orders:', e);
  }
  return [];
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.warn('Failed to save local orders:', e);
  }
}

function getLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.REVIEWS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local reviews:', e);
  }
  return INITIAL_REVIEWS;
}

function saveLocalReviews(reviews: Review[]) {
  try {
    localStorage.setItem(LS_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Failed to save local reviews:', e);
  }
}

export const api = {
  // -------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------
  async register(data: { name: string; email: string; password: string; phone?: string; address?: any }): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback for static hosting
    }

    // Client-side Registration Fallback
    const users = getLocalUsers();
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'user',
      phone: data.phone || '',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      address: data.address || {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveLocalUsers(users);

    const token = `token_static_${newUser.id}_${Date.now()}`;
    return { token, user: newUser };
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback for static hosting
    }

    // Client-side Login Fallback
    const users = getLocalUsers();
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      const token = `token_static_${existing.id}_${Date.now()}`;
      return { token, user: existing };
    }

    // If demo credentials or new email
    const demoUser = INITIAL_USERS.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (demoUser) {
      const token = `token_static_${demoUser.id}_${Date.now()}`;
      return { token, user: demoUser };
    }

    // Create dynamic user for seamless preview
    const fallbackUser: User = {
      id: `user_${Date.now()}`,
      name: data.email.split('@')[0].replace('.', ' '),
      email: data.email,
      role: 'user',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      createdAt: new Date().toISOString()
    };
    users.push(fallbackUser);
    saveLocalUsers(users);

    const token = `token_static_${fallbackUser.id}_${Date.now()}`;
    return { token, user: fallbackUser };
  },

  async getMe(): Promise<{ user: User }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback for static hosting
    }

    const token = localStorage.getItem('auracommerce_token');
    const storedUserRaw = localStorage.getItem('auracommerce_user');
    if (storedUserRaw) {
      try {
        return { user: JSON.parse(storedUserRaw) };
      } catch (e) {
        // continue
      }
    }

    if (token) {
      return { user: INITIAL_USERS[0] };
    }

    throw new Error('Unauthorized');
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const users = getLocalUsers();
    const storedRaw = localStorage.getItem('auracommerce_user');
    let current = storedRaw ? JSON.parse(storedRaw) : INITIAL_USERS[0];
    const updated = { ...current, ...updates };

    const idx = users.findIndex(u => u.id === updated.id);
    if (idx >= 0) users[idx] = updated;
    else users.push(updated);
    saveLocalUsers(users);

    localStorage.setItem('auracommerce_user', JSON.stringify(updated));
    return { user: updated };
  },

  async getDemoUsers(): Promise<Array<{ id: string; name: string; email: string; role: string; avatar?: string }>> {
    try {
      const res = await fetch(`${BASE_URL}/auth/demo-users`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return INITIAL_USERS.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar
    }));
  },

  // -------------------------------------------------------------
  // Products
  // -------------------------------------------------------------
  async getProducts(filters?: Partial<FilterState>): Promise<{ products: Product[]; total: number; totalPages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters?.brand && filters.brand !== 'All') params.append('brand', filters.brand);
      if (filters?.minPrice !== undefined && filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined && filters.maxPrice < 1000) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.inStockOnly) params.append('inStock', 'true');
      if (filters?.sortBy) params.append('sort', filters.sortBy);

      const res = await fetch(`${BASE_URL}/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          return data;
        }
      }
    } catch {
      // Offline / Static host fallback
    }

    // Client-side filtering logic
    let list = [...getLocalProducts()];

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters?.category && filters.category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.brand && filters.brand !== 'All') {
      list = list.filter(p => p.brand.toLowerCase() === filters.brand!.toLowerCase());
    }

    if (filters?.minPrice !== undefined) {
      list = list.filter(p => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      list = list.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters?.inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'featured':
        default:
          list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return {
      products: list,
      total: list.length,
      totalPages: 1
    };
  },

  async getCategories(): Promise<Array<{ name: string; count: number }>> {
    try {
      const res = await fetch(`${BASE_URL}/products/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Fallback
    }

    const products = getLocalProducts();
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  },

  async getProduct(id: string): Promise<{ product: Product; reviews: Review[]; related: Product[] }> {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const products = getLocalProducts();
    const product = products.find(p => p.id === id || p.slug === id);
    if (!product) {
      throw new Error('Product not found');
    }

    const allReviews = getLocalReviews();
    const reviews = allReviews.filter(r => r.productId === product.id);
    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

    return { product, reviews, related };
  },

  async addReview(productId: string, data: { rating: number; title: string; comment: string; userName?: string }): Promise<{ review: Review }> {
    try {
      const res = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const allReviews = getLocalReviews();
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId,
      userId: 'user_current',
      userName: data.userName || 'Verified Buyer',
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      verifiedPurchase: true,
      createdAt: new Date().toISOString()
    };

    allReviews.unshift(newReview);
    saveLocalReviews(allReviews);

    return { review: newReview };
  },

  // -------------------------------------------------------------
  // Coupons
  // -------------------------------------------------------------
  async validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
    try {
      const res = await fetch(`${BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const coupon = INITIAL_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid promo code. Try WELCOME10 or AURA20.'
      };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        message: `Minimum order value for ${coupon.code} is $${coupon.minOrderValue.toFixed(2)}.`
      };
    }

    const discountAmount = Math.min((subtotal * coupon.discountPercent) / 100, coupon.maxDiscount);

    return {
      valid: true,
      message: `${coupon.description} applied successfully!`,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        description: coupon.description,
        discountAmount: Number(discountAmount.toFixed(2))
      }
    };
  },

  // -------------------------------------------------------------
  // Orders
  // -------------------------------------------------------------
  async createOrder(orderPayload: any): Promise<{ message: string; order: Order }> {
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      orderNumber,
      customerName: orderPayload.customerName || 'Customer',
      customerEmail: orderPayload.customerEmail || 'guest@auracommerce.com',
      customerPhone: orderPayload.customerPhone || '',
      shippingAddress: orderPayload.shippingAddress || {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94107',
        country: 'United States'
      },
      shippingMethod: orderPayload.shippingMethod || {
        id: 'standard',
        name: 'Free Standard Ground',
        price: 0,
        estimatedDays: '3-5 business days'
      },
      paymentMethod: orderPayload.paymentMethod || {
        type: 'card',
        lastFour: '4242',
        cardBrand: 'Visa'
      },
      items: orderPayload.items || [],
      subtotal: orderPayload.subtotal || 0,
      shippingFee: orderPayload.shippingFee || 0,
      tax: orderPayload.tax || 0,
      discount: orderPayload.discount || 0,
      couponCode: orderPayload.couponCode,
      total: orderPayload.total || 0,
      status: 'processing',
      timeline: [
        {
          status: 'pending',
          title: 'Order Placed & Verified',
          timestamp: new Date().toISOString(),
          completed: true
        },
        {
          status: 'processing',
          title: 'Warehouse Allocation & Quality Inspection',
          timestamp: new Date().toISOString(),
          completed: true
        },
        {
          status: 'shipped',
          title: 'Dispatched with Courier',
          timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          completed: false
        },
        {
          status: 'delivered',
          title: 'Delivered to Doorstep',
          timestamp: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          completed: false
        }
      ],
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      createdAt: new Date().toISOString()
    };

    const orders = getLocalOrders();
    orders.unshift(newOrder);
    saveLocalOrders(orders);

    return {
      message: 'Order placed successfully!',
      order: newOrder
    };
  },

  async getOrders(email?: string): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      const res = await fetch(`${BASE_URL}/orders?${params.toString()}`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const orders = getLocalOrders();
    if (!email) return orders;
    return orders.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
  },

  async getOrder(id: string): Promise<Order> {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const orders = getLocalOrders();
    const order = orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  async cancelOrder(id: string): Promise<{ order: Order }> {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const orders = getLocalOrders();
    const order = orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) throw new Error('Order not found');

    order.status = 'cancelled';
    saveLocalOrders(orders);

    return { order };
  },

  // -------------------------------------------------------------
  // System
  // -------------------------------------------------------------
  async getStats(): Promise<{ totalProducts: number; totalOrders: number; totalUsers: number; totalRevenue: number }> {
    try {
      const res = await fetch(`${BASE_URL}/stats`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const products = getLocalProducts();
    const orders = getLocalOrders();
    const users = getLocalUsers();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalRevenue: Number(totalRevenue.toFixed(2))
    };
  },

  async resetDatabase(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/system/reset-db`, { method: 'POST' });
    } catch {
      // Fallback
    }
    localStorage.removeItem(LS_KEYS.PRODUCTS);
    localStorage.removeItem(LS_KEYS.ORDERS);
    localStorage.removeItem(LS_KEYS.USERS);
    localStorage.removeItem(LS_KEYS.REVIEWS);
  }
};
