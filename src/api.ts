import { Product, User, Order, Review, FilterState, CouponValidation } from './types';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('auracommerce_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string; phone?: string; address?: any }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    return res.json();
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to log in');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      throw new Error('Unauthorized');
    }
    return res.json();
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  async getDemoUsers(): Promise<Array<{ id: string; name: string; email: string; role: string; avatar?: string }>> {
    const res = await fetch(`${BASE_URL}/auth/demo-users`);
    return res.json();
  },

  // Products
  async getProducts(filters?: Partial<FilterState>): Promise<{ products: Product[]; total: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.brand && filters.brand !== 'All') params.append('brand', filters.brand);
    if (filters?.minPrice !== undefined && filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined && filters.maxPrice < 1000) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.inStockOnly) params.append('inStock', 'true');
    if (filters?.sortBy) params.append('sort', filters.sortBy);

    const res = await fetch(`${BASE_URL}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getCategories(): Promise<Array<{ name: string; count: number }>> {
    const res = await fetch(`${BASE_URL}/products/categories`);
    if (!res.ok) return [];
    return res.json();
  },

  async getProduct(id: string): Promise<{ product: Product; reviews: Review[]; related: Product[] }> {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async addReview(productId: string, data: { rating: number; title: string; comment: string; userName?: string }): Promise<{ review: Review }> {
    const res = await fetch(`${BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json();
  },

  // Coupons
  async validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
    const res = await fetch(`${BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid promo code');
    }
    return res.json();
  },

  // Orders
  async createOrder(orderPayload: any): Promise<{ message: string; order: Order }> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(orderPayload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to process order');
    }
    return res.json();
  },

  async getOrders(email?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    const res = await fetch(`${BASE_URL}/orders?${params.toString()}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async cancelOrder(id: string): Promise<{ order: Order }> {
    const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Could not cancel order');
    }
    return res.json();
  },

  // System
  async getStats(): Promise<{ totalProducts: number; totalOrders: number; totalUsers: number; totalRevenue: number }> {
    const res = await fetch(`${BASE_URL}/stats`);
    return res.json();
  },

  async resetDatabase(): Promise<void> {
    await fetch(`${BASE_URL}/system/reset-db`, { method: 'POST' });
  }
};
