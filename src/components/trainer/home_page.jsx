import React, { useState } from 'react';
import { Dumbbell, Sparkles, Menu, X, CheckCircle, Users, Video, MessageSquare, ShoppingBag, User } from 'lucide-react';
import PendingRequests from './PendingRequests';
import ConfirmedClients from './ConfirmedClients';
import GymStore from '../home/GymStoreSlider';
import TrainerProfilePage from './TrainerProfilePage';

const TrainerHome = () => {
  const [activeSection, setActiveSection] = useState('requests');
  const [menuOpen, setMenuOpen] = useState(false);

  const sections = [
    { id: 'requests', label: 'Pending Requests', icon: '📋', color: 'from-orange-600 to-yellow-600', description: 'Manage client requests' },
    { id: 'clients', label: 'My Clients', icon: '👥', color: 'from-green-600 to-emerald-600', description: 'Active training sessions' },
    { id: 'store', label: 'Gym Store', icon: '🛒', color: 'from-blue-600 to-cyan-600', description: 'Equipment & supplements' },
    { id: 'profile', label: 'Profile', icon: '👤', color: 'from-purple-600 to-pink-600', description: 'Account settings' },
  ];

  const renderActiveComponent = () => {
    switch (activeSection) {
      case 'requests':
        return <PendingRequests />;
      case 'clients':
        return <ConfirmedClients />;
      case 'store':
        return <GymStore />;
      case 'profile':
        return <TrainerProfilePage />;
      default:
        return <PendingRequests />;
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
              <div className="p-2 bg-linear-to-r from-green-600 to-emerald-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">
                Trainer<span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-400">Pro</span>
              </h1>
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-green-900/30 rounded-full">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span className="text-sm text-gray-300">Trainer Dashboard</span>
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
                Welcome, <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-400">Trainer</span>
              </h2>
              <p className="text-gray-400">Manage your clients and training sessions</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button className="px-4 py-2 bg-linear-to-r from-green-600 to-emerald-600 rounded-xl hover:opacity-90 transition-opacity">
                Schedule Session
              </button>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Clients', value: '24', color: 'text-green-400', icon: '👥' },
              { label: 'Pending Requests', value: '8', color: 'text-orange-400', icon: '📋' },
              { label: 'Sessions Today', value: '6', color: 'text-blue-400', icon: '🎯' },
              { label: 'Monthly Earnings', value: '$3.2K', color: 'text-purple-400', icon: '💰' },
            ].map((stat, index) => (
              <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <span className="text-xl">{stat.icon}</span>
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
                  {sections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Component Content */}
          <div className="min-h-[500px]">
            {renderActiveComponent()}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex justify-center">
              <div className="flex gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      activeSection === section.id
                        ? `bg-linear-to-r ${section.color} text-white`
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span className="text-sm">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'New Session', icon: '➕', color: 'from-blue-600 to-cyan-600', onClick: () => alert('Create new session') },
            { label: 'Send Bulk Message', icon: '📢', color: 'from-purple-600 to-pink-600', onClick: () => alert('Send bulk message') },
            { label: 'View Schedule', icon: '📅', color: 'from-green-600 to-emerald-600', onClick: () => alert('View schedule') },
            { label: 'Analytics', icon: '📊', color: 'from-orange-600 to-yellow-600', onClick: () => alert('View analytics') },
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
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
            <p>© 2024 TrainerPro. Professional Training Platform</p>
            <p className="mt-2 text-sm">Trainer Dashboard v2.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrainerHome;