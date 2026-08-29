import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Printer,
  Calendar,
  MapPin,
  CreditCard,
  Download
} from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders
}) => {
  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.warn('Confetti effect skipped:', err);
      }
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="order-success-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        id="order-success-modal-card"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col animate-in zoom-in-95"
      >
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold font-['Outfit',sans-serif]">
            Thank you! Order Confirmed
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Your payment was authorized. We've sent an email receipt to <strong className="text-white">{order.customerEmail}</strong>.
          </p>

          <div className="mt-4 inline-flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono">
            <span>Order Reference:</span>
            <strong className="text-white font-bold">{order.orderNumber}</strong>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Tracking & Timeline Tracker */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900">Shipment Status &amp; Tracking</span>
              </div>
              <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                {order.trackingNumber}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {step.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>{step.title}</div>
                    <div className="text-[11px] text-slate-400">{step.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Shipping Address</span>
              </div>
              <p className="font-semibold text-slate-800">{order.customerName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p className="text-slate-500">{order.shippingAddress.country}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Estimated Arrival</span>
              </div>
              <p className="font-bold text-emerald-600 text-sm">{order.estimatedDelivery}</p>
              <p className="text-slate-500 text-[11px]">{order.shippingMethod.name}</p>
              
              <div className="pt-2 flex items-center gap-1 text-slate-600">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Paid via {order.paymentMethod.type.toUpperCase()} {order.paymentMethod.lastFour ? `(•••• ${order.paymentMethod.lastFour})` : ''}</span>
              </div>
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Itemized Summary</h4>
            <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-400">Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}</div>
                  </div>
                  <span className="font-bold text-slate-900 font-['Outfit',sans-serif]">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Total Math */}
            <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({order.couponCode})</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-200 pt-2">
                <span>Grand Total</span>
                <span className="text-base text-indigo-600 font-['Outfit',sans-serif]">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewOrders();
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <span>View Order Status</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
