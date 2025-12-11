import React, { useState } from 'react';
import { CheckCircle, XCircle, User, Clock, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

const PendingRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      age: 28,
      goal: 'Weight Loss',
      date: '2024-01-15',
      duration: '3 months',
      message: 'Looking for personalized training plan',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Sarah Miller',
      age: 32,
      goal: 'Muscle Gain',
      date: '2024-01-14',
      duration: '6 months',
      message: 'Need help with strength training',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Mike Chen',
      age: 25,
      goal: 'Athletic Performance',
      date: '2024-01-13',
      duration: '12 months',
      message: 'Training for marathon',
      status: 'pending'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      age: 35,
      goal: 'Rehabilitation',
      date: '2024-01-12',
      duration: '2 months',
      message: 'Post-injury recovery guidance',
      status: 'pending'
    },
  ]);

  const handleAccept = (id) => {
    setRequests(requests.filter(request => request.id !== id));
    alert('Request accepted! Client added to your list.');
  };

  const handleReject = (id) => {
    setRequests(requests.filter(request => request.id !== id));
    alert('Request rejected.');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Client Requests ({requests.length})</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors">
            Accept All
          </button>
          <button className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors">
            Reject All
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold mb-2">No Pending Requests</h4>
          <p className="text-gray-400">All requests have been processed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{request.name}</h4>
                    <p className="text-sm text-gray-400">{request.age} years • {request.goal}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                  Pending
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {request.message}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {request.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {request.duration}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;