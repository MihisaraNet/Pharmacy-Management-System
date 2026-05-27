import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { Search, Tag, Grid, List, ShoppingCart, Package, Calendar, Pill } from 'lucide-react';

export default function Browse(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [visibleItems, setVisibleItems] = useState(8);
  const observerRef = useRef(null);
  const { addItem } = useCart();

  useEffect(()=>{ load(); },[]);
  const load = async ()=>{
    try {
      setLoading(true);
      const {data} = await api.get('/api/medicines', { params:{ availableOnly: true } });
      setList(data);
    } catch (error) {
      console.error('Failed to load medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = list
    .filter(m =>
      (!q || m.name.toLowerCase().includes(q.toLowerCase())) &&
      (!cat || (m.category||'').toLowerCase().includes(cat.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'quantity':
          return b.quantity - a.quantity;
        case 'expiry':
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const displayedItems = filtered.slice(0, visibleItems);
  const hasMoreItems = filtered.length > visibleItems;

  const handleAddToCart = (medicine) => {
    addItem(medicine);
    toast.success(`✅ ${medicine.name} added to cart!`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const loadMore = () => {
    setVisibleItems(prev => prev + 8);
  };

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreItems) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMoreItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pastel-gradient flex items-center justify-center">
        <div className="text-center card-pastel p-8 animate-fade-in">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pastel-blue-200 border-t-pastel-blue-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pastel-lavender-400 animate-spin animation-delay-75"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">Loading medicines...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-pastel-blue-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-pastel-lavender-400 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-3 h-3 bg-pastel-mint-400 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pastel-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pastel-blue-400 to-pastel-lavender-400 rounded-3xl flex items-center justify-center mr-6 shadow-pastel-lg hover:scale-110 transition-transform duration-300">
              <Pill className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent">Browse Medicines</h1>
              <p className="text-gray-600 mt-3 font-medium">Find and purchase quality medicines</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card-pastel p-6 mb-8 hover:shadow-pastel-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4 lg:mb-0">
              <Search className="w-5 h-5 text-pastel-blue-500 mr-2" />
              Search & Filter
            </h2>
            <div className="flex items-center space-x-4">
              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-pastel text-sm"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="quantity">Stock Level</option>
                  <option value="expiry">Expiry Date</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-pastel-blue-50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-pastel-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-pastel-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
              <div className="relative">
                <input
                  className="input-pastel w-full pl-10"
                  placeholder="e.g., Paracetamol, Amoxicillin..."
                  value={q}
                  onChange={e=>setQ(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-pastel-blue-400" />
                </div>
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="relative">
                <input
                  className="input-pastel w-full pl-10"
                  placeholder="e.g., Painkiller, Antibiotic..."
                  value={cat}
                  onChange={e=>setCat(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="w-5 h-5 text-pastel-lavender-400" />
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <div className="w-full card-pastel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Results</p>
                    <p className="text-2xl font-bold text-pastel-blue-600">{filtered.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-pastel-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {filtered.length > 0 && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-green-600">{displayedItems.length}</span> of{' '}
              <span className="font-semibold">{filtered.length}</span> medicines
              {q && <span> matching "<span className="font-medium">{q}</span>"</span>}
              {cat && <span> in category "<span className="font-medium">{cat}</span>"</span>}
            </p>
          </div>
        )}

        {/* Medicine Grid/List */}
        {displayedItems.length > 0 ? (
          <div className={`${viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }`}>
            {displayedItems.map((m, index) => (
              <div
                key={m.id}
                className={`card-pastel-hover transition-all duration-300 animate-fade-in ${
                  viewMode === 'list' ? 'flex items-center space-x-6 p-6' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Medicine Header */}
                <div className="p-6 border-b border-pastel-blue-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pastel-blue-400 to-pastel-lavender-400 rounded-xl flex items-center justify-center shadow-pastel">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      m.quantity === 0
                        ? 'bg-pastel-pink-100 text-pastel-pink-800'
                        : m.quantity < 10
                        ? 'bg-pastel-yellow-100 text-pastel-yellow-800'
                        : 'bg-pastel-mint-100 text-pastel-mint-800'
                    }`}>
                      {m.quantity === 0 ? 'Out of Stock' : m.quantity < 10 ? `Low: ${m.quantity}` : `In Stock`}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{m.name}</h3>

                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pastel-blue-100 text-pastel-blue-800">
                      {m.category || 'General'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent">
                      Rs. {Number(m.price).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      per unit
                    </div>
                  </div>
                </div>

                {/* Expiry Info */}
                <div className="px-6 py-3 bg-pastel-blue-50 rounded-b-2xl">
                  <div className="flex items-center text-sm">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      new Date(m.expiryDate) < new Date()
                        ? 'bg-pastel-pink-100 text-pastel-pink-800'
                        : new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ? 'bg-pastel-yellow-100 text-pastel-yellow-800'
                        : 'bg-pastel-mint-100 text-pastel-mint-800'
                    }`}>
                      {new Date(m.expiryDate) < new Date() ? (
                        <>
                          <Calendar className="w-3 h-3 mr-1" />
                          Expired
                        </>
                      ) : (
                        `Expires: ${new Date(m.expiryDate).toLocaleDateString()}`
                      )}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="p-6 pt-4">
                  <button
                    className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-200 ${
                      m.quantity === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'btn-pastel-primary hover:scale-105'
                    }`}
                    onClick={() => m.quantity > 0 && handleAddToCart(m)}
                    disabled={m.quantity === 0}
                  >
                    {m.quantity === 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <Package className="w-4 h-4" />
                        Out of Stock
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMoreItems && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="btn-pastel-secondary px-6 py-3 rounded-2xl font-semibold"
                >
                  Load More Medicines ({filtered.length - displayedItems.length} remaining)
                </button>
              </div>
            )}

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="h-10"></div>
          </div>
        ) : (
          <div className="card-pastel p-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-pastel-blue-400 to-pastel-lavender-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-pastel-lg animate-bounce">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No medicines found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all available medicines.</p>
            <button
              onClick={() => {setQ(''); setCat('');}}
              className="btn-pastel-primary px-6 py-3 rounded-2xl"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
