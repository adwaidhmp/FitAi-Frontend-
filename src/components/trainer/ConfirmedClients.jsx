import React, { useState } from 'react';
import { Video, MessageSquare, Phone, MoreVertical, Star, Calendar, Activity, Mail } from 'lucide-react';

const ConfirmedClients = () => {
  // eslint-disable-next-line no-unused-vars
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      plan: 'Premium',
      sessions: '12/24',
      nextSession: 'Today, 3:00 PM',
      progress: 75,
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      plan: 'Standard',
      sessions: '8/12',
      nextSession: 'Tomorrow, 10:00 AM',
      progress: 65,
      status: 'active'
    },
    {
      id: 3,
      name: 'Robert Brown',
      email: 'robert@example.com',
      plan: 'Premium',
      sessions: '18/24',
      nextSession: 'Jan 17, 2:00 PM',
      progress: 85,
      status: 'active'
    },
    {
      id: 4,
      name: 'Lisa Wong',
      email: 'lisa@example.com',
      plan: 'Basic',
      sessions: '4/8',
      nextSession: 'Jan 18, 4:00 PM',
      progress: 45,
      status: 'active'
    },
  ]);

  const [selectedClient, setSelectedClient] = useState(clients[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Clients List */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Active Clients ({clients.length})</h3>
          <input
            type="text"
            placeholder="Search clients..."
            className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedClient.id === client.id
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">{client.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{client.name}</h4>
                    <p className="text-sm text-gray-400">{client.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.plan === 'Premium'
                      ? 'bg-purple-500/20 text-purple-400'
                      : client.plan === 'Standard'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {client.plan}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Sessions: {client.sessions}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {client.nextSession}
                  </span>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${client.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{client.progress}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30">
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Details Panel */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-6">Client Details</h3>
        
        {selectedClient && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">{selectedClient.name.charAt(0)}</span>
              </div>
              <h4 className="text-xl font-bold">{selectedClient.name}</h4>
              <p className="text-gray-400">{selectedClient.email}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <Star className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-400 ml-2">4.0</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Plan</div>
                  <div className="font-semibold">{selectedClient.plan}</div>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Sessions</div>
                  <div className="font-semibold">{selectedClient.sessions}</div>
                </div>
              </div>

              <div className="bg-gray-900/50 p-3 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Next Session</div>
                <div className="font-semibold">{selectedClient.nextSession}</div>
              </div>

              <div className="bg-gray-900/50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-400">Progress</div>
                  <div className="text-sm font-semibold">{selectedClient.progress}%</div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${selectedClient.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                <Video className="w-4 h-4" />
                Video Call
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                <Calendar className="w-4 h-4" />
                Reschedule
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4" />
                More
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="font-semibold mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg transition-colors">
                  View Workout Plan
                </button>
                <button className="w-full text-left px-3 py-2 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg transition-colors">
                  Update Diet Plan
                </button>
                <button className="w-full text-left px-3 py-2 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg transition-colors">
                  Add Session Notes
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmedClients;