import React, { useState } from 'react';
import { Play, Timer, Target, Award, Heart, Zap, ChevronRight, TrendingUp } from 'lucide-react';

const ExerciseSlider = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Exercises', icon: '💪' },
    { id: 'strength', label: 'Strength', icon: '🏋️' },
    { id: 'cardio', label: 'Cardio', icon: '🏃' },
    { id: 'yoga', label: 'Yoga', icon: '🧘' },
    { id: 'hiit', label: 'HIIT', icon: '⚡' },
  ];

  const exercises = [
    {
      id: 1,
      name: "Deadlift",
      category: "strength",
      difficulty: "Advanced",
      duration: "30 mins",
      calories: "250",
      muscles: ["Back", "Legs", "Glutes"],
      videoUrl: "#",
      rating: 4.8,
      icon: "🏋️"
    },
    {
      id: 2,
      name: "Running",
      category: "cardio",
      difficulty: "Beginner",
      duration: "45 mins",
      calories: "400",
      muscles: ["Legs", "Cardio"],
      videoUrl: "#",
      rating: 4.5,
      icon: "🏃"
    },
    {
      id: 3,
      name: "Sun Salutation",
      category: "yoga",
      difficulty: "Intermediate",
      duration: "20 mins",
      calories: "150",
      muscles: ["Full Body", "Flexibility"],
      videoUrl: "#",
      rating: 4.7,
      icon: "🧘"
    },
    {
      id: 4,
      name: "Burpees",
      category: "hiit",
      difficulty: "Advanced",
      duration: "15 mins",
      calories: "200",
      muscles: ["Full Body", "Cardio"],
      videoUrl: "#",
      rating: 4.6,
      icon: "⚡"
    },
    {
      id: 5,
      name: "Bench Press",
      category: "strength",
      difficulty: "Intermediate",
      duration: "40 mins",
      calories: "300",
      muscles: ["Chest", "Arms", "Shoulders"],
      videoUrl: "#",
      rating: 4.9,
      icon: "💪"
    }
  ];

  const filteredExercises = activeCategory === 'all' 
    ? exercises 
    : exercises.filter(ex => ex.category === activeCategory);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Exercise Library</h3>
        <p className="text-gray-400">Browse exercises by category and difficulty</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeCategory === category.id
                ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Featured Exercise */}
      <div className="mb-8 bg-linear-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-800/30">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-2xl font-bold">Workout of the Day</h4>
                <p className="text-gray-300">Full Body Strength Circuit</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-900/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <div className="font-bold">45 mins</div>
              </div>
              <div className="bg-blue-900/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Exercises</span>
                </div>
                <div className="font-bold">8</div>
              </div>
              <div className="bg-blue-900/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm">Calories</span>
                </div>
                <div className="font-bold">350</div>
              </div>
              <div className="bg-blue-900/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Difficulty</span>
                </div>
                <div className="font-bold">Medium</div>
              </div>
            </div>

            <button className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 rounded-xl hover:opacity-90 transition-opacity">
              <Play className="w-5 h-5" />
              Start Workout
            </button>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-black/50 rounded-xl p-4 h-full">
              <h5 className="font-semibold mb-3">Today's Focus</h5>
              <ul className="space-y-2">
                {['Warm-up (5 mins)', 'Strength Circuit (30 mins)', 'Cool Down (10 mins)'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold">Exercises ({filteredExercises.length})</h4>
          <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option>Sort by: Popular</option>
            <option>Sort by: Difficulty</option>
            <option>Sort by: Duration</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-blue-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{exercise.icon}</span>
                  <div>
                    <h5 className="font-semibold">{exercise.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded">
                        {exercise.difficulty}
                      </span>
                      <span className="text-xs text-gray-400">{exercise.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold">{exercise.rating}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Target Muscles</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {exercise.muscles.map((muscle, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-800 rounded">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-sm">{exercise.calories} cal</span>
                </div>
                <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add missing Flame icon component
const Flame = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

export default ExerciseSlider;
