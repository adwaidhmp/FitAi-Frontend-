import React, { useState } from 'react';
import { Dumbbell, Sparkles, ChevronLeft, ChevronRight, Home as HomeIcon, Menu, X } from 'lucide-react';
import DietPlanSlider from './DietPlanSlider';
import ExerciseSlider from './ExerciseSlider';
import TrainerSlider from './TrainerSlider';
import GymStoreSlider from './GymStoreSlider';
import Profile from '../auth/profile';


const Home = () => {
  const [activeSection, setActiveSection] = useState('diet');
  const [menuOpen, setMenuOpen] = useState(false);

  const sections = [
    { id: 'diet', label: 'Diet Plans', icon: '🥗', color: 'from-green-600 to-emerald-600' },
    { id: 'exercise', label: 'Exercises', icon: '💪', color: 'from-blue-600 to-cyan-600' },
    { id: 'trainer', label: 'Trainers', icon: '👨‍🏫', color: 'from-purple-600 to-pink-600' },
    { id: 'gymstore', label: 'Gym Store', icon: '🛒', color: 'from-orange-600 to-yellow-600' },
    { id: 'profile', label: 'My Profile', icon: '👤', color: 'from-indigo-600 to-violet-600' },
  ];

  const renderActiveComponent = () => {
    switch (activeSection) {
      case 'diet':
        return <DietPlanSlider />;
      case 'exercise':
        return <ExerciseSlider />;
      case 'trainer':
        return <TrainerSlider />;
      case 'gymstore':
        return <GymStoreSlider />;
      case 'profile':
        return <Profile />;
      default:
        return <DietPlanSlider />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">
                Fit<span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">AI</span>
              </h1>
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-purple-900/30 rounded-full">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span className="text-sm text-gray-300">AI Powered</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 bg-gray-800/50 rounded-2xl p-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeSection === section.id
                      ? `bg-linear-to-r ${section.color} text-white shadow-lg`
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === section.id
                        ? `bg-linear-to-r ${section.color} text-white shadow-lg`
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome to Your <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">Fitness Hub</span>
              </h2>
              <p className="text-gray-400">AI-powered fitness solutions tailored for you</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button className="px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-opacity">
                Get AI Recommendations
              </button>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Users', value: '10K+', color: 'text-green-400' },
              { label: 'Workouts', value: '500+', color: 'text-blue-400' },
              { label: 'Diet Plans', value: '200+', color: 'text-purple-400' },
              { label: 'Expert Trainers', value: '50+', color: 'text-orange-400' },
            ].map((stat, index) => (
              <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="text-2xl font-bold mb-1">
                  <span className={stat.color}>{stat.value}</span>
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Component */}
        <div className="bg-linear-to-br from-gray-900 to-black rounded-3xl border border-gray-800 p-6 md:p-8 shadow-2xl">
          {/* Component Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-linear-to-r ${
                sections.find(s => s.id === activeSection)?.color
              }`}>
                <span className="text-2xl">
                  {sections.find(s => s.id === activeSection)?.icon}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {sections.find(s => s.id === activeSection)?.label}
                </h3>
                <p className="text-gray-400 text-sm">
                  Explore our curated collection
                </p>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Component Content */}
          <div className="min-h-[500px]">
            {renderActiveComponent()}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex justify-center">
              <div className="flex gap-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeSection === section.id
                        ? `bg-linear-to-r ${section.color}`
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={section.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'AI Workout Generator', icon: '🤖', color: 'from-blue-600 to-cyan-600' },
            { label: 'Nutrition Tracker', icon: '📊', color: 'from-green-600 to-emerald-600' },
            { label: 'Progress Analytics', icon: '📈', color: 'from-purple-600 to-pink-600' },
          ].map((action, index) => (
            <button
              key={index}
              className={`bg-linear-to-r ${action.color} rounded-xl p-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-semibold">{action.label}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">
            <p>© 2024 FitAI. All rights reserved.</p>
            <p className="mt-2 text-sm">AI-Powered Fitness & Nutrition Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
