export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  features: string[];
  specs: Record<string, string>;
  tags: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  badge?: string;
  colors?: string[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

export interface PaymentDetails {
  type: 'card' | 'paypal' | 'cod' | 'applepay';
  lastFour?: string;
  cardBrand?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentDetails;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timeline: {
    status: string;
    title: string;
    timestamp: string;
    completed: boolean;
  }[];
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
}

export interface CouponValidation {
  valid: boolean;
  coupon: {
    code: string;
    discountPercent: number;
    description: string;
    discountAmount: number;
  };
}

export interface FilterState {
  category: string;
  search: string;
  minPrice: number;
  maxPrice: number;
  brand: string;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'popular' | 'newest';
}
