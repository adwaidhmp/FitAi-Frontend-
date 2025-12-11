import React, { useState } from 'react';
import { Leaf, Flame, Clock, Star, ChevronRight, TrendingUp, Heart } from 'lucide-react';

const DietPlanSlider = () => {
  const [activePlan, setActivePlan] = useState(0);

  const dietPlans = [
    {
      id: 1,
      name: "Keto Fat Burn",
      description: "High-fat, low-carb plan for rapid fat loss",
      duration: "30 days",
      calories: "1500/day",
      difficulty: "Medium",
      rating: 4.7,
      features: ["Fat Burning", "Energy Boost", "No Sugar"],
      color: "from-green-600 to-emerald-600",
      icon: <Flame className="w-6 h-6" />
    },
    {
      id: 2,
      name: "Muscle Builder",
      description: "High-protein diet for muscle growth",
      duration: "45 days",
      calories: "2500/day",
      difficulty: "Hard",
      rating: 4.9,
      features: ["Protein Rich", "Mass Gain", "Strength"],
      color: "from-blue-600 to-cyan-600",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      id: 3,
      name: "Vegan Cleanse",
      description: "Plant-based detox and energy plan",
      duration: "21 days",
      calories: "1800/day",
      difficulty: "Easy",
      rating: 4.5,
      features: ["Plant Based", "Detox", "Energy"],
      color: "from-lime-600 to-green-600",
      icon: <Leaf className="w-6 h-6" />
    },
    {
      id: 4,
      name: "Mediterranean",
      description: "Heart-healthy Mediterranean diet",
      duration: "60 days",
      calories: "2000/day",
      difficulty: "Easy",
      rating: 4.8,
      features: ["Heart Health", "Balanced", "Long-term"],
      color: "from-yellow-600 to-orange-600",
      icon: <Heart className="w-6 h-6" />
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Personalized Diet Plans</h3>
        <p className="text-gray-400">AI-generated nutrition plans based on your goals</p>
      </div>

      {/* Main Plan Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Plan */}
        <div className={`bg-linear-to-br ${dietPlans[activePlan].color} rounded-2xl p-6 relative overflow-hidden`}>
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
            Featured
          </div>
          
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 rounded-xl">
                {dietPlans[activePlan].icon}
              </div>
              <div>
                <h4 className="text-2xl font-bold">{dietPlans[activePlan].name}</h4>
                <p className="text-white/90">{dietPlans[activePlan].description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <div className="font-bold">{dietPlans[activePlan].duration}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm">Calories</span>
                </div>
                <div className="font-bold">{dietPlans[activePlan].calories}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">{dietPlans[activePlan].rating}</span>
                <span className="text-sm text-white/80">Rating</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dietPlans[activePlan].features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              Start This Plan
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Plan List */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold mb-4">Other Plans</h4>
          
          {dietPlans.map((plan, index) => (
            <button
              key={plan.id}
              onClick={() => setActivePlan(index)}
              className={`w-full p-4 rounded-xl border transition-all ${
                activePlan === index
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-linear-to-r ${plan.color}`}>
                    {plan.icon}
                  </div>
                  <div className="text-left">
                    <h5 className="font-semibold">{plan.name}</h5>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{plan.duration}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "AI Nutritionist", desc: "Personalized meal plans", icon: "🤖" },
          { title: "Grocery Lists", desc: "Auto-generated shopping lists", icon: "🛒" },
          { title: "Progress Tracking", desc: "Track your nutrition journey", icon: "📊" },
        ].map((feature, index) => (
          <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{feature.icon}</span>
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

export default DietPlanSlider;
