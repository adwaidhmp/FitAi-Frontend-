import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  RefreshCw,
  Eye,
  ToggleLeft,
  ToggleRight,
  User as UserIcon,
  Shield,
  ShieldCheck,
  X
} from "lucide-react";
import {
  fetchUsers,
  updateUserStatus,
} from "../../redux/admin_slices/admin_user_trainer_approve";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loadingUsers } = useSelector((state) => state.admin);

  const [searchText, setSearchText] = useState("");
  const [filterActive, setFilterActive] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    let data = users;

    if (searchText) {
      const q = searchText.toLowerCase();
      data = data.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q)
      );
    }

    if (filterActive !== null) {
      data = data.filter((u) => u.is_active === filterActive);
    }

    return data;
  }, [users, searchText, filterActive]);

  const handleStatusChange = async (userId, is_active) => {
    try {
      await dispatch(updateUserStatus({ userId, is_active })).unwrap();
    } catch {
      // Error handled in slice/toast usually
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400 text-sm">
            Manage user accounts and roles
          </p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => dispatch(fetchUsers())}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                disabled={loadingUsers}
            >
                <RefreshCw size={20} className={loadingUsers ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-black border border-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="flex bg-black border border-gray-800 rounded-lg p-1">
          {[
            { label: "All", value: null },
            { label: "Active", value: true },
            { label: "Inactive", value: false },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilterActive(tab.value)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterActive === tab.value
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan="5" className="p-8 text-center text-gray-500">
                       No users found.
                   </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.is_active ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                            <UserIcon size={20} />
                        </div>
                        <div>
                            <div className="font-medium text-white">{user.name || "Unknown"}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            user.role === 'admin' ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                            user.role === 'trainer' ? 'bg-purple-900/20 text-purple-400 border-purple-900/30' :
                            'bg-gray-800 text-gray-300 border-gray-700'
                        }`}>
                            {user.role === 'admin' ? <ShieldCheck size={12}/> : <UserIcon size={12}/>}
                            {user.role?.toUpperCase()}
                        </span>
                    </td>
                    <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                        }`}>
                            {user.is_active ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                        {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                        <button
                            onClick={() => handleStatusChange(user.id, !user.is_active)}
                            className={`p-2 hover:bg-gray-700 rounded-lg transition-colors ${user.is_active ? 'text-green-400 hover:text-red-400' : 'text-gray-500 hover:text-green-400'}`}
                        >
                            {user.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        </div>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
              <h3 className="text-lg font-bold text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-center mb-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl ${selectedUser.is_active ? 'bg-blue-900/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                        {selectedUser.name?.[0]?.toUpperCase() || <UserIcon size={32}/>}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Name</span>
                        <span className="text-white font-medium">{selectedUser.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Email</span>
                        <span className="text-white font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Role</span>
                        <span className="text-white font-medium capitalize">{selectedUser.role}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Status</span>
                        <span className={selectedUser.is_active ? "text-green-400" : "text-red-400"}>
                            {selectedUser.is_active ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Joined</span>
                        <span className="text-white font-medium">
                            {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : "-"}
                        </span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
