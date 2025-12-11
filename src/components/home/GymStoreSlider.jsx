import React, { useState } from 'react';
import { ShoppingBag, Star, Package, Truck, Shield, Heart, Filter, ChevronRight } from 'lucide-react';

const GymStoreSlider = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wishlist, setWishlist] = useState([]);

  const categories = [
    { id: 'all', label: 'All Items', icon: '🛍️' },
    { id: 'equipment', label: 'Equipment', icon: '🏋️' },
    { id: 'apparel', label: 'Apparel', icon: '👕' },
    { id: 'supplements', label: 'Supplements', icon: '💊' },
    { id: 'accessories', label: 'Accessories', icon: '🎧' },
  ];

  const products = [
    {
      id: 1,
      name: "Adjustable Dumbbells",
      category: "equipment",
      price: "$299.99",
      originalPrice: "$399.99",
      rating: 4.8,
      reviews: 124,
      description: "5-50 lbs adjustable set",
      features: ["Quick Change", "Space Saving", "Durable"],
      imageColor: "from-gray-700 to-gray-900",
      icon: "🏋️",
      tags: ["Bestseller", "Sale"]
    },
    {
      id: 2,
      name: "Protein Powder",
      category: "supplements",
      price: "$49.99",
      originalPrice: "$59.99",
      rating: 4.9,
      reviews: 89,
      description: "Whey Protein Isolate",
      features: ["30g Protein", "Low Sugar", "Mixable"],
      imageColor: "from-blue-700 to-cyan-900",
      icon: "💪",
      tags: ["Popular", "Premium"]
    },
    {
      id: 3,
      name: "Yoga Mat",
      category: "accessories",
      price: "$34.99",
      originalPrice: "$44.99",
      rating: 4.7,
      reviews: 67,
      description: "Non-slip premium mat",
      features: ["Eco-friendly", "6mm Thick", "Carry Strap"],
      imageColor: "from-green-700 to-emerald-900",
      icon: "🧘",
      tags: ["Eco", "Sale"]
    },
    {
      id: 4,
      name: "Fitness Tracker",
      category: "accessories",
      price: "$199.99",
      originalPrice: null,
      rating: 4.6,
      reviews: 203,
      description: "Smart watch with HR monitor",
      features: ["24/7 Tracking", "Waterproof", "7-day Battery"],
      imageColor: "from-purple-700 to-pink-900",
      icon: "⌚",
      tags: ["Smart", "New"]
    },
    {
      id: 5,
      name: "Workout Shoes",
      category: "apparel",
      price: "$129.99",
      originalPrice: "$159.99",
      rating: 4.8,
      reviews: 156,
      description: "Cross-training shoes",
      features: ["Stable", "Breathable", "Lightweight"],
      imageColor: "from-red-700 to-orange-900",
      icon: "👟",
      tags: ["Bestseller"]
    },
    {
      id: 6,
      name: "Resistance Bands",
      category: "equipment",
      price: "$24.99",
      originalPrice: "$34.99",
      rating: 4.5,
      reviews: 98,
      description: "5-band set with handles",
      features: ["5 Levels", "Portable", "Versatile"],
      imageColor: "from-yellow-700 to-amber-900",
      icon: "🌀",
      tags: ["Portable", "Sale"]
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const toggleWishlist = (id) => {
    setWishlist(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">Gym Store</h3>
            <p className="text-gray-400">Premium fitness equipment and accessories</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-opacity">
            <ShoppingBag className="w-5 h-5" />
            Cart (3)
          </button>
        </div>

        {/* Store Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Premium Brands', value: '50+', icon: '🏷️' },
            { label: 'Products', value: '200+', icon: '📦' },
            { label: 'Happy Customers', value: '10K+', icon: '😊' },
            { label: 'Fast Delivery', value: '24-48h', icon: '🚚' },
          ].map((stat, index) => (
            <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-linear-to-r from-orange-600 to-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
        <button className="flex items-center gap-2 px-4 py-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Featured Product */}
      <div className="mb-8 bg-linear-to-br from-orange-900/20 to-yellow-900/20 rounded-2xl p-6 border border-orange-800/30">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            <div className={`h-64 rounded-2xl bg-linear-to-br from-orange-700 to-yellow-700 flex items-center justify-center`}>
              <span className="text-6xl">🏋️</span>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-2xl font-bold mb-2">Featured Product</h4>
                <h5 className="text-xl font-bold">Smart Home Gym System</h5>
                <p className="text-gray-300">All-in-one fitness solution with AI coaching</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">$999.99</div>
                <div className="text-sm text-gray-400 line-through">$1,299.99</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">Rating</span>
                </div>
                <div className="font-bold">4.9/5.0</div>
              </div>
              <div className="bg-black/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Delivery</span>
                </div>
                <div className="font-bold">Free Shipping</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-linear-to-r from-orange-600 to-yellow-600 rounded-xl hover:opacity-90 transition-opacity font-semibold">
                Add to Cart
              </button>
              <button className="px-4 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold">Products ({filteredProducts.length})</h4>
          <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option>Sort by: Featured</option>
            <option>Sort by: Price: Low to High</option>
            <option>Sort by: Price: High to Low</option>
            <option>Sort by: Rating</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800 hover:border-orange-500/30 transition-colors group">
              <div className="relative mb-4">
                <div className={`h-48 rounded-xl bg-linear-to-br ${product.imageColor} flex items-center justify-center`}>
                  <span className="text-5xl">{product.icon}</span>
                </div>
                
                {/* Tags */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-black/70 backdrop-blur-sm rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90"
                >
                  <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'text-red-400 fill-current' : 'text-white'}`} />
                </button>
              </div>

              <div className="mb-4">
                <h5 className="font-bold text-lg mb-2">{product.name}</h5>
                <p className="text-gray-400 text-sm mb-3">{product.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xl font-bold text-green-400">{product.price}</div>
                    {product.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">{product.originalPrice}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-xs text-gray-400">({product.reviews})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {product.features.map((feature, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-800 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group-hover:bg-linear-to-r group-hover:from-orange-600 group-hover:to-yellow-600">
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Store Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Free Shipping", desc: "On orders over $100", icon: <Truck className="w-6 h-6" /> },
          { title: "30-Day Returns", desc: "Hassle-free returns", icon: <Package className="w-6 h-6" /> },
          { title: "Secure Payment", desc: "SSL encrypted", icon: <Shield className="w-6 h-6" /> },
        ].map((feature, index) => (
          <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-r from-orange-600 to-yellow-600 rounded-lg">
                {feature.icon}
              </div>
              <div>
                <h5 className="font-semibold">{feature.title}</h5>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GymStoreSlider;
