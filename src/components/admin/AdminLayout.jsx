import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { logoutUser } from "../../redux/user_slices/authSlice";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    {
      path: "/admin/users",
      icon: <Users size={20} />,
      label: "User Management",
    },
    {
      path: "/admin/trainers",
      icon: <Dumbbell size={20} />,
      label: "Trainer Management",
    },
    {
      path: "/admin/premium-plans",
      icon: <CreditCard size={20} />,
      label: "Premium Plans",
    },
    {
      path: "/admin/settings",
      icon: <Settings size={20} />,
      label: "Settings",
    },
  ];

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X />
          </button>
        </div>

        <nav className="px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:ml-64 relative">
        {/* HEADER */}
        <header className="h-16 border-b border-gray-800 bg-black/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400"
          >
            <Menu />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
              <div className="p-1.5 bg-gray-800 rounded-full text-purple-400">
                <UserIcon size={16} />
              </div>
              <div className="text-sm">
                <div className="font-semibold">{user?.name || "Admin"}</div>
                <div className="text-xs text-gray-400 uppercase">
                  {user?.role || "ADMIN"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 bg-black">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
