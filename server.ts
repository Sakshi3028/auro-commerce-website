import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword, verifyPassword, Product, CartItem } from './server/db.js';
import { authMiddleware, generateToken, requireAuth, AuthenticatedRequest } from './server/auth.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());
  app.use(authMiddleware);

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'AuraCommerce API' });
  });

  // ---------------- AUTH ROUTES ----------------
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { name, email, password, phone, address } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const existingUser = db.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }

      const { passwordHash, salt } = hashPassword(password);
      const newUser = db.createUser({
        name,
        email,
        passwordHash,
        salt,
        role: 'user',
        phone,
        address,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=200&q=80`
      });

      const token = generateToken(newUser);
      const { passwordHash: _, salt: __, ...userProfile } = newUser;

      res.status(201).json({
        message: 'Account created successfully!',
        token,
        user: userProfile
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Failed to create account.' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      const { passwordHash: _, salt: __, ...userProfile } = user;

      res.json({
        message: 'Signed in successfully!',
        token,
        user: userProfile
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Failed to log in.' });
    }
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { passwordHash: _, salt: __, ...userProfile } = req.user;
    res.json({ user: userProfile });
  });

  app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const { name, phone, address } = req.body;
      const updated = db.updateUser(req.user.id, {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address })
      });

      if (!updated) return res.status(404).json({ error: 'User not found' });
      const { passwordHash: _, salt: __, ...userProfile } = updated;
      res.json({ message: 'Profile updated successfully', user: userProfile });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Demo accounts helper to test easily
  app.get('/api/auth/demo-users', (req: Request, res: Response) => {
    const users = db.getUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar
    }));
    res.json(users);
  });

  // ---------------- PRODUCT ROUTES ----------------
  app.get('/api/products', (req: Request, res: Response) => {
    try {
      const {
        search,
        category,
        minPrice,
        maxPrice,
        sort,
        brand,
        inStock,
        tag,
        featured,
        page = '1',
        limit = '50'
      } = req.query;

      let products = db.getProducts();

      // Search filter
      if (search && typeof search === 'string') {
        const q = search.toLowerCase().trim();
        products = products.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      // Category filter
      if (category && typeof category === 'string' && category !== 'All') {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      // Brand filter
      if (brand && typeof brand === 'string' && brand !== 'All') {
        products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
      }

      // Tag filter
      if (tag && typeof tag === 'string') {
        products = products.filter(p => p.tags.includes(tag.toLowerCase()));
      }

      // Featured filter
      if (featured === 'true') {
        products = products.filter(p => p.isFeatured);
      }

      // Price filter
      if (minPrice) {
        const min = parseFloat(minPrice as string);
        if (!isNaN(min)) {
          products = products.filter(p => p.price >= min);
        }
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice as string);
        if (!isNaN(max)) {
          products = products.filter(p => p.price <= max);
        }
      }

      // Stock filter
      if (inStock === 'true') {
        products = products.filter(p => p.stock > 0);
      }

      // Sorting
      if (sort) {
        switch (sort) {
          case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            products.sort((a, b) => b.rating - a.rating);
            break;
          case 'popular':
            products.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
          case 'newest':
            products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          default:
            // Featured default
            products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        }
      }

      // Pagination
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;
      const total = products.length;
      const totalPages = Math.ceil(total / limitNum);
      const paginated = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      res.json({
        products: paginated,
        total,
        page: pageNum,
        totalPages,
        limit: limitNum
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Failed to fetch products.' });
    }
  });

  app.get('/api/products/categories', (req: Request, res: Response) => {
    const products = db.getProducts();
    const categoryMap: Record<string, number> = {};
    products.forEach(p => {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    });

    const categories = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count
    }));

    res.json(categories);
  });

  app.get('/api/products/featured', (req: Request, res: Response) => {
    const products = db.getProducts().filter(p => p.isFeatured || p.rating >= 4.8).slice(0, 6);
    res.json(products);
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const reviews = db.getReviewsByProductId(product.id);
    const related = db.getProducts()
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, 4);

    res.json({
      product,
      reviews,
      related
    });
  });

  app.post('/api/products/:id/reviews', (req: AuthenticatedRequest, res: Response) => {
    try {
      const product = db.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      const { rating, title, comment, userName } = req.body;
      if (!rating || !comment || !title) {
        return res.status(400).json({ error: 'Rating, title, and comment are required.' });
      }

      const reviewerName = req.user?.name || userName || 'Verified Buyer';
      const reviewerId = req.user?.id || 'guest_user';

      const review = db.addReview({
        productId: product.id,
        userId: reviewerId,
        userName: reviewerName,
        userAvatar: req.user?.avatar,
        rating: Math.min(5, Math.max(1, Number(rating))),
        title,
        comment,
        verifiedPurchase: true
      });

      res.status(201).json({ message: 'Review added successfully!', review });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add review.' });
    }
  });

  // ---------------- CART ROUTES ----------------
  app.get('/api/cart', (req: Request, res: Response) => {
    const sessionId = (req.query.sessionId as string) || 'default_session';
    const items = db.getCart(sessionId);
    
    // Enrich with current product details & live stock check
    const enriched = items.map(item => {
      const prod = db.getProductById(item.productId);
      return {
        ...item,
        product: prod || null
      };
    }).filter(item => item.product !== null);

    res.json(enriched);
  });

  app.post('/api/cart/sync', (req: Request, res: Response) => {
    const { sessionId, items } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required.' });
    }
    const saved = db.saveCart(sessionId, items || []);
    res.json({ message: 'Cart synced', items: saved });
  });

  // ---------------- COUPONS ----------------
  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code required.' });
    }

    const coupon = db.getCoupon(code);
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired promo code.' });
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    if (orderSubtotal < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Promo code requires a minimum order value of $${coupon.minOrderValue.toFixed(2)}.`
      });
    }

    const discountAmount = Math.min((orderSubtotal * coupon.discountPercent) / 100, coupon.maxDiscount);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        description: coupon.description,
        discountAmount: Number(discountAmount.toFixed(2))
      }
    });
  });

  // ---------------- ORDER PROCESSING ROUTES ----------------
  app.post('/api/orders', (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingMethod,
        paymentMethod,
        items,
        couponCode
      } = req.body;

      if (!customerName || !customerEmail || !shippingAddress || !items || !items.length) {
        return res.status(400).json({ error: 'Missing required order details.' });
      }

      // Validate products and stock
      const orderItems = [];
      let calculatedSubtotal = 0;

      for (const item of items) {
        const prod = db.getProductById(item.productId);
        if (!prod) {
          return res.status(400).json({ error: `Product with ID ${item.productId} not found.` });
        }
        if (prod.stock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for "${prod.name}". Only ${prod.stock} items remaining.`
          });
        }

        const itemTotal = prod.price * item.quantity;
        calculatedSubtotal += itemTotal;
        orderItems.push({
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: item.quantity,
          image: prod.images[0] || '',
          selectedColor: item.selectedColor
        });
      }

      // Calculate discounts
      let discount = 0;
      if (couponCode) {
        const coupon = db.getCoupon(couponCode);
        if (coupon && calculatedSubtotal >= coupon.minOrderValue) {
          discount = Math.min((calculatedSubtotal * coupon.discountPercent) / 100, coupon.maxDiscount);
        }
      }

      // Shipping & Tax
      const shippingFee = shippingMethod?.price !== undefined ? Number(shippingMethod.price) : (calculatedSubtotal > 100 ? 0 : 9.99);
      const tax = Number(((calculatedSubtotal - discount) * 0.08).toFixed(2));
      const total = Number((calculatedSubtotal - discount + shippingFee + tax).toFixed(2));

      // Estimated Delivery Date
      const deliveryDays = shippingMethod?.id === 'ship_overnight' ? 1 : shippingMethod?.id === 'ship_express' ? 2 : 4;
      const deliveryDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
      const estimatedDelivery = deliveryDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const newOrder = db.createOrder({
        userId: req.user?.id,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingMethod: shippingMethod || {
          id: 'ship_standard',
          name: 'Standard Ground Shipping',
          price: shippingFee,
          estimatedDays: '3-5 business days'
        },
        paymentMethod: paymentMethod || {
          type: 'card',
          lastFour: '4242',
          cardBrand: 'Visa'
        },
        items: orderItems,
        subtotal: Number(calculatedSubtotal.toFixed(2)),
        shippingFee,
        tax,
        discount: Number(discount.toFixed(2)),
        couponCode,
        total,
        status: 'processing',
        estimatedDelivery
      });

      res.status(201).json({
        message: 'Order created and processed successfully!',
        order: newOrder
      });
    } catch (err: any) {
      console.error('Order creation error:', err);
      res.status(500).json({ error: 'Failed to process order. Please try again.' });
    }
  });

  app.get('/api/orders', (req: AuthenticatedRequest, res: Response) => {
    try {
      const email = req.query.email as string;
      let orders;

      if (req.user) {
        orders = db.getOrders(req.user.id);
      } else if (email) {
        orders = db.getOrders().filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
      } else {
        // Return latest public/demo orders for inspection
        orders = db.getOrders().slice(0, 10);
      }

      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch orders.' });
    }
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  });

  app.patch('/api/orders/:id/cancel', (req: Request, res: Response) => {
    const order = db.cancelOrder(req.params.id);
    if (!order) {
      return res.status(400).json({ error: 'Order could not be cancelled or was not found.' });
    }
    res.json({ message: 'Order has been cancelled successfully.', order });
  });

  // Admin / Stats
  app.get('/api/stats', (req: Request, res: Response) => {
    const products = db.getProducts();
    const orders = db.getOrders();
    const users = db.getUsers();

    const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total : sum, 0);

    res.json({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      lowStockProducts: products.filter(p => p.stock < 15).length
    });
  });

  app.post('/api/system/reset-db', (req: Request, res: Response) => {
    db.resetDatabase();
    res.json({ message: 'Database reset to initial seed state.' });
  });

  // ----------------------------------------------------
  // Vite Middleware / Static Serving
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraCommerce Express Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
