import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  MapPin,
  Mail,
  User as UserIcon,
  Phone,
  DollarSign
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { ShippingMethod, Order } from '../types';

interface CheckoutModalProps {
  onOrderSuccess: (order: Order) => void;
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'ship_standard',
    name: 'Standard Ground Delivery',
    price: 0,
    estimatedDays: '3-5 business days'
  },
  {
    id: 'ship_express',
    name: 'Express 2-Day Air Priority',
    price: 9.99,
    estimatedDays: '1-2 business days'
  },
  {
    id: 'ship_overnight',
    name: 'Next-Day Priority Rush Delivery',
    price: 19.99,
    estimatedDays: 'Next business day by 10:30 AM'
  }
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onOrderSuccess }) => {
  const {
    items,
    subtotal,
    discount,
    appliedCoupon,
    isCheckoutOpen,
    closeCheckout,
    clearCart
  } = useCart();

  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Shipping Method
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(SHIPPING_METHODS[0]);

  // Payment State
  const [paymentType, setPaymentType] = useState<'card' | 'paypal' | 'cod' | 'applepay'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Prefill if user logged in
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '+1 (555) 234-5678');
      if (user.address) {
        setStreet(user.address.street || '742 Evergreen Terrace');
        setCity(user.address.city || 'Springfield');
        setState(user.address.state || 'OR');
        setZipCode(user.address.zipCode || '97477');
        setCountry(user.address.country || 'United States');
      }
    } else {
      // Default demo values for quick checkout convenience
      setCustomerName('Jane Doe');
      setCustomerEmail('jane@example.com');
      setCustomerPhone('+1 (555) 234-5678');
      setStreet('742 Evergreen Terrace');
      setCity('Springfield');
      setState('OR');
      setZipCode('97477');
    }
  }, [user, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  // Final Calculations
  const shippingFee = subtotal > 100 && selectedShipping.id === 'ship_standard' ? 0 : selectedShipping.price;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * 0.08).toFixed(2));
  const finalTotal = Number((taxableAmount + shippingFee + tax).toFixed(2));

  const handlePlaceOrder = async () => {
    if (!customerName || !customerEmail || !street || !city || !zipCode) {
      setErrorMessage('Please fill in all required contact and shipping details.');
      setStep(1);
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          street,
          city,
          state,
          zipCode,
          country
        },
        shippingMethod: {
          ...selectedShipping,
          price: shippingFee
        },
        paymentMethod: {
          type: paymentType,
          lastFour: paymentType === 'card' ? cardNumber.replace(/\D/g, '').slice(-4) || '4242' : undefined,
          cardBrand: paymentType === 'card' ? 'Visa' : undefined
        },
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedColor: i.selectedColor
        })),
        couponCode: appliedCoupon?.code
      };

      const res = await api.createOrder(orderPayload);
      clearCart();
      closeCheckout();
      onOrderSuccess(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please check item availability.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="checkout-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        id="checkout-modal-container"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-indigo-100 flex items-center justify-between bg-indigo-600 text-white sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-yellow-400 text-indigo-950 flex items-center justify-center font-black shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-base uppercase tracking-tight text-white font-['Outfit',sans-serif]">
                Secure Express Checkout
              </h2>
              <span className="text-xs text-indigo-200 font-semibold">256-Bit Encrypted Payment Flow</span>
            </div>
          </div>

          <button
            id="close-checkout-btn"
            onClick={closeCheckout}
            className="w-8 h-8 rounded-full bg-indigo-700/80 hover:bg-indigo-800 text-indigo-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between max-w-md mx-auto text-xs font-semibold">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1</span>
              <span>Shipping</span>
            </button>
            <div className={`flex-1 h-0.5 mx-3 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <button
              onClick={() => setStep(2)}
              className={`flex items-center gap-1.5 ${step >= 2 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2</span>
              <span>Delivery</span>
            </button>
            <div className={`flex-1 h-0.5 mx-3 ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <button
              onClick={() => setStep(3)}
              className={`flex items-center gap-1.5 ${step === 3 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>3</span>
              <span>Payment</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form Area */}
          <div className="lg:col-span-7 space-y-6">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* STEP 1: Shipping Details */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Customer &amp; Shipping Address</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerName('Jane Doe');
                      setCustomerEmail('jane@example.com');
                      setCustomerPhone('+1 (555) 234-5678');
                      setStreet('742 Evergreen Terrace');
                      setCity('Springfield');
                      setState('OR');
                      setZipCode('97477');
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Quick Autofill
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      id="checkout-name-input"
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      id="checkout-email-input"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                    <input
                      id="checkout-street-input"
                      type="text"
                      required
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      placeholder="742 Evergreen Terrace, Apt 4B"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      id="checkout-city-input"
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Springfield"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">State / Prov</label>
                      <input
                        id="checkout-state-input"
                        type="text"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        placeholder="OR"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Postal Code *</label>
                      <input
                        id="checkout-zip-input"
                        type="text"
                        required
                        value={zipCode}
                        onChange={e => setZipCode(e.target.value)}
                        placeholder="97477"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      id="checkout-phone-input"
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      aria-label="Country"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!customerName || !customerEmail || !street || !city || !zipCode) {
                        setErrorMessage('Please fill in all required fields.');
                        return;
                      }
                      setErrorMessage('');
                      setStep(2);
                    }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
                  >
                    <span>Continue to Delivery</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Shipping Speed */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Choose Shipping Speed</span>
                </h3>

                <div className="space-y-3">
                  {SHIPPING_METHODS.map(method => {
                    const isFree = subtotal > 100 && method.id === 'ship_standard';
                    const isSelected = selectedShipping.id === method.id;

                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedShipping(method)}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{method.name}</h4>
                            <p className="text-[11px] text-slate-500">{method.estimatedDays}</p>
                          </div>
                        </div>

                        <span className="text-xs font-extrabold text-slate-900">
                          {isFree || method.price === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${method.price.toFixed(2)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Select Payment Method</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('card')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      paymentType === 'card'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('paypal')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      paymentType === 'paypal'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>PayPal Express</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('applepay')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      paymentType === 'applepay'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Apple / Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('cod')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      paymentType === 'cod'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Cash on Delivery</span>
                  </button>
                </div>

                {/* Card Fields */}
                {paymentType === 'card' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                          TEST VISA
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Expiration Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">CVC / CVV</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          placeholder="123"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    id="confirm-place-order-btn"
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-98"
                  >
                    {submitting ? (
                      <span>Processing Order...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize &amp; Pay ${finalTotal.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Area */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Order Review ({items.length} items)
              </h4>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={`${item.productId}-${item.selectedColor}`} className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-slate-900 truncate">{item.product.name}</h5>
                      <span className="text-[11px] text-slate-500">Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-['Outfit',sans-serif]">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs border-t border-slate-200 pt-3 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Promo ({appliedCoupon?.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping ({selectedShipping.name.split(' ')[0]})</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Amount Due</span>
                <span className="text-lg text-indigo-600 font-['Outfit',sans-serif]">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Buyer Protection Guaranteed</span>
              </div>
              <p>Items eligible for 30-day hassle-free return and exchange.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
