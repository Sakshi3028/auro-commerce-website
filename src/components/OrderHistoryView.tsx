import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Printer,
  ChevronRight,
  Search,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface OrderHistoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrderReceipt: (order: Order) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  isOpen,
  onClose,
  onSelectOrderReceipt
}) => {
  const { user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailLookup, setEmailLookup] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchOrders = async (email?: string) => {
    setLoading(true);
    try {
      const data = await api.getOrders(email);
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders(user?.email);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order and restore stock?')) return;
    setCancellingId(orderId);
    try {
      const res = await api.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div
      id="order-history-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        id="order-history-modal-container"
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-indigo-100 flex items-center justify-between bg-indigo-600 text-white sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-yellow-400 text-indigo-950 flex items-center justify-center font-black shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base uppercase tracking-tight text-white font-['Outfit',sans-serif]">
                Order Management &amp; Tracking
              </h2>
              <span className="text-xs text-indigo-200 font-bold">Real-time fulfillment and shipment dispatch</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(user?.email || emailLookup)}
              className="p-2 text-indigo-200 hover:text-white rounded-xl hover:bg-indigo-700/80 transition cursor-pointer"
              title="Refresh orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="close-order-history-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-indigo-700/80 hover:bg-indigo-800 text-indigo-200 hover:text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Search Banner for guest customers */}
        {!user && (
          <div className="bg-indigo-50/70 p-4 border-b border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-900">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Looking for orders placed as a guest?</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter checkout email..."
                value={emailLookup}
                onChange={e => setEmailLookup(e.target.value)}
                className="bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => fetchOrders(emailLookup)}
                className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Order List Column */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Orders ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 space-y-2">
                <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-xs text-slate-800">No past orders found</h4>
                <p className="text-[11px] text-slate-500">Sign in or place your first order through checkout.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {orders.map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 font-mono">{order.orderNumber}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'shipped'
                            ? 'bg-indigo-100 text-indigo-800'
                            : order.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="font-bold text-slate-900">${order.total.toFixed(2)}</span>
                      </div>

                      <div className="text-[11px] text-slate-600 truncate">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Order Detail Column */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
            {selectedOrder ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-slate-900 font-['Outfit',sans-serif]">
                        {selectedOrder.orderNumber}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        selectedOrder.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedOrder.status === 'shipped'
                          ? 'bg-indigo-100 text-indigo-800'
                          : selectedOrder.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString()} &bull; {selectedOrder.customerEmail}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectOrderReceipt(selectedOrder)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition"
                    >
                      Receipt
                    </button>
                    {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        disabled={cancellingId === selectedOrder.id}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
                      >
                        {cancellingId === selectedOrder.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-indigo-600" />
                      Carrier Tracking: {selectedOrder.trackingNumber}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Est. Arrival: {selectedOrder.estimatedDelivery}
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {selectedOrder.timeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          {step.completed ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</div>
                          <div className="text-[10px] text-slate-400">{step.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">Deliver To</span>
                    <p className="font-semibold text-slate-900">{selectedOrder.customerName}</p>
                    <p className="text-slate-600 text-[11px]">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-slate-600 text-[11px]">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">Payment Method</span>
                    <p className="font-semibold text-slate-900 uppercase">{selectedOrder.paymentMethod.type}</p>
                    {selectedOrder.paymentMethod.lastFour && (
                      <p className="text-slate-600 text-[11px]">Card ending in {selectedOrder.paymentMethod.lastFour}</p>
                    )}
                    <p className="text-indigo-600 font-bold text-xs mt-1">Total: ${selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-500 text-[10px] uppercase block">Ordered Items</span>
                  <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center gap-3 text-xs">
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                          <div className="text-[10px] text-slate-400">Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}</div>
                        </div>
                        <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-xs text-slate-400">
                Select an order from the list to view live tracking details and receipt breakdown.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
