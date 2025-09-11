import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllListings, addListing, removeListing } from '../redux/features/listings/listingSlice';
import ListingFormModal from '../components/ListingFormModal';
import BuyModal from '../components/BuyModal';
import { Plus, User, Trash2, DollarSign, ShoppingCart, Search, Filter, BarChart3, TrendingUp, Eye, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCondition, setFilterCondition] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [stats, setStats] = useState({
    totalListings: 0,
    averagePrice: 0,
    trendingItems: 0
  });
  
  const dispatch = useDispatch();
  const { listings, loading, error } = useSelector(state => state.listings);
  const { user, isLoggedIn } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchAllListings());
  }, [dispatch]);
  
  useEffect(() => {
    // Calculate dashboard statistics
    if (listings.length > 0) {
      const totalListings = listings.length;
      const totalPrice = listings.reduce((sum, item) => sum + parseFloat(item.price), 0);
      const averagePrice = totalPrice / totalListings;
      
      // Simple trending calculation (items with price below average considered trending)
      const trendingItems = listings.filter(item => parseFloat(item.price) < averagePrice).length;
      
      setStats({
        totalListings,
        averagePrice: averagePrice.toFixed(2),
        trendingItems
      });
    }
  }, [listings]);
  
  const handleAddListing = (listingData) => {
    dispatch(addListing(listingData)).unwrap()
      .then(() => {
        toast.success("Listing posted successfully!");
        setIsModalOpen(false);
      })
      .catch((err) => toast.error(err));
  };
  
  const handleDelete = (listingId, listingTitle) => {
    if (window.confirm(`Are you sure you want to delete "${listingTitle}"?`)) {
      dispatch(removeListing(listingId))
        .unwrap()
        .then(() => toast.success("Listing deleted."))
        .catch((err) => toast.error(err || 'Failed to delete listing.'));
    }
  };

  const handleBuyClick = (listing) => {
    if (!isLoggedIn) {
      toast.error("Please login to buy items");
      return;
    }
    if (user._id === listing.postedBy._id) {
      toast.error("You cannot buy your own item");
      return;
    }
    setSelectedListing(listing);
    setBuyModalOpen(true);
  };

  // Filter and sort listings
  const filteredListings = listings
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCondition = filterCondition === 'all' || item.condition === filterCondition;
      return matchesSearch && matchesCondition;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-500 text-lg">Error: {error}</p>
          <button 
            onClick={() => dispatch(fetchAllListings())}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Marketplace Dashboard</h1>
          <p className="text-green-600">Buy and sell items in our community marketplace</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Listings</p>
                <h3 className="text-2xl font-bold text-green-800">{stats.totalListings}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BarChart3 className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">+5% from last week</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 text-sm font-medium">Average Price</p>
                <h3 className="text-2xl font-bold text-green-800">${stats.averagePrice}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">+2.5% from last week</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 text-sm font-medium">Trending Items</p>
                <h3 className="text-2xl font-bold text-green-800">{stats.trendingItems}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">+12% from last week</p>
          </div>
        </div>
        
        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" size={20} />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-green-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-green-600" />
              <select 
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="border border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Conditions</option>
                <option value="new">New</option>
                <option value="like new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            
            <div className="flex gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'text-green-600'}`}
              >
                Grid
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-green-600'}`}
              >
                List
              </button>
            </div>
          </div>
          
          {isLoggedIn && (
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} /> Post Item
            </button>
          )}
        </div>
        
        {/* Listings */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-green-700 text-lg">No listings found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
            : "flex flex-col gap-4"
          }>
            {filteredListings.map(item => {
              const canDelete = isLoggedIn && (user?._id === item.postedBy?._id || user?.role === 'admin');
              const canBuy = isLoggedIn && user?._id !== item.postedBy?._id;
              
              return (
                <div 
                  key={item._id} 
                  className={viewMode === 'grid' 
                    ? "bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden relative group transition-transform hover:scale-[1.02]"
                    : "bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden relative group flex"
                  }
                >
                  {canDelete && (
                    <button 
                      onClick={() => handleDelete(item._id, item.title)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Delete Listing"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  
                  <div className={viewMode === 'grid' ? "p-4 flex flex-col h-full" : "p-4 flex flex-col flex-grow"}>
                    <div className={viewMode === 'grid' ? "" : "flex gap-4"}>
                      {viewMode === 'list' && (
                        <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="text-green-400" size={32} />
                        </div>
                      )}
                      
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-green-900">{item.title}</h3>
                        <p className="text-sm text-green-700 mt-1">{item.description.substring(0, viewMode === 'grid' ? 60 : 120)}...</p>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <span className="font-bold text-green-700 text-xl flex items-center">
                            <DollarSign size={18}/>{item.price}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {item.condition}
                          </span>
                        </div>
                        
                        <div className="text-xs text-green-600 mt-2 pt-2 border-t border-green-100 flex items-center gap-2">
                          <User size={12}/> {item.postedBy?.name || 'Member'}
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          {/* Buy Button */}
                          {canBuy && (
                            <button
                              onClick={() => handleBuyClick(item)}
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors flex-grow"
                            >
                              <ShoppingCart size={16} />
                              Buy Now
                            </button>
                          )}
                          
                          {!isLoggedIn && (
                            <div className="bg-gray-200 text-gray-500 py-2 px-4 rounded-lg text-center text-sm flex-grow">
                              Login to Buy
                            </div>
                          )}
                          
                          <div className="flex gap-1">
                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                              <Heart size={16} />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                              <Share2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <ListingFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddListing}
        />
        
        <BuyModal
          isOpen={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          listing={selectedListing}
        />
      </div>
    </div>
  );
};

export default Marketplace;