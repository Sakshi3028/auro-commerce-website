import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
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
  shippingMethod: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  paymentMethod: {
    type: 'card' | 'paypal' | 'cod' | 'applepay';
    lastFour?: string;
    cardBrand?: string;
  };
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

export interface Coupon {
  code: string;
  discountPercent: number;
  minOrderValue: number;
  maxDiscount: number;
  description: string;
  isActive: boolean;
}

interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  cartSessions: Record<string, CartItem[]>;
}

const DB_FILE = path.join(process.cwd(), 'data', 'ecommerce_db.json');

// Helper to hash passwords
export function hashPassword(password: string, salt?: string): { passwordHash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.pbkdf2Sync(password, finalSalt, 1000, 64, 'sha512').toString('hex');
  return { passwordHash, salt: finalSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const result = hashPassword(password, salt);
  return result.passwordHash === hash;
}

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Aura Studio Wireless Noise-Cancelling Headphones',
    slug: 'aura-studio-wireless-headphones',
    description: 'Flagship spatial audio headphones with 45dB hybrid ANC, transparency mode, and 40-hour ultra-long battery life.',
    fullDescription: 'Immerse yourself in concert-hall acoustic fidelity with Aura Studio. Engineered with 40mm custom planar bio-cellulose dynamic drivers, dynamic head tracking, and titanium-reinforced headband for all-day ergonomic bliss. Features lightning-fast USB-C charge providing 5 hours of listening on a 10-minute charge.',
    price: 249.99,
    originalPrice: 329.99,
    category: 'Audio & Tech',
    brand: 'AuraSound',
    rating: 4.9,
    reviewCount: 142,
    stock: 28,
    badge: 'Best Seller',
    isFeatured: true,
    isNewArrival: false,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80'
    ],
    features: [
      'Active Hybrid Noise Cancellation (up to -45dB)',
      '40-hour Battery Life with Fast Charge',
      'High-Resolution Lossless Audio via Bluetooth 5.3 & LDAC',
      'Multipoint dual-device pairing',
      'Plush memory foam magnetic ear cushions'
    ],
    specs: {
      'Driver Size': '40mm Titanium Planar',
      'Frequency Response': '10Hz - 40,000Hz',
      'Weight': '255g',
      'Bluetooth Version': '5.3 with multipoint',
      'Charging Time': '1.5 hours'
    },
    tags: ['wireless', 'headphones', 'noise-cancelling', 'audio', 'bluetooth'],
    colors: ['Midnight Black', 'Silver Moon', 'Sandstone Gold'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_2',
    name: 'Precision Mech-Key Pro Mechanical Keyboard',
    slug: 'precision-mech-key-pro',
    description: 'Hot-swappable custom mechanical keyboard with CNC aluminum body, gasket mount, and south-facing RGB lighting.',
    fullDescription: 'Crafted for discerning typists, programmers, and creators. The Precision Mech-Key Pro features a solid 6063 anodized aluminum chassis, pre-lubed linear switches, sound-dampening acoustic foams, and seamless tri-mode connectivity (2.4GHz dongle, Bluetooth 5.1, and braided USB-C cable).',
    price: 139.50,
    originalPrice: 179.00,
    category: 'Desk & Office',
    brand: 'KeyCraft',
    rating: 4.8,
    reviewCount: 96,
    stock: 14,
    badge: 'Trending',
    isFeatured: true,
    isNewArrival: true,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80'
    ],
    features: [
      'Gasket mounted with five-layer noise dampening silicone',
      'Universal hot-swappable 3/5-pin PCB',
      'PBT double-shot non-shine keycaps',
      '4000mAh battery offering up to 200 hours of use',
      'QMK/VIA programmable macros and key remapping'
    ],
    specs: {
      'Layout': '75% Compact (84 keys)',
      'Switch Type': 'Pre-lubed Factory Linear (45g actuation)',
      'Connectivity': '2.4GHz, Bluetooth 5.1, Type-C',
      'Body Material': 'CNC 6063 Aluminum',
      'Weight': '1.2 kg'
    },
    tags: ['keyboard', 'mechanical', 'office', 'rgb', 'desk-setup'],
    colors: ['Space Gray', 'Chalk White', 'Matte Navy'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_3',
    name: 'Lumix Ergonomic Multi-Sensor Smartwatch 4',
    slug: 'lumix-ergonomic-smartwatch-4',
    description: 'AMOLED retina always-on display, sapphire glass, ECG heart monitoring, SPO2, dual-frequency GPS, and 14-day battery.',
    fullDescription: 'Your ultimate wellness and productivity companion. Track over 120 sports modes with real-time biometric telemetry, contactless NFC payments, voice assistant, sleep stage analysis with AI coaching, and 5ATM water resistance suitable for swimming.',
    price: 189.99,
    originalPrice: 229.99,
    category: 'Wearables',
    brand: 'Lumix Health',
    rating: 4.7,
    reviewCount: 88,
    stock: 35,
    badge: 'Staff Pick',
    isFeatured: true,
    isNewArrival: false,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1000&q=80'
    ],
    features: [
      '1.43” Ultra-bright AMOLED Retina Screen (1000 nits)',
      'Medical-grade ECG and Continuous SpO2 Monitoring',
      'Dual-Band Multi-Satellite GPS Navigation',
      'Water resistant to 50 meters (5 ATM)',
      'Fast wireless magnetic charging dock'
    ],
    specs: {
      'Display': '1.43-inch AMOLED (466x466 px)',
      'Battery': '420mAh (14 days typical use)',
      'Sensors': 'Optical HR, ECG, SpO2, Gyroscope, Barometer',
      'Water Rating': '5 ATM / 50m',
      'Compatibility': 'iOS & Android'
    },
    tags: ['smartwatch', 'fitness', 'wearables', 'health', 'gps'],
    colors: ['Obsidian Black', 'Titanium Silver', 'Forest Green'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_4',
    name: 'AeroGlide Ultra-Light Minimalist Ergonomic Mouse',
    slug: 'aeroglide-ultralight-ergonomic-mouse',
    description: '54g featherlight wireless mouse with 26,000 DPI optical sensor, optical switches, and 100% virgin PTFE feet.',
    fullDescription: 'Designed for effortless glide and zero wrist fatigue. Features the state-of-the-art PixArt 3395 optical sensor with sub-1ms wireless latency, 80 million click optical micro-switches, and a sculpted symmetrical palm grip suited for all hand sizes.',
    price: 79.99,
    originalPrice: 99.99,
    category: 'Desk & Office',
    brand: 'AeroGlide',
    rating: 4.85,
    reviewCount: 64,
    stock: 40,
    badge: 'Top Rated',
    isFeatured: false,
    isNewArrival: true,
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80'
    ],
    features: [
      'Ultra-lightweight 54-gram honeycomb-free solid shell',
      'PixArt 3395 Sensor (up to 26,000 DPI / 650 IPS)',
      'Optical switch triggers with 0.2ms response time',
      'Nordic 52840 MCU for uninterrupted 1000Hz polling',
      'Flexible paracord Type-C charging cable included'
    ],
    specs: {
      'DPI': '100 - 26,000 Adjustable',
      'Battery Life': 'Up to 90 hours',
      'Weight': '54 grams',
      'Connection': '2.4GHz Wireless / USB-C Wired',
      'Feet': '100% Pure Grade PTFE'
    },
    tags: ['mouse', 'gaming', 'ergonomic', 'office', 'wireless'],
    colors: ['Pure White', 'Stealth Matte Black'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_5',
    name: 'Solaris 4K UHD Ultra-Wide Curved Monitor 34"',
    slug: 'solaris-4k-ultrawide-curved-monitor',
    description: '34-inch 165Hz IPS curved display, HDR400, 99% DCI-P3 color gamut, and 90W USB-C single-cable power delivery.',
    fullDescription: 'Elevate your visual workspace and immersive gaming. With 3440 x 1440 resolution, 1900R curvature matching human eye curvature, integrated KVM switch to control two PCs with one keyboard/mouse, and built-in studio stereo speakers.',
    price: 499.00,
    originalPrice: 620.00,
    category: 'Audio & Tech',
    brand: 'Solaris Display',
    rating: 4.9,
    reviewCount: 52,
    stock: 9,
    badge: 'Deal of the Day',
    isFeatured: true,
    isNewArrival: false,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1000&q=80'
    ],
    features: [
      '34" UWQHD (3440 x 1440) 21:9 Curved IPS Panel',
      '165Hz Refresh Rate with 1ms GtG Response',
      'USB-C 90W Power Delivery Hub with Ethernet and 4x USB-A',
      'Built-in Dual 5W Waves MaxxAudio Speakers',
      'Height, Tilt & Swivel adjustable heavy-duty stand'
    ],
    specs: {
      'Resolution': '3440 x 1440 (UWQHD)',
      'Refresh Rate': '165Hz',
      'Curvature': '1900R',
      'Color Gamut': '99% sRGB / 95% DCI-P3',
      'Ports': '1x DP 1.4, 2x HDMI 2.1, 1x USB-C (90W PD)'
    },
    tags: ['monitor', 'curved', '4k', 'display', 'workspace'],
    colors: ['Deep Silver & Black'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_6',
    name: 'Terra Leather Artisan Laptop Messenger Bag',
    slug: 'terra-artisan-leather-laptop-bag',
    description: 'Handcrafted full-grain Italian leather bag with dedicated 16-inch padded laptop sleeve, brass hardware, and luggage strap.',
    fullDescription: 'A timeless carryall constructed from vegetable-tanned full-grain leather that patinas beautifully over time. Features water-resistant canvas lining, quick-access magnetic closures, reinforced top handle, and detachable padded shoulder strap.',
    price: 165.00,
    originalPrice: 210.00,
    category: 'Lifestyle & Bags',
    brand: 'Terra Studio',
    rating: 4.95,
    reviewCount: 110,
    stock: 18,
    badge: 'Handcrafted',
    isFeatured: false,
    isNewArrival: true,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
    ],
    features: [
      '100% Genuine Full-Grain Vegetable-Tanned Leather',
      'Shock-absorbing velvet padded 16" laptop compartment',
      'Solid antique brass buckle closures and YKK metal zippers',
      'Rear trolley strap for effortless airport travel',
      'Multiple organizer slots for pens, phone, passport, and tablet'
    ],
    specs: {
      'Dimensions': '40cm x 30cm x 11cm',
      'Weight': '1.3 kg',
      'Capacity': '15 Liters',
      'Material': 'Full-Grain Tuscan Cowhide',
      'Lining': 'Heavy-duty 12oz waxed cotton canvas'
    },
    tags: ['bag', 'leather', 'lifestyle', 'travel', 'accessories'],
    colors: ['Vintage Saddle Brown', 'Cognac Tan', 'Midnight Charcoal'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_7',
    name: 'AuraSound Neo Wireless Earbuds Pro',
    slug: 'aurasound-neo-wireless-earbuds-pro',
    description: 'True wireless spatial earbuds with active wind noise cancellation, wireless QI charging case, and IPX7 waterproofing.',
    fullDescription: 'Pristine sound packed into an ultra-compact ergonomic profile. With 6 beamforming microphones for crystal-clear phone calls, dynamic bass boost EQ, and seamless touch controls.',
    price: 119.00,
    originalPrice: 159.00,
    category: 'Audio & Tech',
    brand: 'AuraSound',
    rating: 4.75,
    reviewCount: 79,
    stock: 50,
    badge: 'Popular',
    isFeatured: true,
    isNewArrival: false,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80'
    ],
    features: [
      'Custom 11mm Graphene Drivers with Deep Bass',
      '32 Hours Total Playtime (8h in buds + 24h in case)',
      'IPX7 Sweat & Waterproof for intense workouts',
      'Qi Wireless Charging & Quick USB-C charge',
      'Low latency gaming mode (48ms)'
    ],
    specs: {
      'Bluetooth': 'Version 5.3',
      'Waterproof Rating': 'IPX7',
      'Battery': '8 hrs (buds) / 32 hrs (case)',
      'Weight': '4.2g per earbud',
      'Charging': 'Qi Wireless + Type-C'
    },
    tags: ['earbuds', 'wireless', 'audio', 'waterproof', 'bluetooth'],
    colors: ['Onyx Black', 'Glacier White'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_8',
    name: 'AuraDesk Solid Walnut Height-Adjustable Standing Desk',
    slug: 'auradesk-solid-walnut-standing-desk',
    description: 'Dual-motor electric standing desk with solid American walnut tabletop, anti-collision sensor, and 4 memory presets.',
    fullDescription: 'Upgrade your posture and everyday focus. Featuring heavy-duty dual electric motors lifting up to 130kg silently (under 45dB), an intuitive LED control keypad with USB charging port, and integrated wire management tray.',
    price: 389.00,
    originalPrice: 489.00,
    category: 'Desk & Office',
    brand: 'AuraDesk',
    rating: 4.9,
    reviewCount: 38,
    stock: 12,
    badge: 'Premium',
    isFeatured: false,
    isNewArrival: false,
    images: [
      'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80'
    ],
    features: [
      'Solid 25mm Sustainably Harvested American Walnut Top',
      'Dual-Motor Ultra-Smooth Lift System (35mm/s)',
      'Digital Touch Screen with 4 Height Memory Presets',
      'Integrated Under-Desk Cable Management Spine',
      'Child Safety Lock and Gyroscopic Anti-Collision'
    ],
    specs: {
      'Tabletop Dimensions': '140cm x 70cm x 2.5cm',
      'Height Range': '62cm to 128cm',
      'Weight Capacity': '130 kg (286 lbs)',
      'Motor Sound Level': '< 45 dB',
      'Warranty': '5-Year Frame & Motor Warranty'
    },
    tags: ['desk', 'standing-desk', 'office', 'furniture', 'ergonomic'],
    colors: ['American Walnut', 'Natural Oak', 'Smoked Ash'],
    createdAt: new Date().toISOString()
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    discountPercent: 10,
    minOrderValue: 50,
    maxDiscount: 50,
    description: '10% off on orders above $50',
    isActive: true
  },
  {
    code: 'AURA20',
    discountPercent: 20,
    minOrderValue: 150,
    maxDiscount: 80,
    description: '20% off on premium orders above $150',
    isActive: true
  },
  {
    code: 'FREESHIP',
    discountPercent: 5,
    minOrderValue: 30,
    maxDiscount: 20,
    description: 'Extra 5% off + discount helper',
    isActive: true
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'user_demo_1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    ...hashPassword('password123', 'salt_jane_doe_123'),
    role: 'user',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zipCode: '97477',
      country: 'United States'
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user_demo_admin',
    name: 'Alex Rivera (Admin)',
    email: 'admin@auracommerce.com',
    ...hashPassword('admin123', 'salt_admin_alex_999'),
    role: 'admin',
    phone: '+1 (555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    address: {
      street: '100 Silicon Way, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'United States'
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    productId: 'prod_1',
    userId: 'user_demo_1',
    userName: 'Jane Doe',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    title: 'Unbelievable sound clarity and comfort!',
    comment: 'The noise cancellation completely blocks out my busy office sounds. Battery lasts for days without needing a recharge. Highly recommended!',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev_2',
    productId: 'prod_1',
    userId: 'user_rev_2',
    userName: 'Michael Chang',
    rating: 5,
    title: 'Better than other big brands',
    comment: 'Spatial audio is incredibly immersive while watching movies and producing music. Memory foam pads stay comfortable even with glasses.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev_3',
    productId: 'prod_2',
    userId: 'user_demo_1',
    userName: 'Jane Doe',
    rating: 5,
    title: 'The gasket mount typing experience is pure joy',
    comment: 'Sounds like soft raindrops. The switches are factory lubed and there is zero ping. The CNC aluminum body feels super premium.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    orderNumber: 'AC-89241',
    userId: 'user_demo_1',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerPhone: '+1 (555) 234-5678',
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zipCode: '97477',
      country: 'United States'
    },
    shippingMethod: {
      id: 'ship_express',
      name: 'Express 2-Day Air Courier',
      price: 9.99,
      estimatedDays: '1-2 business days'
    },
    paymentMethod: {
      type: 'card',
      lastFour: '4242',
      cardBrand: 'Visa'
    },
    items: [
      {
        productId: 'prod_1',
        name: 'Aura Studio Wireless Noise-Cancelling Headphones',
        price: 249.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
        selectedColor: 'Midnight Black'
      }
    ],
    subtotal: 249.99,
    shippingFee: 9.99,
    tax: 20.00,
    discount: 25.00,
    couponCode: 'WELCOME10',
    total: 254.98,
    status: 'shipped',
    trackingNumber: 'TRK-984321789',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      {
        status: 'order_placed',
        title: 'Order Placed & Confirmed',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString(),
        completed: true
      },
      {
        status: 'payment_confirmed',
        title: 'Payment Verified ($254.98 via Visa •••• 4242)',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toLocaleString(),
        completed: true
      },
      {
        status: 'processing',
        title: 'Packed & Quality Inspected at Fulfillment Center',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString(),
        completed: true
      },
      {
        status: 'shipped',
        title: 'In Transit with Express Courier (Carrier: FedEx / TRK-984321789)',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString(),
        completed: true
      },
      {
        status: 'delivered',
        title: 'Out for Final Delivery',
        timestamp: 'Estimated ' + new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: false
      }
    ]
  }
];

class DatabaseStore {
  private data: DatabaseSchema;
  private initialized = false;

  constructor() {
    this.data = {
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      coupons: INITIAL_COUPONS,
      cartSessions: {}
    };
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || INITIAL_USERS,
          products: parsed.products || INITIAL_PRODUCTS,
          orders: parsed.orders || INITIAL_ORDERS,
          reviews: parsed.reviews || INITIAL_REVIEWS,
          coupons: parsed.coupons || INITIAL_COUPONS,
          cartSessions: parsed.cartSessions || {}
        };
      } else {
        this.save();
      }
      this.initialized = true;
    } catch (err) {
      console.error('Failed to load database file, using in-memory state:', err);
    }
  }

  private save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: 'user_' + crypto.randomBytes(6).toString('hex'),
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Products
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.slug === id);
  }

  updateProductStock(id: string, delta: number): boolean {
    const p = this.data.products.find(prod => prod.id === id);
    if (!p) return false;
    if (p.stock + delta < 0) return false;
    p.stock += delta;
    this.save();
    return true;
  }

  // Reviews
  getReviewsByProductId(productId: string): Review[] {
    return this.data.reviews.filter(r => r.productId === productId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const newRev: Review = {
      ...review,
      id: 'rev_' + crypto.randomBytes(5).toString('hex'),
      createdAt: new Date().toISOString()
    };
    this.data.reviews.push(newRev);

    // Recalculate product rating and count
    const prod = this.data.products.find(p => p.id === review.productId);
    if (prod) {
      const allProductReviews = this.data.reviews.filter(r => r.productId === review.productId);
      const totalScore = allProductReviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = Number((totalScore / allProductReviews.length).toFixed(1));
      prod.reviewCount = allProductReviews.length;
    }

    this.save();
    return newRev;
  }

  // Coupons
  getCoupon(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  }

  // Cart
  getCart(sessionId: string): CartItem[] {
    return this.data.cartSessions[sessionId] || [];
  }

  saveCart(sessionId: string, items: CartItem[]): CartItem[] {
    this.data.cartSessions[sessionId] = items;
    this.save();
    return items;
  }

  // Orders
  getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingNumber' | 'timeline'>): Order {
    const orderNumber = 'AC-' + Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = 'TRK-' + Math.floor(100000000 + Math.random() * 900000000);
    const now = new Date();

    const newOrder: Order = {
      ...orderData,
      id: 'ord_' + crypto.randomBytes(6).toString('hex'),
      orderNumber,
      trackingNumber,
      createdAt: now.toISOString(),
      timeline: [
        {
          status: 'order_placed',
          title: 'Order Placed & Confirmed',
          timestamp: now.toLocaleString(),
          completed: true
        },
        {
          status: 'payment_confirmed',
          title: `Payment Received ($${orderData.total.toFixed(2)} via ${orderData.paymentMethod.type.toUpperCase()}${orderData.paymentMethod.lastFour ? ' •••• ' + orderData.paymentMethod.lastFour : ''})`,
          timestamp: new Date(now.getTime() + 1000).toLocaleString(),
          completed: true
        },
        {
          status: 'processing',
          title: 'Sent to Fulfillment Warehouse for Packaging',
          timestamp: 'In progress',
          completed: false
        },
        {
          status: 'shipped',
          title: `Carrier Pickup Scheduled (${orderData.shippingMethod.name})`,
          timestamp: 'Pending dispatch',
          completed: false
        },
        {
          status: 'delivered',
          title: 'Delivered to Customer Doorstep',
          timestamp: `Estimated: ${orderData.estimatedDelivery}`,
          completed: false
        }
      ]
    };

    // Decrement stock for ordered items
    for (const item of orderData.items) {
      this.updateProductStock(item.productId, -item.quantity);
    }

    this.data.orders.push(newOrder);
    this.save();
    return newOrder;
  }

  cancelOrder(id: string): Order | undefined {
    const order = this.data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return undefined;
    if (order.status === 'delivered') return undefined;

    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      title: 'Order Cancelled & Refund Initiated',
      timestamp: new Date().toLocaleString(),
      completed: true
    });

    // Restore stock
    for (const item of order.items) {
      this.updateProductStock(item.productId, item.quantity);
    }

    this.save();
    return order;
  }

  resetDatabase() {
    this.data = {
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      coupons: INITIAL_COUPONS,
      cartSessions: {}
    };
    this.save();
  }
}

export const db = new DatabaseStore();
