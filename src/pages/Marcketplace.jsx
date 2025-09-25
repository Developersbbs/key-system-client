// components/CryptoMarketplace.jsx - Complete corrected version
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllListings, removeListing } from '../redux/features/listings/listingSlice';
import { addListing } from '../redux/features/listings/listingSlice'; 
import ListingFormModal from '../components/ListingFormModal';
import CryptoBuyModal from '../components/CryptoBuyModal';
import { Plus, User, Trash2, DollarSign, ShoppingCart, Search, Filter, BarChart3, TrendingUp, Bitcoin } from 'lucide-react';
import toast from 'react-hot-toast';

const CryptoMarketplace = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCrypto, setFilterCrypto] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const dispatch = useDispatch();
  const { listings, loading, error } = useSelector(state => state.listings);
  const { user, isLoggedIn } = useSelector(state => state.auth);

  const cryptoTypes = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'DOGE', 'MATIC', 'Other'];
  const categories = ['all', ...new Set(listings.map(item => item.category).filter(Boolean))];

  useEffect(() => {
    dispatch(fetchAllListings());
  }, [dispatch]);

  // Refresh listings periodically to show updated quantities
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchAllListings());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  // Add the missing handleAddListing function
  const handleAddListing = (listingData) => {
    dispatch(addListing(listingData)).unwrap()
      .then(() => {
        toast.success("Crypto listing posted successfully!");
        setIsModalOpen(false);
      })
      .catch((err) => {
        toast.error(err || 'Failed to create listing');
      });
  };

  // Add handleDelete function
  const handleDelete = (listingId, listingTitle) => {
    if (window.confirm(`Are you sure you want to delete "${listingTitle}"?`)) {
      dispatch(removeListing(listingId))
        .unwrap()
        .then(() => toast.success("Listing deleted successfully!"))
        .catch((err) => toast.error(err || 'Failed to delete listing'));
    }
  };

  const handleBuyClick = (listing) => {
    if (!isLoggedIn) {
      toast.error("Please login to buy cryptocurrencies");
      return;
    }

    // Check if listing has valid postedBy information
    if (!listing.postedBy) {
      toast.error("Seller information not available");
      return;
    }

    const sellerId = typeof listing.postedBy === 'object' 
      ? listing.postedBy._id 
      : listing.postedBy;

    if (!sellerId) {
      toast.error("Seller ID not available");
      return;
    }

    if (user._id === sellerId) {
      toast.error("You cannot buy your own listing");
      return;
    }

    if (listing.availableQuantity <= 0) {
      toast.error("This listing is sold out");
      return;
    }

    const normalizedListing = {
      ...listing,
      postedBy: {
        _id: sellerId,
        name: typeof listing.postedBy === 'object' 
          ? listing.postedBy.name 
          : 'Unknown Seller'
      }
    };

    setSelectedListing(normalizedListing);
    setBuyModalOpen(true);
  };

  const filteredListings = listings
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesCrypto = filterCrypto === 'all' || item.cryptoType === filterCrypto;
      return matchesSearch && matchesCategory && matchesCrypto;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'quantity-low') return a.availableQuantity - b.availableQuantity;
      if (sortBy === 'quantity-high') return b.availableQuantity - a.availableQuantity;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-500 text-lg">Error: {error}</p>
          <button 
            onClick={() => dispatch(fetchAllListings())}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bitcoin className="text-orange-500" size={48} />
            <h1 className="text-4xl font-bold text-gray-900">Crypto Marketplace</h1>
          </div>
          <p className="text-gray-600 text-lg">Buy and sell cryptocurrencies securely</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Listings</p>
                <h3 className="text-2xl font-bold text-green-800">{listings.length}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BarChart3 className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 text-sm font-medium">Available Crypto</p>
                <h3 className="text-2xl font-bold text-green-800">
                  {cryptoTypes.length} Types
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Bitcoin className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Active Sellers</p>
                <h3 className="text-2xl font-bold text-emerald-800">
                  {new Set(listings.map(l => l.postedBy?._id)).size}
                </h3>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <User className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <select 
              value={filterCrypto}
              onChange={(e) => setFilterCrypto(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Cryptocurrencies</option>
              {cryptoTypes.map(crypto => (
                <option key={crypto} value={crypto}>{crypto}</option>
              ))}
            </select>
            
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="quantity-high">Highest Quantity</option>
              <option value="quantity-low">Lowest Quantity</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {filteredListings.length} of {listings.length} listings
            </div>
            
            {isLoggedIn && (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
              >
                <Plus size={20} /> Sell Crypto
              </button>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Bitcoin className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new listing.</p>
            {isLoggedIn && (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create First Listing
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing) => {
              const isOwner = listing.postedBy && user?._id ? 
                (typeof listing.postedBy === 'object' ? listing.postedBy._id === user._id : listing.postedBy === user._id) : 
                false;

              return (
                <div key={listing._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-green-300 transform hover:-translate-y-2 hover:scale-[1.02] ring-1 ring-gray-100 hover:ring-green-200 backdrop-blur-sm relative before:absolute before:inset-0 before:bg-white/80 before:rounded-2xl before:-z-10">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          listing.cryptoType === 'BTC' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          listing.cryptoType === 'ETH' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                          listing.cryptoType === 'USDT' ? 'bg-green-100 text-green-800 border border-green-200' :
                          'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          <Bitcoin size={12} className="mr-1" />
                          {listing.cryptoType}
                        </span>
                        {listing.availableQuantity <= 0 && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full border border-red-200">
                            Sold Out
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Price Highlight */}
                    <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-100">
                      <div className="text-center">
                        <p className="text-sm text-green-600 font-medium mb-1">Price per {listing.cryptoType}</p>
                        <p className="text-3xl font-bold text-green-700">${listing.price}</p>
                      </div>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Available</p>
                        <p className="font-semibold text-green-600 text-sm">
                          {listing.availableQuantity} {listing.cryptoType}
                        </p>
                      </div>
                      
                      {listing.minPurchase ? (
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Min Purchase</p>
                          <p className="font-semibold text-gray-700 text-sm">
                            {listing.minPurchase} {listing.cryptoType}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Min Purchase</p>
                          <p className="font-semibold text-gray-700 text-sm">No Limit</p>
                        </div>
                      )}
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <User size={14} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Seller</p>
                          <p className="font-medium text-gray-800 text-sm">
                            {typeof listing.postedBy === 'object' ? listing.postedBy.name : 'Member'}
                          </p>
                        </div>
                      </div>
                      {isOwner && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          Your Listing
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {!isLoggedIn ? (
                        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-700 font-medium mb-2">Login Required</p>
                          <p className="text-xs text-yellow-600">Please login to purchase cryptocurrencies</p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBuyClick(listing)}
                            disabled={isOwner || listing.availableQuantity <= 0}
                            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                              listing.availableQuantity <= 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isOwner
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                            }`}
                          >
                            <ShoppingCart size={16} />
                            {listing.availableQuantity <= 0 ? 'Sold Out' : 
                             isOwner ? 'Your Listing' : 'Buy Now'}
                          </button>
                          
                          {isOwner && (
                            <button
                              onClick={() => handleDelete(listing._id, listing.title)}
                              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center hover:shadow-lg transform hover:scale-105"
                              title="Delete Listing"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        <ListingFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddListing}
          cryptoTypes={cryptoTypes}
        />
        
        <CryptoBuyModal
          isOpen={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          listing={selectedListing}
        />
      </div>
    </div>
  );
};

export default CryptoMarketplace;