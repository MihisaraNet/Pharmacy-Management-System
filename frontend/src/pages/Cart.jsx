import { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ShoppingCart, Package, MapPin, User, Trash2, Plus, Minus } from 'lucide-react';

export default function Cart() {
  const { items, updateQty, removeItem, clear } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i.medicine.price) * i.quantity), 0),
    [items]
  );

  // ✅ FIXED: Checkout function with correct payload format
  const checkout = async () => {
    if (!user) {
      return alert('Please login first to place an order');
    }

    if (items.length === 0) {
      return alert('Your cart is empty');
    }

    if (!address.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🛒 Starting checkout process...');
      console.log('Cart items:', items);
      
      // ✅ FIXED: Format payload correctly for backend
      const payload = {
        medicineIds: items.map(i => i.medicine.id),
        quantities: items.map(i => i.quantity)
      };
      
      console.log('📦 Sending payload to backend:', payload);
      
      // Send sale creation request
      const response = await api.post('/api/sales', payload);
      console.log('✅ Sale created successfully:', response.data);
      
      // If delivery address is provided, create delivery record
      if (address.trim()) {
        try {
          const deliveryPayload = {
            saleId: response.data.id,
            address: address.trim(),
            status: 'PENDING'
          };
          
          console.log('🚚 Creating delivery record:', deliveryPayload);
          await api.post('/api/deliveries', deliveryPayload);
          console.log('✅ Delivery record created successfully');
        } catch (deliveryError) {
          console.warn('⚠️ Sale created but delivery record failed:', deliveryError);
          // Don't fail the entire checkout if delivery creation fails
        }
      }
      
      alert('Order placed successfully! You will receive a confirmation soon.');
      clear(); // Clear the cart
      setAddress(''); // Clear address
      
    } catch (e) {
      console.error('❌ Checkout error:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      
      let errorMessage = 'Checkout failed. Please try again.';
      
      if (e.response?.status === 401) {
        errorMessage = 'Please login again to place an order.';
      } else if (e.response?.status === 400) {
        errorMessage = e.response?.data?.message || 'Invalid order data. Please check your cart.';
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-pastel-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pastel-blue-400 to-pastel-lavender-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-pastel-lg">
              <ShoppingCart className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8 font-medium">Add some medicines to get started with your order.</p>
            <a 
              href="/browse" 
              className="btn-pastel-primary px-6 py-3 rounded-2xl font-semibold"
            >
              Browse Medicines
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pastel-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pastel-blue-400 to-pastel-lavender-400 rounded-3xl flex items-center justify-center mr-6 shadow-pastel-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent">Shopping Cart</h1>
              <p className="text-gray-600 mt-2 font-medium">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="card-pastel mb-8">
          <div className="bg-gradient-to-r from-pastel-blue-50 to-pastel-lavender-50 px-6 py-4 rounded-t-3xl border-b border-pastel-blue-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-pastel-blue-500" />
              Cart Items
            </h2>
          </div>
          <div className="divide-y divide-pastel-blue-100">
            {items.map((item, index) => (
              <div key={item.medicine.id} className="p-6 hover:bg-pastel-blue-50/50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pastel-blue-400 to-pastel-lavender-400 rounded-xl flex items-center justify-center shadow-pastel">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.medicine.name}</h3>
                      <p className="text-sm text-gray-600">{item.medicine.category || 'General'}</p>
                      <p className="text-sm font-medium bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent">Rs. {Number(item.medicine.price).toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Quantity Input */}
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => updateQty(item.medicine.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-full bg-pastel-blue-100 text-pastel-blue-600 flex items-center justify-center hover:bg-pastel-blue-200 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQty(item.medicine.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-pastel-blue-100 text-pastel-blue-600 flex items-center justify-center hover:bg-pastel-blue-200 transition-colors"
                        disabled={item.quantity >= item.medicine.quantity}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-lg font-bold bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent">
                        Rs. {(Number(item.medicine.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.medicine.id)}
                      className="p-2 text-pastel-pink-500 hover:text-pastel-pink-700 hover:bg-pastel-pink-100 rounded-lg transition-colors duration-200"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Checkout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivery Address */}
          <div className="card-pastel p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pastel-blue-500" />
              Delivery Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Delivery Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete delivery address including street, city, and postal code..."
                  rows="4"
                  className="input-pastel w-full resize-none"
                  required
                />
              </div>

              {!user && (
                <div className="bg-pastel-yellow-50 border border-pastel-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-pastel-yellow-500">⚠️</span>
                    <p className="text-sm text-pastel-yellow-800">
                      Please <a href="/login" className="font-medium underline text-pastel-blue-600">login</a> to place an order.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card-pastel p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-pastel-blue-500" />
              Order Summary
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items ({items.length})</span>
                <span className="font-medium">Rs. {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-pastel-mint-600">FREE</span>
              </div>
              <div className="border-t border-pastel-blue-100"></div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent">Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              disabled={loading || !user || !address.trim()}
              className={`btn-pastel-primary w-full py-4 px-6 rounded-2xl font-semibold text-lg ${
                loading || !user || !address.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Place Order - Rs. ${total.toFixed(2)}`
              )}
            </button>

            {!user && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Please login to complete your order
              </p>
            )}

            <button
              onClick={clear}
              className="btn-pastel-secondary w-full mt-3 py-3 px-6 rounded-2xl font-semibold"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
