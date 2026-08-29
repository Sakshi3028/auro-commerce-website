import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Shield,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
  Share2,
  Heart
} from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct
}) => {
  const { addToCart, openCheckout } = useCart();
  const { user, openAuthModal } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Review Form State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors?.[0] || '');
      setQuantity(1);
      setIsWritingReview(false);
      setReviewSuccess(false);

      // Fetch fresh details, reviews & related
      setLoadingReviews(true);
      api.getProduct(product.id)
        .then(res => {
          setReviews(res.reviews || []);
          setRelatedProducts(res.related || []);
        })
        .catch(err => {
          console.error('Failed to load product details:', err);
        })
        .finally(() => {
          setLoadingReviews(false);
        });
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor);
    onClose();
    openCheckout();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await api.addReview(product.id, {
        rating: newRating,
        title: reviewTitle,
        comment: reviewComment,
        userName: user?.name || 'Customer'
      });
      setReviews(prev => [res.review, ...prev]);
      setReviewTitle('');
      setReviewComment('');
      setIsWritingReview(false);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div
      id="product-detail-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
    >
      <div
        id="product-detail-modal-card"
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-indigo-600 font-bold uppercase">{product.category}</span>
            <span>/</span>
            <span className="text-slate-700">{product.brand}</span>
          </div>

          <button
            id="close-product-detail-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-10">
          
          {/* Main Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Left Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.name} preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Product Buy Box */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {product.brand}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({reviews.length || product.reviewCount} customer reviews)</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif] leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price & Savings */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-base text-slate-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">Taxes calculated at checkout</span>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in Stock & Ready to Ship` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.fullDescription || product.description}
              </p>

              {/* Color Options */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Finish / Color: <span className="text-indigo-600">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(col => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          selectedColor === col
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Add to Cart */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    id="modal-add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-yellow-300" />
                    <span>Add {quantity > 1 ? `${quantity} Items` : ''} to Cart</span>
                  </button>
                </div>

                {/* Instant Buy Now Button */}
                <button
                  id="modal-buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 text-white font-black text-xs sm:text-sm uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>Instant Checkout</span>
                </button>

                {addedToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Added {quantity}x "{product.name}" to your cart!</span>
                  </div>
                )}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/80 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Free Express &gt;$100</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30-Day Hassle Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Official 2-Yr Warranty</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features & Specs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Key Highlights &amp; Features</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-700">
                {product.features?.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications Table */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Technical Specifications
              </h3>
              <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                {Object.entries(product.specs || {}).map(([key, value]) => (
                  <div key={key} className="flex py-2.5 px-4 bg-white even:bg-slate-50/50">
                    <span className="w-1/2 font-semibold text-slate-500">{key}</span>
                    <span className="w-1/2 text-slate-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-6 pt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <span>Customer Reviews &amp; Ratings</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified feedback from actual owners
                </p>
              </div>

              {!isWritingReview && (
                <button
                  id="open-write-review-btn"
                  onClick={() => setIsWritingReview(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* Write Review Form */}
            {isWritingReview && (
              <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">Share Your Experience</h4>
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${star <= newRating ? 'fill-current' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-800">{newRating} of 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Headline / Title</label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value)}
                    placeholder="e.g. Exceptional sound quality and craftsmanship!"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Review Details</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="What did you like or dislike? How does it perform in your daily routine?"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            )}

            {reviewSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Thank you! Your verified review has been published.</span>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-900">{rev.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No customer reviews yet. Be the first to review this product!
                </div>
              )}
            </div>
          </div>

          {/* Related Products Carousel */}
          {relatedProducts.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                You May Also Like
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct(rel)}
                    className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/80 hover:border-indigo-400 transition cursor-pointer group"
                  >
                    <img src={rel.images[0]} alt={rel.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                    <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600">{rel.name}</h5>
                    <div className="text-xs font-extrabold text-slate-900 mt-1">${rel.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
